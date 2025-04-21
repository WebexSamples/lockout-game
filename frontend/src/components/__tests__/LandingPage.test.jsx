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

  it('renders lockout heading and description', () => {
    expect(
      screen.getByRole('heading', { name: /lockout/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/in the digital underworld/i)).toBeInTheDocument();

    expect(screen.getByText(/bluewave/i)).toBeInTheDocument();

    expect(screen.getByText(/redshift/i)).toBeInTheDocument();
  });

  it('renders Create a Game button', () => {
    const button = screen.getByRole('button', { name: /create a game/i });
    expect(button).toBeInTheDocument();
  });

  it('calls navigate("/lobby") on button click', () => {
    const button = screen.getByRole('button', { name: /create a game/i });
    fireEvent.click(button);

    expect(globalThis.mockNavigate).toHaveBeenCalledWith('/lobby');
  });
});
