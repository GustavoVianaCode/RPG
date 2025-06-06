import { MockUserRepository } from "../repositories/MockUserRepository";
import { MockCharacterSheetRepository } from "../repositories/MockCharacterSheetRepository";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository";
import { PrismaCharacterSheetRepository } from "../repositories/PrismaCharacterSheetRepository";

// Change to use the Prisma repositories for persistence
export const userRepository = new PrismaUserRepository();
export const characterSheetRepository = new PrismaCharacterSheetRepository();