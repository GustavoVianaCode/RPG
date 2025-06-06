// Importa React e os hooks useEffect e useState para controlar estado e efeitos colaterais
import React, { useEffect, useState, useContext } from "react";
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
    // Cria um elemento temporário para renderizar a ficha
    const container = document.createElement('div');
    container.className = 'character-sheet';
    
    // Estrutura básica da ficha
    container.innerHTML = `
      <h2 class="sheet-title">Ficha de Personagem</h2>
      <div class="sheet-header">
        <div class="basic-info">
          <p><strong>Nome:</strong> ${sheet.characterName}</p>
          <p><strong>Raça:</strong> ${sheet.race}</p>
          <p><strong>Classe:</strong> ${sheet.className}</p>
        </div>
        ${sheet.characterImageUrl ? `<img src="${sheet.characterImageUrl}" alt="Personagem" class="character-image">` : ''}
      </div>
      <div class="status-section">
        <div class="status-item">
          <span>Vida: ${sheet.constitution * 5 + 10}</span>
        </div>
        <div class="status-item">
          <span>Escudo: ${Math.floor(sheet.dexterity + 7)}</span>
        </div>
      </div>
      <div class="attributes-box">
        <h3>Atributos</h3>
        <div class="attributes-grid">
          <div class="attr"><strong>Força:</strong> ${sheet.strength}</div>
          <div class="attr"><strong>Destreza:</strong> ${sheet.dexterity}</div>
          <div class="attr"><strong>Constituição:</strong> ${sheet.constitution}</div>
          <div class="attr"><strong>Inteligência:</strong> ${sheet.intelligence}</div>
          <div class="attr"><strong>Sabedoria:</strong> ${sheet.wisdom}</div>
          <div class="attr"><strong>Carisma:</strong> ${sheet.charisma}</div>
        </div>
      </div>
    `;

    // Adiciona temporariamente ao DOM
    document.body.appendChild(container);
    container.style.visibility = 'hidden';
    container.style.position = 'absolute';

    // Gera o PDF
    html2pdf()
      .from(container)
      .set({
        margin: 10,
        filename: `${sheet.characterName || "ficha"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: "mm", format: [240, 190], orientation: "landscape" },
      })
      .save()
      .then(() => {
        // Remove o elemento temporário após gerar o PDF
        document.body.removeChild(container);
      });
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