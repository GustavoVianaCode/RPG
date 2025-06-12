// Importa React e hooks do React e React Router
import React, { useState, useContext } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
// Importa as páginas do app
import Home from "./pages/Home";
import Create from "./pages/Create";
import Sheets from "./pages/Sheets";
// Importa os modais de login e cadastro
import { LoginModal } from "./componentes/LoginModal";
import { RegisterModal } from "./componentes/RegisterModal";
// Importa o contexto de autenticação
import { AuthContext } from "./context/AuthContext";
import EditPage from './pages/EditPage';  // Importa a página de edição de ficha adicionado 10.06.2025
// Importa o CSS global do app
import "../src/App.css";
import AuthCallback from './pages/AuthCallback';

// Componente principal da aplicação
export default function App() {
  // Acesso ao usuário e função de logout a partir do contexto
  const { user, logout } = useContext(AuthContext);

  // Estados que controlam a exibição dos modais de login e cadastro
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Hook de navegação do React Router
  const navigate = useNavigate();
  const location = useLocation();

  // Função chamada ao clicar no botão de logout
  const handleLogout = () => {
    logout(); // Desloga o usuário
    navigate("/"); // Redireciona para a página inicial
  };

  // JSX que representa a estrutura do app
  return (
    <div>
      {/* Cabeçalho com navegação e controle de login */}
      <header
        style={{
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Link do botão de início (home) */}
        <nav>
          {location.pathname !== '/' && (
            <Link to="/" className="icon-button">
              <img src="/imagens/inicio_icon.png" alt="Início" />
            </Link>
          )}
        </nav>

        {/* Área da direita do cabeçalho: depende se está logado ou não */}
        <div>
          {user ? (
            // Se o usuário estiver logado
            <>
              {/* Saudação com nome do usuário */}
              <spanD
                style={{
                  marginRight: "6rem",
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  verticalAlign: "top",
                  transform: "translateY(-3px)",
                  display: "inline-block",
                }}
              >
                Olá, {user.username}!
              </spanD>

              {/* Botão para ver fichas salvas */}
              <button
                onClick={() => navigate("/sheets")}
                className="icon-button"
              >
                <img src="/imagens/minhasfichas_icon.png" alt="Minhas Fichas" />
              </button>

              {/* Botão para sair (logout) */}
              <button onClick={handleLogout} className="icon-button">
                <img src="/imagens/sair_icon.png" alt="Sair" />
              </button>
            </>
          ) : (
            // Se o usuário NÃO estiver logado
            <>
              {/* Botão para abrir modal de login */}
              <button
                onClick={() => setShowLogin(true)}
                className="icon-button"
              >
                <img src="/imagens/login_icon.png" alt="Entrar" />
              </button>

              {/* Botão para abrir modal de cadastro */}
              <button
                onClick={() => setShowRegister(true)}
                className="icon-button"
              >
                <img src="/imagens/cadastro.icon.png" alt="Cadastrar" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Modais de login e cadastro */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
      />

      {/* Conteúdo principal da página, com rotas */}
      <main className="app-main">
        <Routes>
          {/* Rota da página inicial */}
          <Route path="/" element={<Home />} />

          {/* Rota da página de criação de ficha */}
          <Route path="/create" element={<Create />} />

          <Route path="/edit/:sheetId" element={<EditPage />} /> {/* Rota da página de edição de ficha, visível apenas se o usuário estiver logado adicionado 10.06.2025 */}

          {/* Rota de callback para autenticação OAuth */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* Rota das fichas salvas, visível apenas se o usuário estiver logado */}
          {user && <Route path="/sheets" element={<Sheets />} />}
        </Routes>
      </main>
    </div>
  );
}
