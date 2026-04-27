import { gql } from "@apollo/client/core";
import { IContentRepository } from "./IContentRepository";
import { Content } from "../../domain/entities/Content";
import { GetContentVariablesDto } from "../../domain/dtos/content/GetContentVariablesDto";
import { CreateContentVariablesDto } from "../../domain/dtos/content/CreateContentVariablesDto";
import { ApproveContentVariablesDto } from "../../domain/dtos/content/ApproveContentVariablesDto";
import { RejectContentVariablesDto } from "../../domain/dtos/content/RejectContentVariablesDto";
import { GetContentResponseDto } from "../../domain/dtos/content/GetContentResponseDto";
import apolloClient from "../../infrastructure/config/ApolloClient";
import logger from "../../infrastructure/logging/winston/AppLogger";

export default class ContentRepository implements IContentRepository {
  async list(
    gqlQuery: string,
    variables: GetContentVariablesDto,
    token: string
  ): Promise<GetContentResponseDto> {
    try {
      const client = apolloClient(token);
      const result = await client.query({
        query: gql`
          ${gqlQuery}
        `,
        variables,
      });
      if (!result) throw new Error("Failed to fetch content from graphql");
      const response: GetContentResponseDto = {
        data: result.data?.result?.nodes ?? [],
        totalCount: result.data?.result?.totalCount,
      };
      return response;
    } catch (error) {
      logger.error("[CONTENT_REPOSITORY_LIST_ERROR] " + error);
      throw new Error("[CONTENT_REPOSITORY_LIST_ERROR] " + error);
    }
  }

  async create(
    gqlQuery: string,
    variables: CreateContentVariablesDto,
    token: string
  ): Promise<Content> {
    try {
      const client = apolloClient(token);
      const result = await client.mutate({
        mutation: gql`
          ${gqlQuery}
        `,
        variables,
      });
      if (!result) throw new Error("Failed to create content from graphql");
      return result.data?.result?.content;
    } catch (error) {
      logger.error("[CONTENT_REPOSITORY_CREATE_ERROR] " + error);
      throw new Error("[CONTENT_REPOSITORY_CREATE_ERROR] " + error);
    }
  }

  async approve(
    gqlQuery: string,
    variables: ApproveContentVariablesDto,
    token: string
  ): Promise<Content | null> {
    try {
      const client = apolloClient(token);
      const result = await client.mutate({
        mutation: gql`
          ${gqlQuery}
        `,
        variables,
      });
      if (!result) throw new Error("Failed to approve content from graphql");
      return result.data?.result?.content ?? null;
    } catch (error) {
      logger.error("[CONTENT_REPOSITORY_APPROVE_ERROR] " + error);
      throw new Error("[CONTENT_REPOSITORY_APPROVE_ERROR] " + error);
    }
  }

  async reject(
    gqlQuery: string,
    variables: RejectContentVariablesDto,
    token: string
  ): Promise<Content | null> {
    try {
      const client = apolloClient(token);
      const result = await client.mutate({
        mutation: gql`
          ${gqlQuery}
        `,
        variables,
      });
      if (!result) throw new Error("Failed to reject content from graphql");
      return result.data?.result?.content ?? null;
    } catch (error) {
      logger.error("[CONTENT_REPOSITORY_REJECT_ERROR] " + error);
      throw new Error("[CONTENT_REPOSITORY_REJECT_ERROR] " + error);
    }
  }
}
