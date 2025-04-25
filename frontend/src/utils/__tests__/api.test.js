// Unmock api.js before import
vi.unmock('../api'); // ⬅️ this removes the global mock from mockApi.js

import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../api';
import axios from 'axios';
import { API_BASE_URL } from '../api';

vi.mock('axios');

describe('api util functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls createLobby with correct payload and returns data', async () => {
    const mockResponse = { lobby_id: 'abc-123' };
    axios.mockResolvedValueOnce({ data: mockResponse });

    const result = await api.createLobby('host-1', 'Alice', 'Test Lobby');

    expect(axios).toHaveBeenCalledWith({
      method: 'post',
      url: `${API_BASE_URL}/lobby`,
      data: {
        host_id: 'host-1',
        host_display_name: 'Alice',
        lobby_name: 'Test Lobby',
      },
      params: null,
    });

    expect(result).toEqual(mockResponse);
  });

  it('calls getLobby with correct URL and returns data', async () => {
    const mockLobby = { lobby_id: 'abc-123', participants: [] };
    axios.mockResolvedValueOnce({ data: mockLobby });

    const result = await api.getLobby('abc-123');

    expect(axios).toHaveBeenCalledWith({
      method: 'get',
      url: `${API_BASE_URL}/lobby/abc-123`,
      data: null,
      params: null,
    });

    expect(result).toEqual(mockLobby);
  });

  it('handles API errors and throws error message', async () => {
    const errorMessage = { message: 'Lobby not found' };
    axios.mockRejectedValueOnce({
      response: { data: errorMessage },
    });

    await expect(api.getLobby('invalid-id')).rejects.toEqual(errorMessage);
  });

  it('handles fallback error when no response data is returned', async () => {
    axios.mockRejectedValueOnce({});

    await expect(api.getLobby('fail')).rejects.toEqual({
      message: 'API request failed',
    });
  });
});
