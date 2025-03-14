// frontend/src/components/__tests__/LobbyActions.test.jsx

import { describe, it, expect, vi } from 'vitest';
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
      screen.getByRole('button', { name: /Switch Team/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Become Team Lead/i }),
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

  it('switches team when button is clicked', () => {
    const context = createMockLobbyContext();
    renderWithLobbyContext(<LobbyActions />, context);

    fireEvent.click(screen.getByRole('button', { name: /Switch Team/i }));
    expect(context.toggleTeam).toHaveBeenCalled();
  });

  it('disables Switch Team button when toggleTeam is not available', () => {
    const context = createMockLobbyContext({ toggleTeam: null });
    renderWithLobbyContext(<LobbyActions />, context);

    const switchBtn = screen.getByRole('button', { name: /Switch Team/i });
    expect(switchBtn).toBeDisabled();
  });

  it('calls requestTeamLead if user is not team lead', () => {
    const context = createMockLobbyContext();
    renderWithLobbyContext(<LobbyActions />, context);

    fireEvent.click(screen.getByRole('button', { name: /Become Team Lead/i }));
    expect(context.requestTeamLead).toHaveBeenCalled();
  });

  it('disables Become Team Lead button if team already has a lead', () => {
    const context = createMockLobbyContext({
      hasTeamLead: () => true,
      isUserTeamLead: () => false,
    });

    renderWithLobbyContext(<LobbyActions />, context);

    const button = screen.getByRole('button', { name: /Become Team Lead/i });
    expect(button).toBeDisabled();
  });

  it('shows Demote Self button if user is team lead', () => {
    const context = createMockLobbyContext({
      isUserTeamLead: () => true,
    });

    renderWithLobbyContext(<LobbyActions />, context);

    expect(
      screen.getByRole('button', { name: /Demote Self/i }),
    ).toBeInTheDocument();
  });

  it('calls demoteTeamLead when Demote Self button is clicked', () => {
    const context = createMockLobbyContext({
      isUserTeamLead: () => true,
      demoteTeamLead: vi.fn(),
    });

    renderWithLobbyContext(<LobbyActions />, context);

    fireEvent.click(screen.getByRole('button', { name: /Demote Self/i }));
    expect(context.demoteTeamLead).toHaveBeenCalled();
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
