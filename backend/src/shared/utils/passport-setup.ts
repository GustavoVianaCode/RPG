import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { userRepository } from "../../infrastructure/database/mockRepositories";
import { AppError } from "../../application/errors/AppError";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Tenta encontrar o usuário pelo googleId
        let user = await userRepository.findByGoogleId(profile.id);

        if (user) {
          return done(null, user); // Usuário encontrado, retorna ele
        }

        // 2. Se não encontrou, tenta pelo email
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new AppError("O perfil do Google não possui um e-mail.", 400), undefined);
        }
        
        user = await userRepository.findByEmail(email);

        if (user) {
          // Se encontrou por email, mas não por googleId, atualiza o usuário existente
          user.googleId = profile.id;
          await userRepository.update(user.id, { googleId: profile.id });
          return done(null, user);
        }

        // 3. Se não existe, cria um novo usuário
        const newUser = await userRepository.create({
          googleId: profile.id,
          email: email,
          // Cria um username a partir do email ou do nome de exibição
          username: profile.displayName.replace(/\s/g, "") + Math.floor(Math.random() * 1000),
          // Senha não é necessária para login via Google
        });
        
        return done(null, newUser);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);