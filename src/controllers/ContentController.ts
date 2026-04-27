import { Request, Response } from "express";
import { AuthRequest } from "../infrastructure/middleware/auth";
import { ContentUseCase } from "../useCases/contentUseCase/ContentUseCase";
import { ApiError } from "../domain/errors/ApiError";
import { ContentStatus } from "../domain/enums/ContentStatus";

type ContentControllerConstructorParams = {
  ContentUseCase: ContentUseCase;
};

export default class ContentController {
  private contentUseCase: ContentUseCase;

  constructor({ ContentUseCase }: ContentControllerConstructorParams) {
    this.contentUseCase = ContentUseCase;
  }

  private getGqlToken(req: Request): string {
    return req.headers.authorization || "";
  }

  async uploadContent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        title,
        subject,
        description,
        start_time,
        end_time,
        rotation_duration,
      } = req.body;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: "File is required" });
        return;
      }
      if (!title || !subject) {
        res.status(400).json({ error: "Title and subject are mandatory" });
        return;
      }

      const gqlToken = this.getGqlToken(req as Request);
      const content = await this.contentUseCase.uploadContent(
        {
          title,
          description,
          subject,
          fileUrl: `/uploads/${file.filename}`,
          fileType: file.mimetype,
          fileSize: file.size,
          uploadedBy: req.user?.id as number,
          status: ContentStatus.PENDING,
          startTime: start_time || null,
          endTime: end_time || null,
          rotationDuration: rotation_duration
            ? parseInt(rotation_duration)
            : null,
        },
        gqlToken
      );
      res.status(201).json({ message: "Content uploaded successfully", content });
    } catch (error: any) {
      if (error instanceof ApiError) {
        res.status(error.code).json({ error: error.message });
        return;
      }
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getContentList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const gqlToken = this.getGqlToken(req as Request);
      const contents = await this.contentUseCase.getContentList(
        req.user?.role as string,
        req.user?.id as number,
        gqlToken
      );
      res.json({ content: contents });
    } catch (error: any) {
      if (error instanceof ApiError) {
        res.status(error.code).json({ error: error.message });
        return;
      }
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async approveContent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const gqlToken = this.getGqlToken(req as Request);
      const content = await this.contentUseCase.approveContent(
        id,
        req.user?.id as number,
        gqlToken
      );
      res.json({ message: "Content approved", content });
    } catch (error: any) {
      if (error instanceof ApiError) {
        res.status(error.code).json({ error: error.message });
        return;
      }
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async rejectContent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      if (!reason) {
        res.status(400).json({ error: "Rejection reason is required" });
        return;
      }
      const gqlToken = this.getGqlToken(req as Request);
      const content = await this.contentUseCase.rejectContent(
        id,
        reason,
        gqlToken
      );
      res.json({ message: "Content rejected", content });
    } catch (error: any) {
      if (error instanceof ApiError) {
        res.status(error.code).json({ error: error.message });
        return;
      }
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getLiveContent(req: Request, res: Response): Promise<void> {
    try {
      const { teacherId } = req.params;
      const { subject } = req.query;
      const gqlToken = this.getGqlToken(req);

      const contents = await this.contentUseCase.getLiveContent(
        parseInt(teacherId),
        gqlToken,
        subject as string | undefined
      );

      if (contents.length === 0) {
        res.json({ message: "No content available" });
        return;
      }
      res.json({ content: contents });
    } catch (error: any) {
      if (error instanceof ApiError) {
        res.status(error.code).json({ error: error.message });
        return;
      }
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
