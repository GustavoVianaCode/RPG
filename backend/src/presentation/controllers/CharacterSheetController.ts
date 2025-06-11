import { Request, Response, NextFunction } from "express";
import { characterSheetRepository } from "../../infrastructure/database/mockRepositories";
import { CreateCharacterSheetUseCase } from "../../application/use-cases/CreateCharacterSheetUseCase";
//import { FindCharacterSheetByIdUseCase } from "../../application/use-cases/FindCharacterSheetByIdUseCase"; // possivelmente não usado, mas pode ser útil no futuro
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

  public static async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Pega o ID da ficha dos parâmetros da URL (ex: /api/characters/meu-id-123)
      const { id } = req.params;

      // O repositório já tem um método findById, então podemos usá-lo diretamente
      // para simplificar, mas o ideal seria criar um UseCase para isso.
      const sheet = await characterSheetRepository.findById(id);

      if (!sheet) {
        throw new AppError("Ficha não encontrada", 404);
      }

      // Opcional: Verificar se a ficha pertence ao usuário logado
      if (sheet.userId !== req.user.id) {
         throw new AppError("Acesso não autorizado a esta ficha", 403);
      }
      
      res.status(200).json(sheet);
    } catch (err) {
      next(err);
    }
  }

  public static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: sheetId } = req.params; // Pega o ID da ficha a ser atualizada
      const userId = req.user.id; // Pega o ID do usuário logado
      const dataToUpdate = req.body; // Pega os novos dados do corpo da requisição

      // Primeiro, verifica se a ficha realmente pertence ao usuário
      const sheet = await characterSheetRepository.findById(sheetId);
      if (!sheet || sheet.userId !== userId) {
        throw new AppError("Você não tem permissão para editar esta ficha.", 403);
      }

      // Chama o método update do repositório
      const updatedSheet = await characterSheetRepository.update(sheetId, dataToUpdate);
      
      // Retorna a ficha atualizada
      res.status(200).json(updatedSheet);
    } catch (err) {
      next(err); // Passa qualquer erro para o handler global
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