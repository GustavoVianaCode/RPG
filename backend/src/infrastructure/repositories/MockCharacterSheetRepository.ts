import { ICharacterSheetRepository } from "../../domain/repositories/ICharacterSheetRepository";
import { CharacterSheet } from "../../domain/entities/CharacterSheet";
import { v4 as uuidv4 } from "uuid";

/**
 * This is a mock repository that stores data in memory.
 * Use this for development/testing when the real database is not available.
 */
export class MockCharacterSheetRepository implements ICharacterSheetRepository {
  private sheets: CharacterSheet[] = [];

  async create(
    data: Omit<CharacterSheet, "id" | "createdAt" | "updatedAt">
  ): Promise<CharacterSheet> {
    const now = new Date();
    const newSheet: CharacterSheet = {
      id: uuidv4(),
      userId: data.userId,
      characterName: data.characterName,
      className: data.className,
      race: data.race,
      characterImageUrl: data.characterImageUrl,
      strength: data.strength,
      dexterity: data.dexterity,
      constitution: data.constitution,
      intelligence: data.intelligence,
      wisdom: data.wisdom,
      charisma: data.charisma,
      createdAt: now,
      updatedAt: now,
    };

    this.sheets.push(newSheet);
    return newSheet;
  }

  async findById(id: string): Promise<CharacterSheet | null> {
    return this.sheets.find((sheet) => sheet.id === id) || null;
  }

  async findAllByUserId(userId: string): Promise<CharacterSheet[]> {
    return this.sheets.filter((sheet) => sheet.userId === userId);
  }

  async update(
    id: string,
    data: Partial<
      Omit<CharacterSheet, "id" | "userId" | "createdAt" | "updatedAt">
    >
  ): Promise<CharacterSheet> {
    const sheetIndex = this.sheets.findIndex((sheet) => sheet.id === id);
    if (sheetIndex === -1) {
      throw new Error("Character sheet not found");
    }

    const updatedSheet = {
      ...this.sheets[sheetIndex],
      ...data,
      updatedAt: new Date(),
    };

    this.sheets[sheetIndex] = updatedSheet;
    return updatedSheet;
  }

  async delete(id: string): Promise<void> {
    const sheetIndex = this.sheets.findIndex((sheet) => sheet.id === id);
    if (sheetIndex !== -1) {
      this.sheets.splice(sheetIndex, 1);
    }
  }
}