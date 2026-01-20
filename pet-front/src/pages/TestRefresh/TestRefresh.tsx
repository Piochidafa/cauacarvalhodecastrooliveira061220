import { useState } from 'react';
import { authFacade } from '../../services/facades/authFacade';

const TestRefresh = () => {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleRefreshToken = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await authFacade.refreshToken();
      setMessage(`✅ Token renovado com sucesso!\nNovo Access Token: ${response.accessToken.substring(0, 20)}...`);
    } catch (error: any) {
      setMessage(`❌ Erro ao renovar token: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getTokensInfo = () => {
    const accessToken = authFacade.getToken();
    const refreshToken = authFacade.getRefreshToken();
    
    return {
      accessToken: accessToken ? `${accessToken.substring(0, 30)}...` : 'Não encontrado',
      refreshToken: refreshToken ? `${refreshToken.substring(0, 30)}...` : 'Não encontrado',
    };
  };

  const tokensInfo = getTokensInfo();

  return (
    <div className="test-refresh-container">
      <h1>Teste de Refresh Token</h1>
      
      <div className="tokens-info">
        <h2>Tokens Atuais</h2>
        <div className="token-item">
          <strong>Access Token (localStorage):</strong>
          <p>{tokensInfo.accessToken}</p>
        </div>
        <div className="token-item">
          <strong>Refresh Token (cookie):</strong>
          <p>{tokensInfo.refreshToken}</p>
        </div>
      </div>

      <button 
        onClick={handleRefreshToken} 
        disabled={loading}
        className="refresh-button"
      >
        {loading ? 'Renovando...' : '🔄 Renovar Token'}
      </button>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          <pre>{message}</pre>
        </div>
      )}

      <div className="info-box">
        <h3>ℹ️ Como funciona:</h3>
        <ul>
          <li>O Access Token é armazenado no <code>localStorage</code></li>
          <li>O Refresh Token é armazenado em <code>cookie</code> (mais seguro)</li>
          <li>Clique no botão para chamar a rota <code>/auth/refresh</code></li>
          <li>Se bem-sucedido, ambos os tokens serão atualizados</li>
        </ul>
      </div>
    </div>
  );
};

export default TestRefresh;
