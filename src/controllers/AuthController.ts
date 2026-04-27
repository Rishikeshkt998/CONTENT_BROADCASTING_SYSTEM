import { Request, Response } from "express";
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

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const gqlToken = this.getGqlToken(req);
      const result = await this.authUseCase.executeLogin(
        email,
        password,
        gqlToken
      );

      res.json({
        message: "Login successful",
        token: result.token,
        user: result.user,
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        res.status(error.code).json({ error: error.message });
        return;
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
