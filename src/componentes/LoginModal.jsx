// src/componentes/LoginModal.jsx

// Importa hooks do React e o contexto de autenticação
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Importa o contexto
import { Modal } from "./Modal"; // Importa o componente Modal já criado

// Componente que exibe um modal de login
export function LoginModal({ isOpen, onClose }) {
  // Pegamos a função de login e o loading (estado de carregamento) do contexto
  const { login, loading } = useContext(AuthContext);

  // Estados locais para armazenar o email/username e a senha digitados pelo usuário
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // Função que lida com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita o recarregamento da página ao enviar o form
    setError(""); // Limpa erros anteriores

    try {
      // Tenta fazer login com os dados informados
      await login({ emailOrUsername, password });
      // Se o login for bem-sucedido, fecha o modal
      onClose();
    } catch (error) {
      // Se der erro, mostra no console e atualiza o estado de erro
      console.error("Erro no login:", error);
      setError(
        error.response?.data?.message ||
          "E-mail/usuário ou senha inválidos. Tente novamente."
      );
    }
  };

  return (
    // Usa o componente Modal para renderizar a interface de login
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Entrar</h2>

      {/* Formulário de login */}
      <form onSubmit={handleSubmit}>
        {/* Campo de e-mail ou nome de usuário */}
        <label>E-mail ou Usuário:</label>
        <input
          type="text"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)} // Atualiza o estado conforme digita
          required // Campo obrigatório
        />

        {/* Campo de senha */}
        <label>Senha:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Atualiza a senha
          required
        />

         {/* Botão de Login com Google */}
        <a href="http://localhost:5000/api/auth/google" className="google-login-button">
          <img src="/imagens/google-icon.png" alt="Google icon" /> {/* Baixe um ícone do Google */}
          Entrar com o Google
        </a>

        {/* Exibe mensagem de erro se houver */}
        {error && (
          <p className="error-message" style={{ color: "red" }}>
            {error}
          </p>
        )}

        {/* Botão de envio */}
        <button type="submit" disabled={loading}>
          {/* Texto muda dependendo do estado de carregamento */}
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </Modal>
  );
}