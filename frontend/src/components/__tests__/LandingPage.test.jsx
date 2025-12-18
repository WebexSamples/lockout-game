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

  it('renders both launch buttons', () => {
    const webexButton = screen.getByRole('button', { name: /launch in webex/i });
    const standaloneButton = screen.getByRole('button', { name: /standalone browser/i });
    
    expect(webexButton).toBeInTheDocument();
    expect(standaloneButton).toBeInTheDocument();
  });

  it('calls navigate("/game") when Launch in Webex is clicked', () => {
    const button = screen.getByRole('button', { name: /launch in webex/i });
    fireEvent.click(button);

    expect(globalThis.mockNavigate).toHaveBeenCalledWith('/game');
  });

  it('calls navigate("/game?disableWebex=true") when Standalone Browser is clicked', () => {
    const button = screen.getByRole('button', { name: /standalone browser/i });
    fireEvent.click(button);

    expect(globalThis.mockNavigate).toHaveBeenCalledWith('/game?disableWebex=true');
  });
});
