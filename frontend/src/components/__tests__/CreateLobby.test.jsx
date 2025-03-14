// frontend/src/components/__tests__/CreateLobby.test.jsx

import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import CreateLobby from '../CreateLobby';
import { renderWithRouter } from '../../test/testUtils';

describe('CreateLobby', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    renderWithRouter(<CreateLobby />);
  });

  it('renders form fields and create button', () => {
    expect(screen.getByLabelText(/Lobby Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Display Name/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Create Lobby/i }),
    ).toBeInTheDocument();
  });

  it('pre-fills inputs from Webex SDK', () => {
    expect(screen.getByLabelText(/Lobby Name/i)).toHaveValue('Test Meeting');
    expect(screen.getByLabelText(/Your Display Name/i)).toHaveValue('TestUser');
  });

  it('calls api.createLobby and navigates on submit', async () => {
    const mockLobbyId = 'abc-123';
    globalThis.mockCreateLobby.mockResolvedValueOnce({
      lobby_id: mockLobbyId,
    });

    const button = screen.getByRole('button', { name: /Create Lobby/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(globalThis.mockCreateLobby).toHaveBeenCalled();
      expect(globalThis.mockNavigate).toHaveBeenCalledWith(
        `/lobby/${mockLobbyId}`,
        expect.anything(),
      );
    });
  });

  it('does not call api if inputs are empty', async () => {
    fireEvent.change(screen.getByLabelText(/Lobby Name/i), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText(/Your Display Name/i), {
      target: { value: '' },
    });

    const button = screen.getByRole('button', { name: /Create Lobby/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(globalThis.mockCreateLobby).not.toHaveBeenCalled();
    });
  });
});
