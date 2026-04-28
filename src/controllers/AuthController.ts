import express, { Request, Response } from "express";
import { AuthUseCase } from "../useCases/authUseCase/AuthUseCase";
import { ApiError } from "../domain/errors/ApiError";

type AuthControllerConstructorParams = {
  AuthUseCase: AuthUseCase;
};

export default class AuthController {
  private authUseCase: AuthUseCase;

  constructor({ AuthUseCase }: AuthControllerConstructorParams) {
    this.authUseCase = AuthUseCase;
  }

  private getGqlToken(req: Request): string {
    return req.headers.authorization || "";
  }

  async login(req: Request, res: Response, next: express.NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const gqlToken = this.getGqlToken(req);
      const result = await this.authUseCase.executeLogin(
        email,
        password,
        gqlToken
      );

      res.status(200).json({
        status: true,
        message: "Login successful",
        data: {
          token: result.token,
          user: result.user,
        }
      });
    } catch (error: any) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: express.NextFunction): Promise<void> {
    try {
      const { name, email, password, role } = req.body;
      const gqlToken = this.getGqlToken(req);
      const user = await this.authUseCase.register(
        { name, email, password, role },
        gqlToken
      );

      res.status(201).json({
        status: true,
        message: "User registered successfully",
        data: {
          user,
        }
      });
    } catch (error: any) {
      next(error);
    }
  }
}
