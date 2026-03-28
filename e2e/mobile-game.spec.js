/**
 * Mobile Browser E2E Tests
 *
 * These tests verify mobile-specific functionality and gameplay on mobile viewports.
 * They run against both Pixel 5 (Android Chrome) and iPhone 12 (Mobile Safari)
 * as configured in playwright.config.js.
 *
 * Test suites:
 *   1. Lobby share button — verifies the share/copy-link button renders and
 *      triggers the correct behaviour (Web Share API or clipboard copy).
 *   2. Mobile game board — verifies the responsive board layout on narrow screens.
 *   3. Full mobile game flow — 4-player game completed on a mobile viewport,
 *      confirming all touch-based interactions work end-to-end.
 *
 * Prerequisites (started automatically by playwright.config.js webServer):
 *   Backend  → gunicorn (http://localhost:5000)
 *   Frontend → vite dev  (http://localhost:5173)
 */

import { test, expect } from '@playwright/test';

// ─── Constants ────────────────────────────────────────────────────────────────

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const BACKEND_API_URL = `${BACKEND_URL}/api`;

const MAX_TURNS = 25;
const TURN_END_POLL_TIMEOUT_MS = 15_000;

// ─── Helpers (shared with full-game.spec.js) ──────────────────────────────────

async function waitForGameState(
  request,
  lobbyId,
  userId,
  condition,
  timeout = 15_000,
) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const resp = await request.get(
      `${BACKEND_API_URL}/${lobbyId}?user_id=${userId}`,
    );
    if (resp.ok()) {
      const state = await resp.json();
      if (condition(state)) return state;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`waitForGameState timed out after ${timeout} ms`);
}

async function waitForLobbyState(
  request,
  lobbyId,
  condition,
  timeout = 10_000,
) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const resp = await request.get(`${BACKEND_API_URL}/lobby/${lobbyId}`);
    if (resp.ok()) {
      const lobby = await resp.json();
      if (condition(lobby)) return lobby;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`waitForLobbyState timed out after ${timeout} ms`);
}

// ─── Suite 1: Lobby share button ──────────────────────────────────────────────

test.describe('Mobile — Lobby share button', () => {
  test.setTimeout(60_000);

  test('share button renders and copies link to clipboard on mobile', async ({
    browser,
    request,
  }) => {
    // Grant clipboard-write permission so the fallback copy path works even
    // when navigator.share is unavailable in the test browser.
    const ctx = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
    });

    const page = await ctx.newPage();

    try {
      // Create a lobby
      await page.goto(`${FRONTEND_URL}/game?disableWebex=true`);
      await page.getByLabel('Game Name').fill('Mobile Share Test');
      await page.getByLabel('Your Display Name').fill('MobileHost');
      const webexCheckbox = page.getByLabel('Enable Webex Integration');
      if (await webexCheckbox.isChecked()) {
        await webexCheckbox.uncheck();
      }
      await page.getByRole('button', { name: 'Create Game' }).click();
      await page.waitForURL(`${FRONTEND_URL}/game/**`, { timeout: 10_000 });

      const lobbyId = page.url().split('/game/')[1].split('?')[0];
      await page.waitForSelector('text=Mobile Share Test', { timeout: 10_000 });

      // The share button should always be visible in the lobby
      const shareBtn = page.getByTestId('share-lobby-button');
      await expect(shareBtn).toBeVisible({ timeout: 5_000 });

      // On devices without navigator.share the button label is "Copy Lobby Link"
      // On devices with navigator.share it is "Share Lobby".
      // In Playwright's headless Chromium/WebKit, navigator.share is typically
      // undefined, so we expect the clipboard-copy path.
      const btnText = await shareBtn.innerText();
      const isNativeShare = btnText.trim() === 'Share Lobby';

      if (!isNativeShare) {
        // Clipboard fallback path: clicking should copy the URL and show Snackbar
        await shareBtn.click();

        // Confirm the success snackbar appears
        await expect(
          page.getByText('Lobby link copied to clipboard!'),
        ).toBeVisible({ timeout: 5_000 });

        // Confirm the clipboard contains the lobby URL
        const clipText = await page.evaluate(() =>
          navigator.clipboard.readText(),
        );
        expect(clipText).toContain(lobbyId);
      } else {
        // Native share path: just verify the button is tappable without error
        // (We cannot fully automate the OS share sheet, so clicking is the best
        //  we can do; if no error is thrown the test passes.)
        await expect(shareBtn).toBeEnabled();
      }

      await waitForLobbyState(request, lobbyId, (l) => l !== null, 5_000);
    } finally {
      await ctx.close();
    }
  });
});

