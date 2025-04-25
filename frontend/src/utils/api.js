import axios from 'axios';

// Provide a default value for tests when environment variable isn't available
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function for making API requests
const apiRequest = async (method, endpoint, data = null, params = null) => {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data,
      params,
    });
    return response.data;
  } catch (error) {
    console.error(`API Error: ${method.toUpperCase()} ${endpoint}`, error);
    throw error.response?.data || { message: 'API request failed' };
  }
};

// API functions
const api = {
  // Lobby functions
  getLobby: (lobbyId) => apiRequest('get', `/lobby/${lobbyId}`),
  createLobby: (hostId, hostDisplayName, lobbyName) =>
    apiRequest('post', '/lobby', {
      host_id: hostId,
      host_display_name: hostDisplayName,
      lobby_name: lobbyName,
    }),

  // Game functions
  getGameState: (lobbyId, params) =>
    apiRequest('get', `/game/${lobbyId}`, null, params),

  // This function could be used if we need REST endpoints in addition to sockets
  submitKeyword: (lobbyId, userId, keyword, count) =>
    apiRequest('post', `/game/${lobbyId}/keyword`, {
      user_id: userId,
      keyword,
      count,
    }),

  submitGuess: (lobbyId, userId, cardIndices) =>
    apiRequest('post', `/game/${lobbyId}/guess`, {
      user_id: userId,
      card_indices: cardIndices,
    }),

  endTurn: (lobbyId, userId) =>
    apiRequest('post', `/game/${lobbyId}/end-turn`, {
      user_id: userId,
    }),
};

export default api;
