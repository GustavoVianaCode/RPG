import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import passport from "passport";
import { JwtProvider } from "../../shared/utils/JwtProvider"; // Importe o JwtProvider
import { User } from "../../domain/entities/User"; // Importe a entidade User

const authRouter = Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);

// Rota para iniciar o processo de autenticação com o Google
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Rota de callback que o Google chamará
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login/failed" }),
  (req, res) => {
    const user = req.user as User;
    
    // Gera o token JWT para o usuário autenticado pelo Google
    const token = JwtProvider.sign({ userId: user.id });

    // Prepara os dados do usuário para enviar de volta
    const userData = JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    // Redireciona de volta para o frontend com o token e os dados do usuário
    res.redirect(`http://localhost:5173/auth/callback?token=${token}&user=${encodeURIComponent(userData)}`);
  }
);


export { authRouter };