// ─── Suite 2: Mobile game board layout ────────────────────────────────────────

test.describe('Mobile — Game board responsive layout', () => {
  test.setTimeout(3 * 60_000);

  test('game board renders in 2-column layout on mobile viewport', async ({
    browser,
    request,
  }) => {
    // Spin up a 2-player game (minimum viable) so we can inspect the board.
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();

    try {
      const page1 = await ctx1.newPage(); // Host — Team 1 Hacker
      const page2 = await ctx2.newPage(); // Player 2 — Team 2 Hacker

      // Create lobby
      await page1.goto(`${FRONTEND_URL}/game?disableWebex=true`);
      await page1.getByLabel('Game Name').fill('Mobile Layout Test');
      await page1.getByLabel('Your Display Name').fill('HostMobile');
      const checkbox = page1.getByLabel('Enable Webex Integration');
      if (await checkbox.isChecked()) await checkbox.uncheck();
      await page1.getByRole('button', { name: 'Create Game' }).click();
      await page1.waitForURL(`${FRONTEND_URL}/game/**`, { timeout: 10_000 });

      const lobbyId = page1.url().split('/game/')[1].split('?')[0];
      await page1.waitForSelector('text=Mobile Layout Test', {
        timeout: 10_000,
      });

      // Join with second player
      await page2.goto(`${FRONTEND_URL}/game/${lobbyId}?disableWebex=true`);
      await page2.waitForSelector('text=Join Lobby', { timeout: 10_000 });
      await page2.getByLabel('Enter your display name').fill('Player2Mobile');
      await page2.getByRole('button', { name: 'Join Lobby' }).click();
      await page2.waitForSelector('text=Mobile Layout Test', {
        timeout: 10_000,
      });

      await page1.waitForTimeout(1_000);

      // Fetch participants
      const lobby = await waitForLobbyState(
        request,
        lobbyId,
        (l) => l.participants.length === 2,
        15_000,
      );

      const host = lobby.participants.find((p) => p.display_name === 'HostMobile');
      const p2 = lobby.participants.find(
        (p) => p.display_name === 'Player2Mobile',
      );

      // Assign hackers
      await page1.locator('button:has-text("Become Hacker")').click();
      await page1.waitForSelector('button:has-text("Become AI Agent")', {
        timeout: 5_000,
      });
      await page2.locator('button:has-text("Become Hacker")').click();
      await page2.waitForSelector('button:has-text("Become AI Agent")', {
        timeout: 5_000,
      });

      // Ready up
      for (const page of [page1, page2]) {
        await page.getByRole('button', { name: 'Not Ready' }).click();
      }

      // Force-start (2 players may not satisfy the balance requirement)
      await page1.waitForSelector(
        'button:has-text("Launch Operation"), button:has-text("Override Protocols")',
        { timeout: 10_000 },
      );
      const launchBtn = page1.getByRole('button', { name: 'Launch Operation' });
      if (await launchBtn.isVisible()) {
        await launchBtn.click();
      } else {
        await page1
          .getByRole('button', { name: 'Override Protocols' })
          .click();
        await page1.getByRole('button', { name: 'Execute Override' }).click();
      }

      await Promise.all([
        page1.waitForSelector('text=Game In Progress', { timeout: 15_000 }),
        page2.waitForSelector('text=Game In Progress', { timeout: 15_000 }),
      ]);

      // ── Verify board layout ─────────────────────────────────────────────────
      // The viewport is already mobile-sized (set by the Playwright device
      // config for this project).  Check that card tiles are laid out in
      // 2 columns by measuring their bounding boxes.

      // Wait for at least one card tile to appear (they're rendered as Paper
      // elements containing the word text).
      const boardPaper = page1.locator('[class*="MuiPaper"]').filter({
        has: page1.locator('text=Game Board'),
      });
      await expect(boardPaper).toBeVisible({ timeout: 10_000 });

      // Collect the x-positions of the first 4 card tiles.
      // In a 2-column layout xs={6}, cards in the same row share x-positions
      // that differ by roughly half the viewport width, and 2 columns means
      // only 2 distinct x values among the first 4 tiles.
      const cardTiles = page1
        .locator('[class*="MuiPaper-root"]')
        .filter({ hasNot: page1.locator('h6') });

      const count = await cardTiles.count();
      expect(count).toBeGreaterThanOrEqual(4);

      const firstFourBoxes = await Promise.all(
        [0, 1, 2, 3].map((i) => cardTiles.nth(i).boundingBox()),
      );

      // Ensure all boxes were found
      for (const box of firstFourBoxes) {
        expect(box).not.toBeNull();
      }

      // On mobile (2-column), tile [0] and tile [2] should be in the same
      // column (same x), and tile [1] and tile [3] in the other column.
      const col0x = firstFourBoxes[0].x;
      const col1x = firstFourBoxes[1].x;
      expect(Math.abs(firstFourBoxes[2].x - col0x)).toBeLessThan(5);
      expect(Math.abs(firstFourBoxes[3].x - col1x)).toBeLessThan(5);
      // The two columns should be meaningfully apart
      expect(Math.abs(col1x - col0x)).toBeGreaterThan(50);

      console.log('[mobile-layout] 2-column board layout confirmed on mobile viewport');

      // Clean up: end the game via the host
      await request.post(`${BACKEND_API_URL}/lobby/${lobbyId}/end_game`, {
        data: { user_id: host.id },
      });
    } finally {
      await ctx1.close();
      await ctx2.close();
    }
  });
});

