import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOauthLogin } = useContext(AuthContext); // Nova função no contexto

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        handleOauthLogin(token, userData); // Salva os dados
        navigate('/'); // Redireciona para a home após login
      } catch (error) {
        console.error("Erro ao processar dados de autenticação:", error);
        navigate('/'); // Redireciona para home em caso de erro
      }
    } else {
      console.error("Token ou dados do usuário ausentes no callback.");
      navigate('/'); // Redireciona se não houver dados
    }
  }, [searchParams, navigate, handleOauthLogin]);

  return <div>Autenticando...</div>;
}

export default AuthCallback;