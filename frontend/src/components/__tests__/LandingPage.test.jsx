// frontend/src/components/__tests__/LandingPage.test.jsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import LandingPage from '../LandingPage';
import { renderWithRouter } from '../../test/testUtils';

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    renderWithRouter(<LandingPage />);
  });

  it('renders welcome heading and description', () => {
    expect(
      screen.getByRole('heading', { name: /welcome to webex launchpad/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/create and join pre-game lobbies/i),
    ).toBeInTheDocument();
  });

  it('renders Create a Lobby button', () => {
    const button = screen.getByRole('button', { name: /create a lobby/i });
    expect(button).toBeInTheDocument();
  });

  it('calls navigate("/lobby") on button click', () => {
    const button = screen.getByRole('button', { name: /create a lobby/i });
    fireEvent.click(button);

    expect(globalThis.mockNavigate).toHaveBeenCalledWith('/lobby');
  });
});
