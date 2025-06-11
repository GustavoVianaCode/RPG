// src/pages/EditPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';
import CharacterSheet from '../componentes/CharacterSheet'; // Seu componente de ficha
import '../style/create.css'; // Pode reutilizar o estilo da página de criação

function EditPage() {
  const { sheetId } = useParams(); // Pega o ID da ficha da URL (ex: /edit/123)
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Se não houver usuário, não faz sentido carregar a página
    if (!user) {
      navigate("/login"); // Ou para a home
      return;
    }

    const fetchSheet = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/characters/${sheetId}`);
        const dataFromApi = response.data; // 1. Guarda a resposta original da API

        // 2. Cria um novo objeto "traduzindo" os nomes dos campos
        const formattedData = {
          ...dataFromApi,
          name: dataFromApi.characterName,      // Cria 'name' a partir de 'characterName'
          image: dataFromApi.characterImageUrl, // Cria 'image' a partir de 'characterImageUrl'
          Força: dataFromApi.strength,
          Destreza: dataFromApi.dexterity,
          Constituição: dataFromApi.constitution,
          Inteligência: dataFromApi.intelligence,
          Sabedoria: dataFromApi.wisdom,
          Carisma: dataFromApi.charisma,
        };

        // 3. Salva no estado os dados já formatados para o componente CharacterSheet
        setSheetData(formattedData);

      } catch (err) {
        console.error("Erro ao buscar dados da ficha:", err);
        setError("Não foi possível carregar a ficha. Ela pode não existir ou você não tem permissão.");
      } finally {
        setLoading(false);
      }
    };

    fetchSheet();
  }, [sheetId, user, navigate]);

  // Função para lidar com o salvamento das edições
  const handleSaveChanges = async (updatedDataFromSheet) => {
    // Pergunta ao usuário se ele realmente quer salvar
    if (!window.confirm("Deseja mesmo salvar as alterações? A ficha antiga será substituída.")) {
      return; // Se clicar em "cancelar", a função para aqui
    }

    try {
      // "Traduz" os nomes do frontend de volta para o formato que o backend espera
      const payload = {
        characterName: updatedDataFromSheet.name,
        race: updatedDataFromSheet.race,
        className: updatedDataFromSheet.className,
        characterImageUrl: updatedDataFromSheet.image,
        strength: updatedDataFromSheet.Força,
        dexterity: updatedDataFromSheet.Destreza,
        constitution: updatedDataFromSheet.Constituição,
        intelligence: updatedDataFromSheet.Inteligência,
        wisdom: updatedDataFromSheet.Sabedoria,
        charisma: updatedDataFromSheet.Carisma,
      };

      // Faz a requisição PUT para o backend com os dados atualizados
      await apiClient.put(`/characters/${sheetId}`, payload);

      alert("Ficha atualizada com sucesso!");
      navigate('/sheets'); // Redireciona de volta para a lista de fichas

    } catch (err) {
      console.error("Erro ao atualizar a ficha:", err);
      alert("Não foi possível salvar as alterações. Verifique o console.");
    }
  };

  if (loading) {
    return <div className="loading-message">Carregando ficha...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="create-page">
      <div className="create-container">
        <h1>Editando Ficha</h1>
        {sheetData && (
          <CharacterSheet
            character={sheetData}
            onSaveEdit={handleSaveChanges} // Passa a função para o botão "Salvar Alterações"
            isInitiallyEditing={true} // Força o componente a iniciar no modo de edição
          />
        )}
      </div>
    </div>
  );
}

export default EditPage;