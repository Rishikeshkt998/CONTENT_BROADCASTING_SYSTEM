import { Content } from "../../domain/entities/Content";
import { CreateContentVariablesDto } from "../../domain/dtos/content/CreateContentVariablesDto";
import { GetContentVariablesDto } from "../../domain/dtos/content/GetContentVariablesDto";
import { GetContentResponseDto } from "../../domain/dtos/content/GetContentResponseDto";

export interface IContentEngine {
  getContent(variables: GetContentVariablesDto, gqlToken: string): Promise<GetContentResponseDto>;
  createContent(variables: CreateContentVariablesDto, gqlToken: string): Promise<Content>;
  approveContent(id: string, approvedBy: string, gqlToken: string): Promise<Content | null>;
  rejectContent(id: string, rejectionReason: string, gqlToken: string): Promise<Content | null>;
  resolveLiveContentRotation(liveContents: Content[]): Content[];
}
