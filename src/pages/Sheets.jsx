// Importa React e os hooks useEffect e useState para controlar estado e efeitos colaterais
import React, { useEffect, useState, useContext } from "react";
import ReactDOM from 'react-dom/client'; 
import SheetLayout from '../componentes/SheetLayout';
// Importa o módulo de comunicação com a API
import apiClient from "../services/api";
// Importa useNavigate para navegação
import { useNavigate } from "react-router-dom";
// Importa o contexto de autenticação
import { AuthContext } from "../context/AuthContext";
// Importa os ícones da biblioteca lucide-react
import { Pencil, FileDown, Trash2 } from "lucide-react";
// Importa pacote para gerar PDFs
import html2pdf from "html2pdf.js";
// Importa o CSS específico dessa página
import "../style/Sheets.css";

// Componente principal responsável por exibir as fichas salvas
export default function Sheets() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  // Estado local que guarda a lista de fichas
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect é executado uma vez quando o componente é montado
  useEffect(() => {
    // Se não houver usuário logado, redireciona para a página inicial
    if (!user) {
      navigate("/");
      return;
    }

    // Função para carregar as fichas do usuário
    const loadSheets = async () => {
      try {
        setLoading(true);
        // Faz uma requisição GET para a API buscando as fichas do usuário atual
        const response = await apiClient.get("/characters");
        console.log("Fichas carregadas:", response.data);
        // Atualiza o estado com as fichas retornadas da API
        setSheets(response.data);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar fichas:", err);
        setError("Não foi possível carregar suas fichas. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    loadSheets();
  }, [navigate, user]);

  // Função que exclui uma ficha com base no ID
  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta ficha?")) {
      return;
    }

    try {
      // Faz uma requisição DELETE para remover a ficha do banco
      await apiClient.delete(`/characters/${id}`);
      // Atualiza o estado local removendo a ficha excluída da lista
      setSheets((prev) => prev.filter((sheet) => sheet.id !== id));
      alert("Ficha excluída com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir ficha:", err);
      alert("Erro ao excluir ficha. Por favor, tente novamente.");
    }
  };

  // Função para gerar um PDF da ficha
  const handleDownloadPDF = (sheet) => {
  // 1. Cria um container temporário e invisível no corpo da página
  console.log("DOWNLOAD SOLICITADO PARA A FICHA:", sheet);   //adicoinado 10.06.2025
  const container = document.createElement('div');
  document.body.appendChild(container);

  // 2. Usa o React para renderizar o layout da ficha nesse container
  const root = ReactDOM.createRoot(container);
  root.render(<SheetLayout character={sheet} />);

  // 3. Aguarda um instante para garantir que tudo (inclusive imagens) carregou
  setTimeout(() => {
    const elementToPrint = container.querySelector(`#sheet-pdf-${sheet.id}`);
    if (elementToPrint) {
      html2pdf()
        .from(elementToPrint)
        .set({
          margin: 10,
          filename: `${sheet.characterName || 'ficha'}.pdf`,
          html2canvas: { useCORS: true, scale: 2 },
          jsPDF: { unit: 'mm', format: [240, 190], orientation: 'landscape' },
        })
        .save()
        .finally(() => {
          // 4. Limpa o container da página após o download
          document.body.removeChild(container);
        });
    }
  }, 500); // 500ms de espera é um bom valor
};

  // Renderização do componente
  return (
    <div className="sheets-container">
      {/* Título da página */}
      <h1 className="sheets-title">Minhas Fichas</h1>

      {/* Exibir mensagem de carregamento */}
      {loading && <p className="loading-message">Carregando suas fichas...</p>}
      
      {/* Exibir mensagem de erro se houver */}
      {error && <p className="error-message">{error}</p>}
      
      {/* Exibir mensagem se não houver fichas */}
      {!loading && !error && sheets.length === 0 && (
        <p className="no-sheets">Você ainda não tem fichas salvas. Crie uma ficha para começar!</p>
      )}

      {/* Grid onde as fichas serão exibidas como cards */}
      <div className="sheets-grid">
        {sheets.map((sheet) => (
          // Card individual da ficha
          <div key={sheet.id} className="sheet-card">
            {/* Imagem do personagem (se houver) */}
            {sheet.characterImageUrl && (
              <div className="sheet-image">
                <img src={sheet.characterImageUrl} alt={sheet.characterName} />
              </div>
            )}
            
            {/* Informações principais da ficha */}
            <div className="sheet-info">
              <h3>{sheet.characterName}</h3>
              <p>Raça: {sheet.race}</p>
              <p>Classe: {sheet.className}</p>
              <p>Criado em: {new Date(sheet.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Botões de ação: editar, baixar e deletar */}
            <div className="sheet-actions">
              <button 
                title="Baixar PDF" 
                onClick={() => handleDownloadPDF(sheet)}
                className="action-button download"
              >
                <FileDown size={24} strokeWidth={1.25} color="#fff" />
              </button>

              <button className="edit-btn" onClick={() => navigate(`/edit/${sheet.id}`)}>
                Editar
              </button>

              <button 
                title="Deletar" 
                onClick={() => handleDelete(sheet.id)}
                className="action-button delete"
              >
                <Trash2 size={24} strokeWidth={1.25} color="#fff" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}