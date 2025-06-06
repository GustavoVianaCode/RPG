import { Request, Response, NextFunction } from "express";
import { characterSheetRepository } from "../../infrastructure/database/mockRepositories";
import { CreateCharacterSheetUseCase } from "../../application/use-cases/CreateCharacterSheetUseCase";
import { AppError } from "../../application/errors/AppError";

export class CharacterSheetController {
  public static async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // req.user.id foi preenchido pelo middleware ensureAuthenticated
      const userId = req.user.id;
      const {
        characterName,
        className,
        race,
        characterImageUrl,
        strength,
        dexterity,
        constitution,
        intelligence,
        wisdom,
        charisma,
      } = req.body;

      const createUseCase = new CreateCharacterSheetUseCase(characterSheetRepository);

      const sheet = await createUseCase.execute({
        userId,
        characterName,
        className,
        race,
        characterImageUrl,
        strength: Number(strength),
        dexterity: Number(dexterity),
        constitution: Number(constitution),
        intelligence: Number(intelligence),
        wisdom: Number(wisdom),
        charisma: Number(charisma),
      });

      res.status(201).json(sheet);
    } catch (err) {
      next(err); // Passa o erro para o middleware de tratamento de erros
    }
  }

  public static async listByUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user.id;
      const sheets = await characterSheetRepository.findAllByUserId(userId);
      res.json(sheets);
    } catch (err) {
      next(err); // Passa o erro para o middleware de tratamento de erros
    }
  }

  public static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user.id;
      const sheetId = req.params.id;

      // Verificar se a ficha pertence ao usuário
      const sheet = await characterSheetRepository.findById(sheetId);
      
      if (!sheet) {
        throw new AppError("Ficha não encontrada", 404);
      }
      
      if (sheet.userId !== userId) {
        throw new AppError("Você não tem permissão para excluir esta ficha", 403);
      }
      
      await characterSheetRepository.delete(sheetId);
      
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  // Você poderá adicionar outros métodos: getOne, update etc.
}