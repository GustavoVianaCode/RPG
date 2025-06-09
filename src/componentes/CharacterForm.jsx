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

  // Lida com upload de imagem e gera preview
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Cria uma URL temporária
      setCharacter((prev) => ({
        ...prev,
        image: imageUrl,
      }));
    }
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
      <label>
        Imagem do Personagem:
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </label>

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
