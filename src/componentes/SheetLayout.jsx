// src/componentes/SheetLayout.jsx
import React from 'react';
import { Heart, Shield } from 'lucide-react';
import '../style/characterSheet.css'; // Reutilize o mesmo CSS

// Este componente SÓ se preocupa com a aparência.
function SheetLayout({ character }) {
  if (!character) return null; // Não renderiza nada se não houver dados

  // Lógica de cálculo para vida e escudo
  const vida = (parseInt(character.constitution) || 0) * 5 + 10;
  const escudo = Math.floor((parseInt(character.dexterity) || 0) + 7);

  return (
    <div className="character-sheet" id={`sheet-pdf-${character.id}`}>
      <h2 className="sheet-title">Ficha</h2>
      <div className="sheet-header">
        <div className="basic-info">
          <p><strong>Nome: </strong><span>{character.characterName}</span></p>
          <p><strong>Raça: </strong><span>{character.race}</span></p>
          <p><strong>Classe: </strong><span>{character.className}</span></p>
        </div>
        {character.characterImageUrl && (
          <img
            src={character.characterImageUrl}
            className="character-image"
            alt={character.characterName}
            crossOrigin="anonymous" // Ajuda o html2pdf com imagens de outras URLs
          />
        )}
      </div>

      <div className="status-section">
        <div className="status-item"><Heart color="#950602" size={20} /> <span className="status-value">{vida}</span></div>
        <div className="status-item"><Shield color="#950602" size={20} /> <span className="status-value">{escudo}</span></div>
      </div>

      <div className="attributes-box">
        <h3>Atributos</h3>
        <div className="attributes-grid">
          <div className="attr"><strong>Força:</strong> <span>{character.strength}</span></div>
          <div className="attr"><strong>Destreza:</strong> <span>{character.dexterity}</span></div>
          <div className="attr"><strong>Constituição:</strong> <span>{character.constitution}</span></div>
          <div className="attr"><strong>Inteligência:</strong> <span>{character.intelligence}</span></div>
          <div className="attr"><strong>Sabedoria:</strong> <span>{character.wisdom}</span></div>
          <div className="attr"><strong>Carisma:</strong> <span>{character.charisma}</span></div>
        </div>
      </div>
    </div>
  );
}

export default SheetLayout;