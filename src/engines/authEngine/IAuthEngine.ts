import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../repositories/userRepository/IUserRepository";

export interface IAuthEngine {
  getUserByEmail(email: string, gqlToken: string): Promise<User | null>;
}
