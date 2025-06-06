import { Request, Response, NextFunction } from "express";
import { userRepository } from "../../infrastructure/database/mockRepositories";
import { RegisterUserUseCase } from "../../application/use-cases/RegisterUserUseCase";
import { LoginUserUseCase } from "../../application/use-cases/LoginUserUseCase";
import { AppError } from "../../application/errors/AppError";

export class AuthController {  public static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {      const { username, email, password } = req.body;
      const registerUseCase = new RegisterUserUseCase(userRepository);

      const result = await registerUseCase.execute({
        username,
        email,
        password,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err); // Passa o erro para o middleware de tratamento de erros
    }
  }
  public static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {      const { emailOrUsername, password } = req.body;
      const loginUseCase = new LoginUserUseCase(userRepository);

      const result = await loginUseCase.execute({ emailOrUsername, password });
      res.json(result); // { token, user }
    } catch (err) {
      next(err); // Passa o erro para o middleware de tratamento de erros
    }
  }
}