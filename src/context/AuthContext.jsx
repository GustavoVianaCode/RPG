// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";
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

  useEffect(() => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  // Adiciona uma verificação para garantir que 'storedUser' não é a string "undefined"
  // e usa try-catch para o caso de o JSON estar corrompido.
  if (token && storedUser && storedUser !== "undefined") {
    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      console.error("Falha ao analisar dados do usuário no localStorage, limpando...", e);
      // Se houver um erro, limpa o estado inválido para evitar loops de erro.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
  }, []);

  const login = useCallback(async ({ emailOrUsername, password }) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", { emailOrUsername, password });
      const { token, user: userData } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return userData;
    } catch (err) {
      console.error("Erro no login:", err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ username, email, password }) => {
    setLoading(true);
    try {
      await apiClient.post("/auth/register", { username, email, password });
      return login({ emailOrUsername: email, password });
    } catch (error) {
      console.error("Erro no cadastro:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
  }, []);

  const handleOauthLogin = useCallback((token, userData) => {
    setLoading(true);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setLoading(false);
  }, []);

  const contextValue = useMemo(() => ({
    user,
    loading,
    register,
    login,
    logout,
    handleOauthLogin
  }), [user, loading, register, login, logout, handleOauthLogin]);

  // Retornamos o contexto com as informações e funções disponíveis
  return (
    <AuthContext.Provider value={contextValue}>
      {children} 
    </AuthContext.Provider>
  );
}