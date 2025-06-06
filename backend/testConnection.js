// testConnection.js - Script para testar a conexão com o MongoDB
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Tentando conectar ao MongoDB...');
    
    // Tenta fazer uma simples consulta para verificar a conexão
    const count = await prisma.user.count();
    
    console.log('✅ Conexão bem-sucedida!');
    console.log(`Número de usuários no banco: ${count}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:');
    console.error(error);
    
    // Informações mais detalhadas sobre o erro
    if (error.code) {
      console.log(`Código de erro: ${error.code}`);
      
      if (error.code === 'P1001' || error.code === 'P1017') {
        console.log('Erro de conexão. Verifique se o MongoDB está acessível e se a string de conexão está correta.');
      } else if (error.code === 'P1003') {
        console.log('Problema com permissões ou credenciais no banco de dados.');
      } else if (error.code === 'P2021') {
        console.log('A coleção/tabela não foi encontrada. Talvez seja necessário executar migrações.');
      }
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Executa o teste
testConnection()
  .then(success => {
    if (success) {
      console.log('Teste concluído com sucesso.');
    } else {
      console.log('Teste falhou. Veja os erros acima.');
    }
    process.exit(success ? 0 : 1);
  });
