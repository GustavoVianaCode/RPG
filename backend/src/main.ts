import "dotenv/config";
import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import cors from "cors";
import { authRouter } from "./presentation/routes/auth.routes";
import { characterRouter } from "./presentation/routes/character.routes";
import { AppError } from "./application/errors/AppError";

const app = express();

// Middlewares globais
app.use(cors({
  origin: true, // Permite todas as origens durante o desenvolvimento
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rota de teste para verificar se o servidor está ativo
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running!" });
});

// Rotas
app.use("/api/auth", authRouter);
app.use("/api/characters", characterRouter);

// Handler de erros (note que não usamos 'return' aqui, apenas chamamos res.status... )
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {  if (err instanceof AppError) {
    console.error(`AppError: ${err.message} (${err.statusCode})`);
    res.status(err.statusCode).json({ message: err.message });
  } else {
    console.error("Unexpected error:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
    if ((err as any).code === 'P2002') {
      // Prisma unique constraint violation
      const field = (err as any).meta?.target?.[0];
      res.status(409).json({ 
        message: `Já existe um usuário com esse ${field === 'email' ? 'e-mail' : 'nome de usuário'}` 
      });
    } else {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
};

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`Health check disponível em: http://localhost:${PORT}/api/health`);
});

// Tratamento de erros na inicialização do servidor
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`⚠️ Porta ${PORT} já está em uso. Tente outra porta ou encerre o processo que está usando essa porta.`);
  } else {
    console.error('⚠️ Erro ao iniciar o servidor:', error);
  }
  process.exit(1);
});