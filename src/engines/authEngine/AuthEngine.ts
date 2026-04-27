import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../repositories/userRepository/IUserRepository";
import { QUERY_GET_USER } from "../../infrastructure/models/user/GET_USER";
import { IAuthEngine } from "./IAuthEngine";

type AuthEngineConstructorParams = {
  UserRepository: IUserRepository;
};

export default class AuthEngine implements IAuthEngine {
  private userRepository: IUserRepository;

  constructor({ UserRepository }: AuthEngineConstructorParams) {
    this.userRepository = UserRepository;
  }

  async getUserByEmail(email: string, gqlToken: string): Promise<User | null> {
    return this.userRepository.findByEmail(
      QUERY_GET_USER,
      { email },
      gqlToken
    );
  }
}
