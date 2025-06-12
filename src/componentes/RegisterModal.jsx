// src/componentes/RegisterModal.jsx

// Importa React, hooks de estado e contexto
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Importa o contexto de autenticação
import { Modal } from "./Modal"; // Importa o componente Modal reutilizável
import "../style/Modal.css"; //

// Componente que exibe o modal de cadastro de usuário
export function RegisterModal({ isOpen, onClose }) {
  // Acessa a função de cadastro do AuthContext
  const { register } = useContext(AuthContext);

  // Estados locais para armazenar os dados digitados pelo usuário
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Adicionando estado de loading local// Função que será chamada ao enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário (recarregar página)
    setError(""); // Limpa erros anteriores

    // Validação básica
    if (!username || !email || !password) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    // Validação de formato de e-mail
    if (!email.includes('@') || !email.includes('.')) {
      setError("E-mail inválido");
      return;
    }

    // Validação de senha
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }    try {
      console.log("Iniciando cadastro com:", { username, email, password });
      setLoading(true);
      // Tenta registrar o usuário com os dados fornecidos
      await register({ username, email, password });
      // Se for bem-sucedido, fecha o modal
      onClose();
    } catch (error) {
      // Se ocorrer erro, exibe no console e atualiza o estado de erro
      console.error("Erro no cadastro:", error);      if (error.code === "ERR_NETWORK") {
        setError("Erro de conexão com o servidor. Verifique se o servidor está rodando.");
      } else {
        setError(
          error.response?.data?.message ||
            "Erro ao cadastrar. Verifique os dados e tente novamente."
        );
      }
    } finally {
      setLoading(false); // Desativa o loading independentemente do resultado
    }
  };

  return (
    // Componente Modal, reutilizado para exibir o formulário
    <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar">
      {/* Formulário de cadastro */}
      <form onSubmit={handleSubmit}>
        {/* Campo de nome de usuário */}
        <label>Usuário:</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)} // Atualiza o estado ao digitar
          required
        />

        {/* Campo de e-mail */}
        <label>E-mail:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Atualiza o estado ao digitar
          required
        />

        {/* Campo de senha */}
        <label>Senha:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Atualiza o estado ao digitar
          required
        />

        {/* Exibe mensagem de erro se houver */}
        {error && (
          <p className="error-message" style={{ color: "red" }}>
            {error}
          </p>
        )}

        <a href="http://localhost:5000/api/auth/google" className="google-login-button">
          <img src="/imagens/google-icon.png" alt="Google icon" />
          Cadastrar com o Google
        </a>

        {/* Botão de envio */}
        <button type="submit" disabled={loading}>
          {/* Muda o texto do botão se estiver carregando */}
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </Modal>
  );
}