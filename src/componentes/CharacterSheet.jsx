// src/componentes/CharacterSheet.jsx
import React, { useState, useEffect, useContext } from "react"; // Adicionado useContext
import "../style/characterSheet.css";
import html2pdf from "html2pdf.js";
import { AuthContext } from "../context/AuthContext"; // Importar o AuthContext
import apiClient from "../services/api"; // Importar o apiClient que você configurou
import { useNavigate } from "react-router-dom"; // Para redirecionar após salvar

// IMPORTAR ÍCONES DO LUCIDE
import { Heart, Shield } from "lucide-react";

// Componente principal da ficha
const CharacterSheet = ({ character, onSaveEdit, onEditClick }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Acessar o usuário logado do contexto

  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ loading: false, error: null });
  const [edited, setEdited] = useState({
    name: "",
    race: "",
    className: "", // Mantido como 'class' conforme seu código original, mas lembre-se que 'className' é usado no schema.prisma
    Força: 0,
    Destreza: 0,
    Constituição: 0,
    Inteligência: 0,
    Sabedoria: 0,
    Carisma: 0,
    image: null,
    ...(character || {}),
  });

  const maxPoints = 30;
  const totalUsed = [
    "Força",
    "Destreza",
    "Constituição",
    "Inteligência",
    "Sabedoria",
    "Carisma",
  ].reduce((sum, attr) => sum + (parseInt(edited[attr]) || 0), 0);
  const remaining = maxPoints - totalUsed;
  const invalid = remaining < 0;

  useEffect(() => {
    // Quando o 'character' prop mudar (ex: ao criar uma nova ficha no formulário),
    // atualiza o estado 'edited' para refletir essa nova ficha.
    // Isso garante que se o usuário gerar uma ficha e depois quiser salvá-la sem editar,
    // os dados corretos serão usados.
    if (character) {
      setEdited({
        name: character.name || "",
        race: character.race || "",
        className: character.className || "", // ou character.className, dependendo do que CharacterForm envia
        Força: character.Força || 0,
        Destreza: character.Destreza || 0,
        Constituição: character.Constituição || 0,
        Inteligência: character.Inteligência || 0,
        Sabedoria: character.Sabedoria || 0,
        Carisma: character.Carisma || 0,
        image: character.image || null,
        // Inclua health e shield se fizerem parte do objeto 'character' que vem do formulário
        // health: character.health || 0,
        // shield: character.shield || 0,
      });
    }
  }, [character]);

  const handleChange = (field, value) => {
    setEdited((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (invalid) return;
    onSaveEdit(edited); // Esta função (passada por props) provavelmente atualiza o estado no componente pai (Create.jsx)
    setIsEditing(false);
  };

  const handleGeneratePDF = () => {
    const element = document.getElementById("character-sheet");
    html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: `${edited.name || "ficha"}-personagem.pdf`
          .toLowerCase()
          .replace(/\s+/g, "-"), // Nome do arquivo dinâmico
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true }, // useCORS pode ser útil para imagens externas
        jsPDF: { unit: "mm", format: [240, 190], orientation: "landscape" },
      })
      .save();
  };

  // FUNÇÃO PARA SALVAR A FICHA NO BANCO DE DADOS
  const handleSaveSheetToDb = async () => {
    if (!user) {
      alert("Você precisa estar logado para salvar a ficha!");
      return;
    }

    setSaveStatus({ loading: true, error: null });

    // Prepara os dados da ficha para enviar ao backend.
    // Os nomes dos campos devem corresponder aos esperados no CharacterSheetController
    const sheetDataToSave = {
      characterName: edited.name,
      race: edited.race,
      className: edited.className,  //alteração de edited.class para character.className
      characterImageUrl: edited.image || null,
      strength: parseInt(edited.Força) || 0,
      dexterity: parseInt(edited.Destreza) || 0,
      constitution: parseInt(edited.Constituição) || 0, 
      intelligence: parseInt(edited.Inteligência) || 0,
      wisdom: parseInt(edited.Sabedoria) || 0,
      charisma: parseInt(edited.Carisma) || 0,
    };

    try {
      console.log("Enviando dados para a API:", sheetDataToSave);
      // Faz a requisição para a API, o token será adicionado pelo interceptor
      const response = await apiClient.post("/characters", sheetDataToSave);
      
      alert("Ficha salva com sucesso!");
      console.log("Ficha salva:", response.data);
      
      // Redirecionar para a página "Minhas Fichas" após salvar com sucesso
      navigate("/sheets");
      
    } catch (error) {
      console.error("Erro ao salvar a ficha:", error);
      if (error.response) {
        console.error("Detalhes do erro:", error.response.data);
      }
      setSaveStatus({ loading: false, error: error.response?.data?.message || "Erro ao salvar a ficha" });
      alert("Erro ao salvar a ficha. Verifique o console para mais detalhes.");
    } finally {
      setSaveStatus({ loading: false, error: null });
    }
  };

  if (!character)
    return <p>Gere uma ficha no formulário para visualizá-la aqui.</p>;

  // Adiciona os atributos que seu CharacterForm usa mas que podem não estar em 'character' inicialmente
  const displayCharacter = {
    Força: 0,
    Destreza: 0,
    Constituição: 0,
    Inteligência: 0,
    Sabedoria: 0,
    Carisma: 0,
    ...character, // Dados recebidos do formulário
    ...(isEditing ? edited : {}), // Se editando, usa os dados de 'edited'
  };

  // --- LÓGICA DE CÁLCULO PARA VIDA E ESCUDO ---
  // Use displayCharacter para que reflita o personagem atual ou os valores editados
  const vida = (parseInt(displayCharacter.Constituição) || 0) * 5 + 10;
  const escudo = Math.floor((parseInt(displayCharacter.Destreza) || 0) + 7);

  return (
    <>
      <div className="character-sheet" id="character-sheet">
        <h2 className="sheet-title">Ficha</h2>
        <div className="sheet-header">
          <div className="basic-info">
            <p>
              <strong>Nome: </strong>
              {isEditing ? (
                <input
                  value={edited.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nome do personagem"
                />
              ) : (
                <span>{displayCharacter.name}</span>
              )}
            </p>
            <p>
              <strong>Raça:</strong>{" "}
              {isEditing ? (
                <select
                  value={edited.race}
                  onChange={(e) => handleChange("race", e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="Humano">Humano</option>
                  <option value="Elfo">Elfo</option>
                  <option value="Anão">Anão</option>
                  <option value="Orc">Orc</option>
                  <option value="Tiefling">Tiefling</option>
                  <option value="Draconato">Draconato</option>
                  <option value="Animalidio">Animalidio</option>
                </select>
              ) : (
                <span>{displayCharacter.race}</span>
              )}
            </p>
            <p>
              <strong>Classe:</strong>{" "}
              {isEditing ? (
                <select
                  value={edited.className} // ou edited.className
                  onChange={(e) => handleChange("class", e.target.value)} // ou "className"
                >
                  <option value="">Selecione...</option>
                  <option value="Guerreiro">Guerreiro</option>
                  <option value="Mago">Mago</option>
                  <option value="Ladino">Ladino</option>
                  <option value="Clérigo">Clérigo</option>
                  <option value="Bárbaro">Bárbaro</option>
                  <option value="Bardo">Bardo</option>
                  <option value="Bruxo">Bruxo</option>
                  <option value="Druida">Druida</option>
                  <option value="Feiticeiro">Feiticeiro</option>
                  <option value="Monge">Monge</option>
                  <option value="Paladino">Paladino</option>
                  <option value="Patruleiro">Patruleiro</option>
                </select>
              ) : (
                <span>{displayCharacter.className}</span> // ou displayCharacter.className
              )}
            </p>
          </div>
          {displayCharacter.image && (
            <img
              src={displayCharacter.image}
              className="character-image"
              alt="Personagem"
            />
          )}
        </div>

        {/* NOVA SEÇÃO PARA VIDA E ESCUDO */}
        <div className="status-section">
          <div className="status-item">
            <Heart color="#950602" size={20} />
            <span className="status-value">{vida}</span>
          </div>
          <div className="status-item">
            <Shield color="#950602" size={20} />
            <span className="status-value">{escudo}</span>
          </div>
        </div>
        {/* FIM DA NOVA SEÇÃO */}

        <div className="attributes-box">
          <h3>Atributos</h3>
          <div className="attributes-grid">
            {[
              "Força",
              "Destreza",
              "Constituição",
              "Inteligência",
              "Sabedoria",
              "Carisma",
            ].map((attr) => (
              <div className="attr" key={attr}>
                <strong>{attr}:</strong>{" "}
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    max="30" // O limite real de pontos será controlado pela lógica 'remaining'
                    value={edited[attr]}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value) || 0; // Mudado para 0 se NaN
                      const currentValue = parseInt(edited[attr]) || 0; // Mudado para 0 se NaN
                      // Calcula os pontos que estariam disponíveis se este atributo fosse 0
                      const pointsUsedWithoutCurrentAttr =
                        totalUsed - currentValue;
                      const pointsAvailableForThisAttr =
                        maxPoints - pointsUsedWithoutCurrentAttr;

                      const adjustedValue = Math.min(
                        Math.max(newValue, 0), // Atributo pode ser 0
                        // Não pode exceder 30 E não pode exceder os pontos disponíveis
                        Math.min(30, pointsAvailableForThisAttr)
                      );
                      handleChange(attr, adjustedValue);
                    }}
                  />
                ) : (
                  <span>{displayCharacter[attr]}</span>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="points-info">
              <p
                style={{
                  color: invalid ? "red" : "green",
                  textAlign: "center",
                  marginTop: "10px",
                }}
              >
                {invalid
                  ? `⚠️ Pontos excedidos em ${Math.abs(remaining)}!`
                  : remaining === 0
                  ? "✅ Todos os pontos distribuídos!"
                  : `Você ainda tem ${remaining} pontos para distribuir.`}
              </p>
              <p style={{ textAlign: "center" }}>
                Pontos Usados: {totalUsed} / {maxPoints}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Botões de ação */}
      <div className="sheet-actions">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              disabled={invalid || remaining !== 0} // Desabilita se pontos excedidos OU não totalmente gastos
              className={invalid || remaining !== 0 ? "disabled-button" : ""}
            >
              💾Salvar Alterações
            </button>
            <button onClick={() => setIsEditing(false)}>
              ❌ Cancelar Edição
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)}>✏️ Editar Ficha</button>
            <button onClick={handleGeneratePDF}>📄 Gerar PDF</button>
            {/* BOTÃO DE SALVAR NO BANCO DE DADOS - Só mostra se o usuário estiver logado */}
            {user && (
              <button 
                onClick={handleSaveSheetToDb} 
                disabled={saveStatus.loading}
              >
                {saveStatus.loading ? "Salvando..." : "💾 Salvar Ficha"}
              </button>
            )}
          </>
        )}
        {/* Mostrar erro de salvamento se houver */}
        {saveStatus.error && (
          <p style={{ color: "red", marginTop: "10px" }}>
            {saveStatus.error}
          </p>
        )}
      </div>
    </>
  );
};

export default CharacterSheet;