// fixRegistration.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function registerUser(userData) {
  try {
    console.log("Tentando criar um usuário:", userData);
    
    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { username: userData.username }
        ]
      }
    });

    if (existingUser) {
      console.log("Usuário já existe:", existingUser.email);
      
      if (existingUser.email === userData.email) {
        throw new Error('Email já cadastrado');
      }
      
      if (existingUser.username === userData.username) {
        throw new Error('Username já está em uso');
      }
      
      return null;
    }

    // Hash da senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // Cria o usuário
    const newUser = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        passwordHash: passwordHash
      }
    });
    
    console.log("Usuário criado com sucesso:", {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email
    });
    
    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt
    };
  } catch (error) {
    console.error("Erro ao criar usuário:", error.message);
    throw error;
  }
}

// Exemplo de uso
async function testRegistration() {
  try {
    // Teste de registro com novo usuário
    const result = await registerUser({
      username: "testuser" + Date.now(),
      email: "test" + Date.now() + "@example.com",
      password: "password123"
    });
    
    console.log("Resultado do registro:", result);
  } catch (e) {
    console.error("Erro no teste de registro:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executa o teste
testRegistration();
