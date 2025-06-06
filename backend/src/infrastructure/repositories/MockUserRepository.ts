import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { v4 as uuidv4 } from "uuid";

/**
 * This is a mock repository that stores data in memory.
 * Use this for development/testing when the real database is not available.
 */
export class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  async create(
    data: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    const now = new Date();
    const newUser: User = {
      id: uuidv4(),
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      googleId: data.googleId,
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(newUser);
    return newUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.users.find((user) => user.username === username) || null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null;
  }
}