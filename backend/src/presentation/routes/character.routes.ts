import { Router } from "express";
import { CharacterSheetController } from "../controllers/CharacterSheetController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const characterRouter = Router();

// Todas as rotas abaixo exigem usuário autenticado
characterRouter.use(ensureAuthenticated);

characterRouter.post("/", CharacterSheetController.create);
characterRouter.get("/", CharacterSheetController.listByUser);
characterRouter.delete("/:id", CharacterSheetController.delete);

characterRouter.get("/:id", ensureAuthenticated, CharacterSheetController.findById);

export { characterRouter };