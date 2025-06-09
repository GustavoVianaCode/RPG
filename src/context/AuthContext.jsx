// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import apiClient from "../services/api";

// Criamos um contexto chamado AuthContext, que será usado para compartilhar
// os dados de autenticação entre os componentes do aplicativo.
export const AuthContext = createContext();

// Este componente é um "provider" que envolve o aplicativo e fornece os dados do contexto
export function AuthProvider({ children }) {
  // user: guarda as informações do usuário logado
  // loading: usado para mostrar carregamento durante login/cadastro
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // useEffect é executado uma vez quando o componente carrega
  // Aqui, ele verifica se já existe um usuário salvo no localStorage
  useEffect(() => {
    const token = localStorage.getItem("token"); // busca o token salvo
    const storedUser = localStorage.getItem("user"); // busca o usuário salvo
    if (token && storedUser) {
      // Se existir token e usuário, define o usuário no estado
      setUser(JSON.parse(storedUser)); // transforma a string em objeto novamente
      
      // Configura o token para todas as requisições futuras
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);  // Função para registrar um novo usuário
  const register = async ({ username, email, password }) => {
    try {
      setLoading(true); // ativa o carregamento

      console.log("Enviando dados para registro:", { username, email, password });
      
      try {
        // Faz a requisição de cadastro para a API com tratamento de erro melhorado
        const response = await apiClient.post("/auth/register", {
          username,
          email,
          password
        });
        
        console.log("Resposta do servidor:", response.data);
  
        // Login automático após cadastro bem-sucedido
        return login({ emailOrUsername: email, password });
      } catch (error) {
        if (error.code === 'ERR_NETWORK') {
          throw new Error('Erro de conexão. Verifique se o servidor está rodando na porta 5000.');
        } else if (error.response) {
          // O servidor retornou um status diferente de 2xx
          throw new Error(error.response.data.message || 'Erro no servidor');
        } else if (error.request) {
          // A requisição foi feita mas não houve resposta
          throw new Error('O servidor não respondeu. Verifique a conexão.');
        } else {
          // Algo aconteceu ao configurar a requisição
          throw error;
        }
      }
      } catch (err) {
      // Se der erro, mostra no console
      console.error("Erro no cadastro:", err);
      console.error("Detalhes:", {
        message: err.message,
        response: err.response?.data,
        config: err.config
      });
      throw err;
    } finally {
      setLoading(false); // desativa o carregamento
    }
  };
  // Função para fazer login do usuário
  const login = async ({ emailOrUsername, password }) => {
    try {
      setLoading(true); // ativa o carregamento

      console.log("Tentando login com:", { emailOrUsername, password });
      
      // Faz a requisição de login para a API
      const response = await apiClient.post("/auth/login", {
        emailOrUsername,
        password
      });

      console.log("Login bem-sucedido:", response.data);
      const { token, user: userData } = response.data;
      
      // Salva o token e usuário no localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Configura o token para todas as requisições futuras
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Define o usuário no estado do contexto
      setUser(userData);
      
      // Configura o token para todas as requisições futuras
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return userData;
    } catch (err) {
      console.error("Erro no login:", err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false); // desativa o carregamento
    }
  };

  // Função para sair (logout)
  const logout = () => {
    localStorage.removeItem("token"); // remove token do navegador
    localStorage.removeItem("user"); // remove usuário salvo
    setUser(null); // limpa o estado
    
    // Remove o token das requisições futuras
    delete apiClient.defaults.headers.common['Authorization'];
  };

  // Retornamos o contexto com as informações e funções disponíveis
  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children} {/* Renderiza todos os componentes filhos do app */}
    </AuthContext.Provider>
  );
}