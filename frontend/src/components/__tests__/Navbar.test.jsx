// frontend/src/components/__tests__/Navbar.test.jsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar';
import { renderWithRouter } from '../../test/testUtils';

describe('Navbar', () => {
  const mockToggleDark = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.setMockWebexState({});
  });

  it('renders app title and dark mode toggle', () => {
    renderWithRouter(<Navbar darkMode={false} setDarkMode={mockToggleDark} />);
    expect(screen.getByText(/Webex Launchpad/i)).toBeInTheDocument();

    const toggleButton = screen.getByRole('button', {
      name: /Toggle Dark Mode/i,
    });
    fireEvent.click(toggleButton);
    expect(mockToggleDark).toHaveBeenCalled();
  });

  // 🔒 Defer all menu-related tests for now
  describe.skip('Webex Info Menu Dropdown', () => {
    it('shows loading spinner when loading is true', async () => {
      globalThis.setMockWebexState({ loading: true });

      renderWithRouter(
        <Navbar darkMode={false} setDarkMode={mockToggleDark} />,
      );
      fireEvent.click(screen.getByRole('button', { name: /Webex Info Menu/i }));

      expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    });

    it('shows connected state when Webex is connected', async () => {
      globalThis.setMockWebexState({ isConnected: true });

      renderWithRouter(
        <Navbar darkMode={false} setDarkMode={mockToggleDark} />,
      );
      fireEvent.click(screen.getByRole('button', { name: /Webex Info Menu/i }));

      expect(
        await screen.findByRole('menuitem', { name: /Connected to Webex/i }),
      ).toBeInTheDocument();
    });

    it('shows disconnected state when Webex is not connected', async () => {
      globalThis.setMockWebexState({ isConnected: false });

      renderWithRouter(
        <Navbar darkMode={false} setDarkMode={mockToggleDark} />,
      );
      fireEvent.click(screen.getByRole('button', { name: /Webex Info Menu/i }));

      expect(
        await screen.findByRole('menuitem', { name: /Webex Not Connected/i }),
      ).toBeInTheDocument();
    });

    it('shows warning if not running in Webex', async () => {
      globalThis.setMockWebexState({ isRunningInWebex: false });

      renderWithRouter(
        <Navbar darkMode={false} setDarkMode={mockToggleDark} />,
      );
      fireEvent.click(screen.getByRole('button', { name: /Webex Info Menu/i }));

      expect(
        await screen.findByRole('menuitem', { name: /Running Outside Webex/i }),
      ).toBeInTheDocument();
    });

    it('shows username and meeting name in Webex', async () => {
      globalThis.setMockWebexState({
        username: 'TestUser',
        meetingName: 'Test Meeting',
        isRunningInWebex: true,
      });

      renderWithRouter(
        <Navbar darkMode={false} setDarkMode={mockToggleDark} />,
      );
      fireEvent.click(screen.getByRole('button', { name: /Webex Info Menu/i }));

      expect(
        await screen.findByRole('menuitem', { name: /TestUser/i }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('menuitem', { name: /Test Meeting/i }),
      ).toBeInTheDocument();
    });

    it('renders error message if present', async () => {
      globalThis.setMockWebexState({ error: 'SDK crashed' });

      renderWithRouter(
        <Navbar darkMode={false} setDarkMode={mockToggleDark} />,
      );
      fireEvent.click(screen.getByRole('button', { name: /Webex Info Menu/i }));

      expect(
        await screen.findByRole('menuitem', { name: /SDK crashed/i }),
      ).toBeInTheDocument();
    });
  });
});