// ─── Suite 3: Full mobile game flow ───────────────────────────────────────────

test.describe('Mobile — Full 4-player game on mobile viewport', () => {
  // Same generous budget as the desktop full-game test
  test.setTimeout(5 * 60_000);

  test('four players complete a game on a mobile viewport', async ({
    browser,
    request,
  }) => {
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();
    const ctx3 = await browser.newContext();
    const ctx4 = await browser.newContext();

    try {
      const page1 = await ctx1.newPage(); // Alice  — Host, Team 1 Hacker
      const page2 = await ctx2.newPage(); // Bob    — Team 2 Hacker
      const page3 = await ctx3.newPage(); // Charlie — Team 1 AI Agent
      const page4 = await ctx4.newPage(); // Diana   — Team 2 AI Agent

      // ── PHASE 1: Alice creates the lobby ─────────────────────────────────
      await test.step('Alice creates the lobby (mobile)', async () => {
        await page1.goto(`${FRONTEND_URL}/game?disableWebex=true`);
        await page1.getByLabel('Game Name').fill('Mobile Game Test');
        await page1.getByLabel('Your Display Name').fill('AliceMobile');
        const webexCheckbox = page1.getByLabel('Enable Webex Integration');
        if (await webexCheckbox.isChecked()) {
          await webexCheckbox.uncheck();
        }
        await page1.getByRole('button', { name: 'Create Game' }).click();
        await page1.waitForURL(`${FRONTEND_URL}/game/**`, { timeout: 10_000 });
      });

      const lobbyId = page1.url().split('/game/')[1].split('?')[0];
      console.log(`[mobile] Lobby created: ${lobbyId}`);

      await page1.waitForSelector('text=Mobile Game Test', { timeout: 10_000 });

      // ── PHASE 2: Other players join ───────────────────────────────────────
      const joinLobby = async (page, displayName) => {
        await page.goto(`${FRONTEND_URL}/game/${lobbyId}?disableWebex=true`);
        await page.waitForSelector('text=Join Lobby', { timeout: 10_000 });
        await page.getByLabel('Enter your display name').fill(displayName);
        await page.getByRole('button', { name: 'Join Lobby' }).click();
        await page.waitForSelector('text=Mobile Game Test', { timeout: 10_000 });
      };

      await test.step('Bob joins (mobile)', () => joinLobby(page2, 'BobMobile'));
      await test.step('Charlie joins (mobile)', () =>
        joinLobby(page3, 'CharlieMobile'));
      await test.step('Diana joins (mobile)', () =>
        joinLobby(page4, 'DianaMobile'));

      await page1.waitForTimeout(1_000);

      const initialLobby = await waitForLobbyState(
        request,
        lobbyId,
        (l) => l.participants.length === 4,
        15_000,
      );

      const findP = (name) =>
        initialLobby.participants.find((p) => p.display_name === name);

      const alice = findP('AliceMobile');
      const bob = findP('BobMobile');
      const charlie = findP('CharlieMobile');
      const diana = findP('DianaMobile');

      // ── PHASE 3: Share button is visible on mobile lobby ──────────────────
      await test.step('Share button is visible in the mobile lobby', async () => {
        await expect(
          page1.getByTestId('share-lobby-button'),
        ).toBeVisible({ timeout: 5_000 });
        console.log('[mobile] Share lobby button confirmed visible');
      });

      // ── PHASE 4: Assign hackers ───────────────────────────────────────────
      await test.step('Alice becomes Team 1 Hacker (mobile)', async () => {
        await page1.locator('button:has-text("Become Hacker")').click();
        await page1.waitForSelector('button:has-text("Become AI Agent")', {
          timeout: 5_000,
        });
      });

      await test.step('Bob becomes Team 2 Hacker (mobile)', async () => {
        await page2.locator('button:has-text("Become Hacker")').click();
        await page2.waitForSelector('button:has-text("Become AI Agent")', {
          timeout: 5_000,
        });
      });

      // ── PHASE 5: All players ready ────────────────────────────────────────
      await test.step('All four players mark ready (mobile)', async () => {
        for (const page of [page1, page2, page3, page4]) {
          await page.getByRole('button', { name: 'Not Ready' }).click();
        }
        await waitForLobbyState(
          request,
          lobbyId,
          (l) => l.participants.every((p) => p.ready),
          10_000,
        );
      });

      // ── PHASE 6: Alice starts the game ────────────────────────────────────
      await test.step('Alice launches the game (mobile)', async () => {
        await page1.waitForSelector(
          'button:has-text("Launch Operation"), button:has-text("Override Protocols")',
          { timeout: 10_000 },
        );

        const launchBtn = page1.getByRole('button', { name: 'Launch Operation' });
        if (await launchBtn.isVisible()) {
          await launchBtn.click();
        } else {
          await page1
            .getByRole('button', { name: 'Override Protocols' })
            .click();
          await page1.getByRole('button', { name: 'Execute Override' }).click();
        }

        await Promise.all([
          page1.waitForSelector('text=Game In Progress', { timeout: 15_000 }),
          page2.waitForSelector('text=Game In Progress', { timeout: 15_000 }),
          page3.waitForSelector('text=Game In Progress', { timeout: 15_000 }),
          page4.waitForSelector('text=Game In Progress', { timeout: 15_000 }),
        ]);
        console.log('[mobile] Game started on all four pages');
      });

      // ── PHASE 7: Verify mobile board layout ───────────────────────────────
      await test.step('Board renders in 2-column layout on mobile', async () => {
        // The Game Board paper is visible
        await expect(page3.getByText('Game Board')).toBeVisible({
          timeout: 10_000,
        });

        // Viewport width for the device under test
        const viewportWidth = page3.viewportSize()?.width ?? 390;

        // Gather bounding boxes of the first 4 grid cells containing card tiles.
        // We look for Paper elements that are children of the board Grid — they
        // contain a single Typography with the card word.
        const cardSelector =
          '[class*="MuiGrid-item"] [class*="MuiPaper-root"]';
        await page3.waitForSelector(cardSelector, { timeout: 10_000 });
        const allCards = page3.locator(cardSelector);
        const cardCount = await allCards.count();
        expect(cardCount).toBeGreaterThanOrEqual(4);

        const boxes = await Promise.all(
          [0, 1, 2, 3].map((i) => allCards.nth(i).boundingBox()),
        );
        for (const box of boxes) {
          expect(box).not.toBeNull();
        }

        // In a 2-column layout, each card should be roughly half the viewport
        // wide (minus gaps/padding).
        const cardWidth = boxes[0].width;
        expect(cardWidth).toBeLessThan(viewportWidth * 0.6);
        expect(cardWidth).toBeGreaterThan(viewportWidth * 0.3);

        // Cards in the same column share the same x coordinate.
        expect(Math.abs(boxes[0].x - boxes[2].x)).toBeLessThan(5);
        expect(Math.abs(boxes[1].x - boxes[3].x)).toBeLessThan(5);

        console.log(
          `[mobile] Board layout: cardWidth=${cardWidth.toFixed(0)}px, viewportWidth=${viewportWidth}px`,
        );
      });

      // ── PHASE 8: Game loop on mobile ──────────────────────────────────────
      const teamConfig = {
        team1: {
          hackerPage: page1,
          memberPage: page3,
          hackerId: alice.id,
          memberId: charlie.id,
          cardType: 'team1_card',
          label: 'Team 1 (AliceMobile hacks, CharlieMobile guesses)',
        },
        team2: {
          hackerPage: page2,
          memberPage: page4,
          hackerId: bob.id,
          memberId: diana.id,
          cardType: 'team2_card',
          label: 'Team 2 (BobMobile hacks, DianaMobile guesses)',
        },
      };

      let gameOver = false;
      let winner = null;

      for (let turn = 1; turn <= MAX_TURNS && !gameOver; turn++) {
        const preKeywordState = await waitForGameState(
          request,
          lobbyId,
          alice.id,
          (s) => s.game_phase === 'keyword_entry' || s.game_over,
          20_000,
        );

        if (preKeywordState.game_over) {
          gameOver = true;
          winner = preKeywordState.winner;
          console.log(`[mobile] Game ended before turn ${turn}. Winner: ${winner}`);
          break;
        }

        const activeTeam = preKeywordState.active_team;
        const cfg = teamConfig[activeTeam];
        console.log(`[mobile] Turn ${turn}: ${cfg.label} — keyword_entry`);

        // Hacker submits keyword
        await test.step(`Mobile turn ${turn}: ${activeTeam} hacker submits keyword`, async () => {
          const { hackerPage } = cfg;
          await hackerPage.waitForSelector(
            'input[placeholder*="single word"]:not([disabled])',
            { timeout: 10_000 },
          );
          await hackerPage.getByLabel('Keyword').fill(`CLUE${turn}`);
          await hackerPage.getByRole('button', { name: 'Send' }).click();
        });

        const guessingState = await waitForGameState(
          request,
          lobbyId,
          cfg.hackerId,
          (s) => s.game_phase === 'team_guessing' || s.game_over,
          10_000,
        );

        if (guessingState.game_over) {
          gameOver = true;
          winner = guessingState.winner;
          break;
        }

        const correctCard = guessingState.board.find(
          (c) => !c.revealed && c.type === cfg.cardType,
        );

        if (!correctCard) {
          console.log(`[mobile] No unrevealed ${cfg.cardType} cards left.`);
          break;
        }

        console.log(
          `[mobile] Turn ${turn}: ${cfg.label} guessing "${correctCard.word}"`,
        );

        // AI Agent taps the card and submits — same flow as desktop but on a
        // mobile viewport.
        await test.step(`Mobile turn ${turn}: ${activeTeam} AI agent taps "${correctCard.word}"`, async () => {
          const { memberPage } = cfg;
          await memberPage.waitForSelector(
            "text=Select words that match your Hacker's keyword",
            { timeout: 10_000 },
          );

          // tap() is the mobile-idiomatic way to interact with elements
          await memberPage
            .getByText(correctCard.word, { exact: true })
            .tap();

          await memberPage.waitForSelector('button:has-text("Submit Guess")', {
            timeout: 5_000,
          });
          await memberPage
            .getByRole('button', { name: /Submit Guess/ })
            .tap();
        });

        const postTurnState = await waitForGameState(
          request,
          lobbyId,
          alice.id,
          (s) => s.game_phase === 'keyword_entry' || s.game_over,
          TURN_END_POLL_TIMEOUT_MS,
        );

        if (postTurnState.game_over) {
          gameOver = true;
          winner = postTurnState.winner;
          console.log(`[mobile] Game over after turn ${turn}. Winner: ${winner}`);
          break;
        }
      }

      // ── PHASE 9: Assertions ───────────────────────────────────────────────
      expect(
        gameOver,
        'Mobile game should have ended before MAX_TURNS',
      ).toBe(true);
      expect(['team1', 'team2'], 'Winner must be a valid team').toContain(winner);

      const finalResp = await request.get(
        `${BACKEND_API_URL}/${lobbyId}?user_id=${alice.id}`,
      );
      const finalState = await finalResp.json();

      expect(finalState.game_over).toBe(true);
      expect(finalState.winner).toBe(winner);

      const winnerRemaining = finalState.team_data[winner]?.remaining_cards;
      expect(winnerRemaining, "Winner's remaining cards should be 0").toBe(0);

      for (const page of [page1, page2, page3, page4]) {
        await expect(page.getByText('Game In Progress')).toBeVisible({
          timeout: 5_000,
        });
      }

      console.log(`[mobile] All assertions passed. Winner: ${winner}`);
    } finally {
      await ctx1.close();
      await ctx2.close();
      await ctx3.close();
      await ctx4.close();
    }
  });
});
