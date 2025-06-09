import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

// Carrega as variáveis de ambiente de .env
dotenv.config();

// Garante que a variável exista (ou defina um fallback vazio)
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export class JwtProvider {
  public static sign(
    payload: string | object | Buffer,
    expiresIn: string = "20d"
  ): string {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET não está definido em process.env");
    }

    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, JWT_SECRET, options);
  }

  public static verify<T = any>(token: string): T {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET não está definido em process.env");
    }
    return jwt.verify(token, JWT_SECRET) as T;
  }
}
