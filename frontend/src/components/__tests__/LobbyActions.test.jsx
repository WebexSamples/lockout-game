// frontend/src/components/__tests__/LobbyActions.test.jsx

import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import LobbyActions from '../LobbyActions';
import { renderWithLobbyContext } from '../../test/testUtils';
import { createMockLobbyContext } from '../../test/mocks/mockLobbyContext';

describe('LobbyActions', () => {
  it('renders all action buttons and inputs', () => {
    const context = createMockLobbyContext();
    renderWithLobbyContext(<LobbyActions />, context);

    expect(screen.getByLabelText(/Update Display Name/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Update Name/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Leave Lobby/i }),
    ).toBeInTheDocument();
  });

  it('disables Update Name button if input is empty', () => {
    const context = createMockLobbyContext();
    renderWithLobbyContext(<LobbyActions />, context);

    const updateButton = screen.getByRole('button', { name: /Update Name/i });
    expect(updateButton).toBeDisabled();
  });

  it('updates display name when button is clicked', () => {
    const context = createMockLobbyContext();
    renderWithLobbyContext(<LobbyActions />, context);

    fireEvent.change(screen.getByLabelText(/Update Display Name/i), {
      target: { value: 'NewName' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Update Name/i }));

    expect(context.updateDisplayName).toHaveBeenCalledWith('NewName');
  });

  it('opens and confirms leave dialog', () => {
    const context = createMockLobbyContext();
    renderWithLobbyContext(<LobbyActions />, context);

    fireEvent.click(screen.getByRole('button', { name: /Leave Lobby/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Confirm Leave/i }));
    expect(context.leaveLobby).toHaveBeenCalled();
  });

  it('closes leave dialog without leaving', () => {
    const context = createMockLobbyContext();
    renderWithLobbyContext(<LobbyActions />, context);

    fireEvent.click(screen.getByRole('button', { name: /Leave Lobby/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    expect(context.leaveLobby).not.toHaveBeenCalled();
  });
});
