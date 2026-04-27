import { Content } from "../../domain/entities/Content";
import { GetContentVariablesDto } from "../../domain/dtos/content/GetContentVariablesDto";
import { CreateContentVariablesDto } from "../../domain/dtos/content/CreateContentVariablesDto";
import { ApproveContentVariablesDto } from "../../domain/dtos/content/ApproveContentVariablesDto";
import { RejectContentVariablesDto } from "../../domain/dtos/content/RejectContentVariablesDto";
import { GetContentResponseDto } from "../../domain/dtos/content/GetContentResponseDto";

export interface IContentRepository {
  list(
    gqlQuery: string,
    variables: GetContentVariablesDto,
    token: string
  ): Promise<GetContentResponseDto>;

  create(
    gqlQuery: string,
    variables: CreateContentVariablesDto,
    token: string
  ): Promise<Content>;

  approve(
    gqlQuery: string,
    variables: ApproveContentVariablesDto,
    token: string
  ): Promise<Content | null>;

  reject(
    gqlQuery: string,
    variables: RejectContentVariablesDto,
    token: string
  ): Promise<Content | null>;
}
