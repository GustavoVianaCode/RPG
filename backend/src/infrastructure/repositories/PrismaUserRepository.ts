import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { prisma } from "../database/prismaClient";

export class PrismaUserRepository implements IUserRepository {
  async create(
    data: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    try {
      console.log("PrismaUserRepository.create - attempting to create user:", {
        username: data.username,
        email: data.email
      });
      
      const user = await prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          passwordHash: data.passwordHash,
        },
      });
      
      console.log("PrismaUserRepository.create - user created successfully:", {
        id: user.id,
        username: user.username,
        email: user.email
      });
      
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: user.passwordHash,
        googleId: user.googleId ?? undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("PrismaUserRepository.create - error creating user:", error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      googleId: user.googleId ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      googleId: user.googleId ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      googleId: user.googleId ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
