import { gql } from "@apollo/client/core";
import { IUserRepository } from "./IUserRepository";
import { User } from "../../domain/entities/User";
import { GetUserVariablesDto } from "../../domain/dtos/user/GetUserVariablesDto";
import apolloClient from "../../infrastructure/config/ApolloClient";
import logger from "../../infrastructure/logging/winston/AppLogger";

export default class UserRepository implements IUserRepository {
  async findByEmail(
    gqlQuery: string,
    variables: GetUserVariablesDto,
    token: string
  ): Promise<User | null> {
    try {
      const client = apolloClient(token);
      const result = await client.query({
        query: gql`
          ${gqlQuery}
        `,
        variables,
      });
      if (!result) throw new Error("Failed to fetch user from graphql");
      const nodes = result.data?.result?.nodes;
      if (!nodes || nodes.length === 0) return null;
      return nodes[0] as User;
    } catch (error) {
      logger.error("[USER_REPOSITORY_FIND_BY_EMAIL_ERROR] " + error);
      throw new Error("[USER_REPOSITORY_FIND_BY_EMAIL_ERROR] " + error);
    }
  }

  async create(
    gqlMutation: string,
    variables: any,
    token: string
  ): Promise<User> {
    try {
      const client = apolloClient(token);
      const result = await client.mutate({
        mutation: gql`
          ${gqlMutation}
        `,
        variables,
      });
      if (!result) throw new Error("Failed to create user in graphql");
      return result.data?.result?.user as User;
    } catch (error) {
      logger.error("[USER_REPOSITORY_CREATE_ERROR] " + error);
      throw new Error("[USER_REPOSITORY_CREATE_ERROR] " + error);
    }
  }
}
