import { IContentEngine } from "../../engines/contentEngine/IContentEngine";
import { Content } from "../../domain/entities/Content";
import { ContentStatus } from "../../domain/enums/ContentStatus";
import { CreateContentVariablesDto } from "../../domain/dtos/content/CreateContentVariablesDto";
import { GetContentVariablesDto } from "../../domain/dtos/content/GetContentVariablesDto";
import { ApiError } from "../../domain/errors/ApiError";
import ErrorCode from "../../domain/enums/ErrorCodes";
import { ErrorUseCase } from "../../domain/enums/ErrorUseCase";

import { RedisService } from "../../infrastructure/services/redis/RedisService";
import { S3Service } from "../../infrastructure/services/s3/S3Service";

export class ContentUseCase {
  private contentEngine: IContentEngine;
  private redisService: RedisService;
  private s3Service: S3Service;

  constructor({ ContentEngine, RedisService, S3Service }: { 
    ContentEngine: IContentEngine; 
    RedisService: RedisService;
    S3Service: S3Service;
  }) {
    this.contentEngine = ContentEngine;
    this.redisService = RedisService;
    this.s3Service = S3Service;
  }

  private async resolveFileUrls(contents: Content[]): Promise<Content[]> {
    if (process.env.STORAGE_TYPE !== "s3") return contents;

    return Promise.all(
      contents.map(async (item) => {
        if (item.fileUrl && !item.fileUrl.startsWith("http")) {
          const signedUrl = await this.s3Service.getSignedFileUrl(item.fileUrl);
          return { ...item, fileUrl: signedUrl };
        }
        return item;
      })
    );
  }

  async uploadContent(
    variables: CreateContentVariablesDto,
    gqlToken: string
  ): Promise<Content> {
    try {
      return await this.contentEngine.createContent(variables, gqlToken);
    } catch (error) {
      throw new ApiError("Failed to upload content", ErrorUseCase.UploadError, ErrorCode.InternalError);
    }
  }

  async getContentList(
    userRole: string,
    userId: string,
    gqlToken: string
  ): Promise<Content[]> {
    const queryVariables: GetContentVariablesDto =
      userRole === "principal" ? {} : { uploadedBy: userId };

    const result = await this.contentEngine.getContent(queryVariables, gqlToken);
    return this.resolveFileUrls(result.data);
  }

  async approveContent(
    id: string,
    approvedBy: string,
    gqlToken: string
  ): Promise<Content> {
    const content = await this.contentEngine.approveContent(id, approvedBy, gqlToken);
    if (!content) throw new ApiError("Content not found", ErrorUseCase.DatabaseError, ErrorCode.NotFound);
    return content;
  }

  async rejectContent(
    id: string,
    rejectionReason: string,
    gqlToken: string
  ): Promise<Content> {
    const content = await this.contentEngine.rejectContent(id, rejectionReason, gqlToken);
    if (!content) throw new ApiError("Content not found", ErrorUseCase.DatabaseError, ErrorCode.NotFound);
    return content;
  }

  async getLiveContent(
    teacherId: string,
    gqlToken: string,
    subject?: string
  ): Promise<Content[]> {
    const cacheKey = `live_content:${teacherId}:${subject || "all"}`;
    
    try {
      const cached = await this.redisService.getValue(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        return this.contentEngine.resolveLiveContentRotation(data);
      }
    } catch (e) {
      // Fallback to DB if Redis fails
    }

    const now = new Date().toISOString();
    const variables: GetContentVariablesDto = {
      uploadedBy: teacherId,
      status: ContentStatus.APPROVED,
      startTimeLte: now,
      endTimeGte: now,
      ...(subject && { subject }),
    };

    const result = await this.contentEngine.getContent(variables, gqlToken);
    
    if (result.data.length > 0) {
      try {
        await this.redisService.setValue(cacheKey, JSON.stringify(result.data), 60); // Cache for 60 seconds
      } catch (e) {
        // Log error but don't fail the request
      }
    }

    if (result.data.length === 0) return [];
    
    const signedData = await this.resolveFileUrls(result.data);
    return this.contentEngine.resolveLiveContentRotation(signedData);
  }
}
