// testDb.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Tentando criar um usuário...");
  try {
    const newUser = await prisma.user.create({
      data: {
        username: "testuser",
        email: "test@example.com",
        passwordHash: "somehash", // Em um app real, isso seria um hash seguro
      },
    });
    console.log("Usuário criado:", newUser);
    
  } catch (e) {
    console.error("Erro ao criar:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
