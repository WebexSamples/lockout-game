// ✅ Unmock the hook itself first
vi.unmock('../useWebex');

// ✅ Mock the SDK first and safely expose mockAppInstance via globalThis
vi.mock('@webex/embedded-app-sdk', () => {
  const mockAppInstance = {
    onReady: vi.fn(),
    context: {
      getMeeting: vi.fn(),
    },
    application: {
      states: {
        user: { displayName: 'Test User' },
        theme: 'dark',
      },
    },
    isShared: true,
    on: vi.fn(),
    clearShareUrl: vi.fn(),
    setShareUrl: vi.fn(),
  };

  globalThis.mockAppInstance = mockAppInstance;

  const MockApplication = vi.fn(() => mockAppInstance);

  return {
    default: MockApplication,
  };
});

// ✅ Import the hook after mocks are in place
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useWebex from '../useWebex';

describe('useWebex (real hook, mocked SDK)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.mockAppInstance.onReady.mockResolvedValue();
    globalThis.mockAppInstance.context.getMeeting.mockResolvedValue({
      title: 'Test Meeting',
    });
    globalThis.mockAppInstance.clearShareUrl.mockResolvedValue();
    globalThis.mockAppInstance.setShareUrl.mockResolvedValue();
  });

  it('sets Webex state and returns expected values after init', async () => {
    const { result } = renderHook(() => useWebex());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isRunningInWebex).toBe(true);
    expect(result.current.isShared).toBe(true);
    expect(result.current.theme).toBe('dark');
    expect(result.current.username).toBe('Test User');
    expect(result.current.meetingName).toBe('Test Meeting');
  });

  it('handles SDK init failure gracefully', async () => {
    globalThis.mockAppInstance.onReady.mockRejectedValueOnce(
      new Error('Webex init failed'),
    );

    const { result } = renderHook(() => useWebex());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toMatch(/Webex init failed/);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isRunningInWebex).toBe(false);
  });

  it('disables Webex SDK initialization when query parameter is set', async () => {
    // Mock the URL to include the disableWebex query parameter
    const originalLocation = window.location;
    delete window.location;
    window.location = new URL('http://localhost?disableWebex=true');

    const { result } = renderHook(() => useWebex());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isRunningInWebex).toBe(false);
    expect(result.current.username).toBe('Unknown User (Webex Disabled)');
    expect(result.current.meetingName).toBe('No Active Meeting');
    expect(result.current.theme).toBe('light');

    // Restore the original location object
    window.location = originalLocation;
  });
});
