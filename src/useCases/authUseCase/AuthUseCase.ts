import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IAuthEngine } from "../../engines/authEngine/IAuthEngine";
import { User } from "../../domain/entities/User";
import { ApiError } from "../../domain/errors/ApiError";
import ErrorCode from "../../domain/enums/ErrorCodes";
import { ErrorUseCase } from "../../domain/enums/ErrorUseCase";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export class AuthUseCase {
  private authEngine: IAuthEngine;

  constructor({ AuthEngine }: { AuthEngine: IAuthEngine }) {
    this.authEngine = AuthEngine;
  }

  async executeLogin(
    email: string,
    password: string,
    gqlToken: string
  ): Promise<{ token: string; user: Partial<User> }> {
    const user = await this.authEngine.getUserByEmail(email, gqlToken);

    if (!user) {
      throw new ApiError("Invalid credentials", ErrorUseCase.AuthenticationError, ErrorCode.Unauthorized);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new ApiError("Invalid credentials", ErrorUseCase.AuthenticationError, ErrorCode.Unauthorized);
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
