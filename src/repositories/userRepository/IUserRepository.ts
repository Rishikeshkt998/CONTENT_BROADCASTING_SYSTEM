import { User } from "../../domain/entities/User";
import { GetUserVariablesDto } from "../../domain/dtos/user/GetUserVariablesDto";

export interface IUserRepository {
  findByEmail(
    gqlQuery: string,
    variables: GetUserVariablesDto,
    token: string
  ): Promise<User | null>;
}
