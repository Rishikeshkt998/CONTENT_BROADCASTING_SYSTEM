import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IAuthEngine } from "../../engines/authEngine/IAuthEngine";
import { User } from "../../domain/entities/User";
import { ApiError } from "../../domain/errors/ApiError";
import ErrorCode from "../../domain/enums/ErrorCodes";
import { ErrorUseCase } from "../../domain/enums/ErrorUseCase";
import LoginSchema from "../../infrastructure/validation/auth/LoginSchema";
import RegisterSchema from "../../infrastructure/validation/auth/RegisterSchema";

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
    await LoginSchema.validate({ email, password }, {
      abortEarly: false,
      strict: true,
    }).catch((error) => {
      throw new ApiError(
        "Invalid Payload",
        ErrorUseCase.AuthenticationError,
        ErrorCode.PayloadError,
        error.errors
      );
    });

    const user = await this.authEngine.getUserByEmail(email, gqlToken);

    if (!user) {
      throw new ApiError("Invalid credentials", ErrorUseCase.AuthenticationError, ErrorCode.Unauthorized);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
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

  async register(
    userData: { name: string; email: string; password: string; role: string },
    gqlToken: string
  ): Promise<Partial<User>> {
    await RegisterSchema.validate(userData, {
      abortEarly: false,
      strict: true,
    }).catch((error) => {
      throw new ApiError(
        "Invalid Payload",
        ErrorUseCase.AuthenticationError,
        ErrorCode.PayloadError,
        error.errors
      );
    });

    const existingUser = await this.authEngine.getUserByEmail(userData.email, gqlToken);
    if (existingUser) {
      throw new ApiError("User already exists", ErrorUseCase.AuthenticationError, ErrorCode.Conflict);
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);
    const user = await this.authEngine.registerUser(
      {
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
      },
      gqlToken
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
