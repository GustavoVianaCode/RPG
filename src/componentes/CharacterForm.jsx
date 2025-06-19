// Importa o hook useState para gerenciar o estado local
import { useState } from "react";
import "../style/characterForm.css"; // Importa o CSS do formulário

// Componente principal para o formulário de criação de personagens
function CharacterForm({ onCharacterSubmit }) {
  const totalPoints = 30; // Total de pontos disponíveis para atributos

  // Estado do personagem com dados iniciais
  const [character, setCharacter] = useState({
    name: "",
    race: "",
    className: "",
    Força: 0,
    Destreza: 0,
    Constituição: 0,
    Inteligência: 0,
    Sabedoria: 0,
    Carisma: 0,
    image: null,
  });

  // Lida com a alteração dos atributos numéricos (limitando ao total de 30 pontos)
  function handleChange(e) {
    const { name, value } = e.target;
    const newValue = parseInt(value) || 0;

    const updatedCharacter = {
      ...character,
      [name]: newValue,
    };

    const totalUsed =
      (parseInt(updatedCharacter.Força) || 0) +
      (parseInt(updatedCharacter.Destreza) || 0) +
      (parseInt(updatedCharacter.Constituição) || 0) +
      (parseInt(updatedCharacter.Inteligência) || 0) +
      (parseInt(updatedCharacter.Sabedoria) || 0) +
      (parseInt(updatedCharacter.Carisma) || 0);

    // Apenas atualiza o estado se o total de pontos usados for <= 30
    if (totalUsed <= totalPoints) {
      setCharacter(updatedCharacter);
    }
  }

  // Lida com alterações em campos de texto ou select (nome, raça, classe)
  function handleTextChange(e) {
    const { name, value } = e.target;
    setCharacter((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // NOVA FUNÇÃO para lidar com a inserção da URL da imagem
  function handleImageUrlChange(e) {
    const newUrl = e.target.value;
    if (character.image && character.image.startsWith('data:image')) {
      if (!window.confirm("Você já fez upload de um arquivo. Deseja substituí-lo por esta URL?")) {
        return;
      }
    }
    setCharacter((prev) => ({ ...prev, image: newUrl }));
  }

  // FUNÇÃO ATUALIZADA para lidar com o upload, convertendo para Base64
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (character.image && character.image.startsWith('http')) {
      if (!window.confirm("Você já inseriu uma URL. Deseja substituí-la por este arquivo?")) {
        e.target.value = null;
        return;
      }
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCharacter((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  // Envia os dados do personagem
  function handleSubmit(e) {
    e.preventDefault();
    const pointsUsed =
      (parseInt(character.Força) || 0) +
      (parseInt(character.Destreza) || 0) +
      (parseInt(character.Constituição) || 0) +
      (parseInt(character.Inteligência) || 0) +
      (parseInt(character.Sabedoria) || 0) +
      (parseInt(character.Carisma) || 0);

    const pointsRemaining = totalPoints - pointsUsed;

    if (pointsRemaining !== 0) {
      alert("Distribua os 30 pontos entre os atributos!");
      return;
    }

    // Se a função de callback foi passada, envia o personagem
    if (typeof onCharacterSubmit === "function") {
      onCharacterSubmit(character);
    }
  }

  return (
    <form className="character-form" onSubmit={handleSubmit}>
      {/* Campo de nome */}
      <div className="form-linha">
        <label htmlFor="name">Nome:</label>
        <input
          type="text"
          name="name"
          id="name"
          value={character.name}
          onChange={handleTextChange}
          required
        />
      </div>

      {/* Campo de raça */}
      <div className="form-linha">
        <label htmlFor="race">Raça:</label>
        <select
          name="race"
          id="race"
          value={character.race}
          onChange={handleTextChange}
          required
        >
          <option value="">Selecione</option>
          <option value="Humano">Humano</option>
          <option value="Elfo">Elfo</option>
          <option value="Anão">Anão</option>
          <option value="Orc">Orc</option>
          <option value="Tiefling">Tiefling</option>
          <option value="Draconato">Draconato</option>
          <option value="Animalidio">Animalidio</option>
        </select>
      </div>

      {/* Campo de classe */}
      <div className="form-linha">
        <label htmlFor="class">Classe:</label>
        <select
          name="className"
          id="class"
          value={character.className}
          onChange={handleTextChange}
          required
        >
          <option value="">Selecione</option>
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
      </div>

      {/* Upload de imagem */}
      <div className="form-section">
        <div className="form-linha">
          <label htmlFor="image-url">URL:</label>
          <input
            type="url"
            id="image-url"
            name="image"
            placeholder="https://exemplo.com/imagem.jpg"
            value={character.image && character.image.startsWith('http') ? character.image : ''}
            onChange={handleImageUrlChange}
          />
        </div>

        <div className="form-linha">
          <label htmlFor="file-upload">Arquivo:</label>
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* Pré-visualização da imagem */}
      {character.image && (
        <img
          src={character.image}
          alt="Pré-visualização do personagem"
          style={{
            width: "190px",
            height: "250px",
            objectFit: "cover",
            borderRadius: "15px",
          }}
        />
      )}

      <hr />
      {/* Exibição de pontos restantes */}
      <strong>
        Pontos restantes:{" "}
        {totalPoints -
          (parseInt(character.Força) || 0) -
          (parseInt(character.Destreza) || 0) -
          (parseInt(character.Constituição) || 0) -
          (parseInt(character.Inteligência) || 0) -
          (parseInt(character.Sabedoria) || 0) -
          (parseInt(character.Carisma) || 0)}
      </strong>

      {/* Campos de atributos em pares */}
      <div className="atributos-container">
        {[
          ["Força", "Destreza"],
          ["Constituição", "Inteligência"],
          ["Sabedoria", "Carisma"],
        ].map((par) => (
          <div key={par.join("-")} className="atributos-linha">
            {par.map((attr) => (
              <div key={attr} className="atributo">
                <label>{attr}:</label>
                <input
                  type="number"
                  name={attr}
                  value={character[attr]}
                  onChange={handleChange}
                  min="0"
                  max="30"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Botão para enviar o formulário */}
      <button type="submit">Gerar Ficha</button>
    </form>
  );
}

export default CharacterForm;
