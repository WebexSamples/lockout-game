/**
 * Full 4-Player Game E2E Test
 *
 * This test simulates 4 real browser tabs playing through a complete Lockout game:
 *
 *   Player 1 – Alice   (Host, Team 1, Hacker / Team Lead)
 *   Player 2 – Bob     (Team 2, Hacker / Team Lead)
 *   Player 3 – Charlie (Team 1, AI Agent / Member)
 *   Player 4 – Diana   (Team 2, AI Agent / Member)
 *
 * Flow:
 *   1. Alice creates a lobby.
 *   2. Bob, Charlie, Diana join the lobby.
 *   3. Alice and Bob become Hackers for their respective teams.
 *   4. All four players mark themselves as Ready.
 *   5. Alice (host) launches the game.
 *   6. The game loop runs until one team wins:
 *        a. Active team's Hacker submits a keyword.
 *        b. Active team's AI Agent selects the correct card and submits a guess.
 *        c. The backend auto-ends the turn after 3 s.
 *   7. Assertions verify the game completed with a valid winner.
 *
 * Prerequisites (must be running before this test):
 *   Backend  → python -m backend.app        (http://localhost:5000)
 *   Frontend → cd frontend && npm run dev   (http://localhost:5173)
 */

import { test, expect } from '@playwright/test';

// ─── Constants ────────────────────────────────────────────────────────────────

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

/** Maximum number of turns before the test fails (safety guard). */
const MAX_TURNS = 25;

/**
 * How long (ms) to wait for the backend to auto-advance the turn.
 * The backend sleeps 3 s after a guess before ending the turn, so we need to
 * wait more than that plus some socket-propagation headroom.
 */
const TURN_END_WAIT_MS = 8_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Polls the backend game API until `condition(state)` returns true or the
 * deadline is reached.  Returns the matching game state.
 *
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} lobbyId
 * @param {string} userId  – User whose perspective the state is sanitized for.
 *                           Pass the team-lead's ID to see card types.
 * @param {(state: object) => boolean} condition
 * @param {number} [timeout=15000]
 */
async function waitForGameState(request, lobbyId, userId, condition, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const resp = await request.get(`${BACKEND_URL}/game/${lobbyId}?user_id=${userId}`);
    if (resp.ok()) {
      const state = await resp.json();
      if (condition(state)) return state;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`waitForGameState timed out after ${timeout} ms`);
}

/**
 * Polls the backend lobby API until `condition(lobby)` returns true.
 */
async function waitForLobbyState(request, lobbyId, condition, timeout = 10_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const resp = await request.get(`${BACKEND_URL}/lobby/${lobbyId}`);
    if (resp.ok()) {
      const lobby = await resp.json();
      if (condition(lobby)) return lobby;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`waitForLobbyState timed out after ${timeout} ms`);
}

// ─── Test ─────────────────────────────────────────────────────────────────────

test.describe('Full 4-Player Lockout Game', () => {
  // The full game can take several minutes in the worst case.
  test.setTimeout(3 * 60 * 1_000);

  test('four players complete a game from lobby creation to a winner', async ({
    browser,
    request,
  }) => {
    // Create four completely independent browser contexts — each represents a
    // distinct user with their own local storage, cookies, and WebSocket conn.
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();
    const ctx3 = await browser.newContext();
    const ctx4 = await browser.newContext();

    try {
      const page1 = await ctx1.newPage(); // Alice  – Host, Team 1 Hacker
      const page2 = await ctx2.newPage(); // Bob    – Team 2 Hacker
      const page3 = await ctx3.newPage(); // Charlie – Team 1 AI Agent
      const page4 = await ctx4.newPage(); // Diana   – Team 2 AI Agent

      // ══════════════════════════════════════════════════════════════════════
      // PHASE 1 — ALICE CREATES THE LOBBY
      // ══════════════════════════════════════════════════════════════════════

      await test.step('Alice creates the lobby', async () => {
        // Navigate with ?disableWebex=true so the Webex SDK is bypassed and the
        // form fields are not pre-filled with SDK values we do not control.
        await page1.goto(`${FRONTEND_URL}/game?disableWebex=true`);
        await page1.getByLabel('Game Name').fill('Test Lockout Game');
        await page1.getByLabel('Your Display Name').fill('Alice');

        // Uncheck Webex integration in case it was checked by default
        const webexCheckbox = page1.getByLabel('Enable Webex Integration');
        if (await webexCheckbox.isChecked()) {
          await webexCheckbox.uncheck();
        }

        await page1.getByRole('button', { name: 'Create Game' }).click();

        // Wait for the React Router redirect to /game/<lobbyId>
        await page1.waitForURL(`${FRONTEND_URL}/game/**`, { timeout: 10_000 });
      });

      // Extract lobby ID from the URL
      const lobbyId = page1.url().split('/game/')[1].split('?')[0];
      console.log(`[setup] Lobby created: ${lobbyId}`);

      // Wait for Alice's lobby UI to render
      await page1.waitForSelector('text=Test Lockout Game', { timeout: 10_000 });

      // ══════════════════════════════════════════════════════════════════════
      // PHASE 2 — BOB, CHARLIE, DIANA JOIN THE LOBBY
      // ══════════════════════════════════════════════════════════════════════

      /**
       * Navigate to the lobby URL, fill the join form, and wait for the lobby
       * UI to appear.
       */
      const joinLobby = async (page, displayName) => {
        await page.goto(`${FRONTEND_URL}/game/${lobbyId}?disableWebex=true`);
        // The JoinLobby component is shown until the player submits a name
        await page.waitForSelector('text=Join Lobby', { timeout: 10_000 });
        await page.getByLabel('Enter your display name').fill(displayName);
        await page.getByRole('button', { name: 'Join Lobby' }).click();
        // After joining, the lobby view (showing participants) should appear
        await page.waitForSelector('text=Test Lockout Game', { timeout: 10_000 });
      };

      await test.step('Bob joins the lobby', () => joinLobby(page2, 'Bob'));
      await test.step('Charlie joins the lobby', () => joinLobby(page3, 'Charlie'));
      await test.step('Diana joins the lobby', () => joinLobby(page4, 'Diana'));

      // Allow socket updates to propagate so all pages reflect the current roster
      await page1.waitForTimeout(1_000);

      // ── Verify team composition via backend API ───────────────────────────
      // Auto-assignment always places the host on team1 and then alternates to
      // balance teams.  With 4 players joining in order:
      //   Alice   → team1 (host default)
      //   Bob     → team2 (team1 count > team2 count)
      //   Charlie → team1 (teams equal → defaults to team1)
      //   Diana   → team2 (team1 count > team2 count)

      const initialLobby = await waitForLobbyState(
        request,
        lobbyId,
        (l) => l.participants.length === 4,
        15_000,
      );

      const findParticipant = (name) =>
        initialLobby.participants.find((p) => p.display_name === name);

      const alice = findParticipant('Alice');
      const bob = findParticipant('Bob');
      const charlie = findParticipant('Charlie');
      const diana = findParticipant('Diana');

      console.log(
        `[setup] Teams — Alice: ${alice.team}, Bob: ${bob.team}, Charlie: ${charlie.team}, Diana: ${diana.team}`,
      );

      // Validate expected team composition
      expect(alice.team).toBe('team1');
      expect(bob.team).toBe('team2');
      expect(charlie.team).toBe('team1');
      expect(diana.team).toBe('team2');

      // ══════════════════════════════════════════════════════════════════════
      // PHASE 3 — ASSIGN TEAM LEADS (HACKERS)
      // ══════════════════════════════════════════════════════════════════════

      await test.step('Alice becomes Team 1 Hacker', async () => {
        // "Become Hacker" only appears for the current user's own team
        await page1.getByRole('button', { name: 'Become Hacker' }).click();
        // Wait for the button to change to "Become AI Agent", confirming success
        await page1.waitForSelector('button:has-text("Become AI Agent")', {
          timeout: 5_000,
        });
      });

      await test.step('Bob becomes Team 2 Hacker', async () => {
        await page2.getByRole('button', { name: 'Become Hacker' }).click();
        await page2.waitForSelector('button:has-text("Become AI Agent")', {
          timeout: 5_000,
        });
      });

      // ══════════════════════════════════════════════════════════════════════
      // PHASE 4 — ALL PLAYERS MARK READY
      // ══════════════════════════════════════════════════════════════════════

      await test.step('All four players mark themselves ready', async () => {
        // Each player clicks their own ready toggle.
        // The IconButton has aria-label="Not Ready" when the player is not ready.
        for (const page of [page1, page2, page3, page4]) {
          await page.getByRole('button', { name: 'Not Ready' }).click();
        }

        // Verify all four players are ready on Alice's view
        await waitForLobbyState(
          request,
          lobbyId,
          (l) => l.participants.every((p) => p.ready),
          10_000,
        );
        console.log('[setup] All players are ready');
      });

      // ══════════════════════════════════════════════════════════════════════
      // PHASE 5 — ALICE (HOST) STARTS THE GAME
      // ══════════════════════════════════════════════════════════════════════

      await test.step('Alice launches the game', async () => {
        // When all criteria are met the HostControls renders "Launch Operation".
        // If any criterion is missing it renders "Override Protocols" instead,
        // which opens a confirmation dialog before force-starting.
        const launchBtn = page1.getByRole('button', { name: 'Launch Operation' });
        const overrideBtn = page1.getByRole('button', { name: 'Override Protocols' });

        if (await launchBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await launchBtn.click();
        } else {
          await overrideBtn.click();
          await page1
            .getByRole('button', { name: 'Execute Override' })
            .click();
        }

        // All four pages should transition to the in-game view
        await Promise.all([
          page1.waitForSelector('text=Game In Progress', { timeout: 15_000 }),
          page2.waitForSelector('text=Game In Progress', { timeout: 15_000 }),
          page3.waitForSelector('text=Game In Progress', { timeout: 15_000 }),
          page4.waitForSelector('text=Game In Progress', { timeout: 15_000 }),
        ]);

        console.log('[game] Game started on all four pages');
      });

      // ══════════════════════════════════════════════════════════════════════
      // PHASE 6 — GAME LOOP
      // ══════════════════════════════════════════════════════════════════════

      // Map each team to its pages and participant IDs so the loop can work
      // generically regardless of which team is active.
      const teamConfig = {
        team1: {
          hackerPage: page1,
          memberPage: page3,
          hackerId: alice.id,
          memberId: charlie.id,
          cardType: 'team1_card',
          label: 'Team 1 (Alice hacks, Charlie guesses)',
        },
        team2: {
          hackerPage: page2,
          memberPage: page4,
          hackerId: bob.id,
          memberId: diana.id,
          cardType: 'team2_card',
          label: 'Team 2 (Bob hacks, Diana guesses)',
        },
      };

      let gameOver = false;
      let winner = null;

      for (let turn = 1; turn <= MAX_TURNS && !gameOver; turn++) {
        // ── Wait for keyword_entry phase ────────────────────────────────────
        const preKeywordState = await waitForGameState(
          request,
          lobbyId,
          alice.id, // Use Alice's ID — as team1 hacker she sees all card types
          (s) => s.game_phase === 'keyword_entry' || s.game_over,
          20_000,
        );

        if (preKeywordState.game_over) {
          gameOver = true;
          winner = preKeywordState.winner;
          console.log(`[game] Game ended before turn ${turn}. Winner: ${winner}`);
          break;
        }

        const activeTeam = preKeywordState.active_team;
        const cfg = teamConfig[activeTeam];
        console.log(`[game] Turn ${turn}: ${cfg.label} — keyword_entry`);

        // ── Hacker submits a keyword ─────────────────────────────────────────
        await test.step(`Turn ${turn}: ${activeTeam} hacker submits keyword`, async () => {
          const { hackerPage } = cfg;

          // Wait for the Hacker Terminal to become enabled (isTeamTurn = true)
          await hackerPage.waitForSelector('input[placeholder*="single word"]', {
            timeout: 10_000,
          });

          const keywordInput = hackerPage.getByLabel('Keyword');
          await keywordInput.fill(`CLUE${turn}`);
          await hackerPage.getByRole('button', { name: 'Send' }).click();
        });

        // ── Wait for team_guessing phase ────────────────────────────────────
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
          console.log(`[game] Game ended after keyword. Winner: ${winner}`);
          break;
        }

        // ── Identify a correct card to guess ─────────────────────────────────
        // The state returned for the hacker includes card type information
        // (since the hacker's view is not sanitized).  Pick one unrevealed card
        // of the active team's type so the guess is always correct.
        const correctCard = guessingState.board.find(
          (c) => !c.revealed && c.type === cfg.cardType,
        );

        if (!correctCard) {
          // All of this team's cards are already revealed — the game should
          // be over; handle it gracefully.
          console.log(`[game] No unrevealed ${cfg.cardType} cards left. Ending loop.`);
          break;
        }

        console.log(
          `[game] Turn ${turn}: ${cfg.label} guessing card "${correctCard.word}" (id: ${correctCard.id})`,
        );

        // ── AI Agent (member) selects the card and submits the guess ─────────
        await test.step(`Turn ${turn}: ${activeTeam} AI agent guesses "${correctCard.word}"`, async () => {
          const { memberPage } = cfg;

          // Wait for the board to be in "selectable" mode.
          // GameBoard shows this prompt when isUserTurn is true:
          await memberPage.waitForSelector(
            "text=Select words that match your Hacker's keyword",
            { timeout: 10_000 },
          );

          // Click the target card tile — the word is displayed inside a Paper
          // element with an onClick handler.
          await memberPage.getByText(correctCard.word, { exact: true }).click();

          // Wait for the "Submit Guess" button to appear (appears after card
          // selection updates local state).
          await memberPage.waitForSelector('button:has-text("Submit Guess")', {
            timeout: 5_000,
          });
          await memberPage.getByRole('button', { name: /Submit Guess/ }).click();
        });

        // ── Wait for the turn to end ─────────────────────────────────────────
        // The backend sleeps 3 s after processing the guess and then calls
        // end_turn().  We wait a fixed amount plus a generous buffer.
        console.log(`[game] Turn ${turn}: waiting for turn end (~${TURN_END_WAIT_MS / 1000}s)...`);
        await page1.waitForTimeout(TURN_END_WAIT_MS);

        // Poll for the next keyword_entry (or game_over)
        const postTurnState = await waitForGameState(
          request,
          lobbyId,
          alice.id,
          (s) => s.game_phase === 'keyword_entry' || s.game_over,
          10_000,
        );

        if (postTurnState.game_over) {
          gameOver = true;
          winner = postTurnState.winner;
          console.log(`[game] Game over after turn ${turn}. Winner: ${winner}`);
          break;
        }
      }

      // ══════════════════════════════════════════════════════════════════════
      // PHASE 7 — ASSERTIONS
      // ══════════════════════════════════════════════════════════════════════

      // The game must have ended naturally within the turn budget.
      expect(gameOver, 'Game should have ended before MAX_TURNS was reached').toBe(true);
      expect(['team1', 'team2'], 'Winner must be a valid team').toContain(winner);

      console.log(`[result] Winner: ${winner}`);

      // Confirm the final backend state matches what we observed.
      const finalResp = await request.get(
        `${BACKEND_URL}/game/${lobbyId}?user_id=${alice.id}`,
      );
      const finalState = await finalResp.json();

      expect(finalState.game_over).toBe(true);
      expect(finalState.winner).toBe(winner);

      // Verify the winner's remaining card count is 0 (all cards revealed).
      const winnerRemaining = finalState.team_data[winner]?.remaining_cards;
      expect(winnerRemaining, "Winner's remaining card count should be 0").toBe(0);

      // All four pages should still show "Game In Progress" (game does not
      // auto-navigate away; the host must manually end it).
      for (const page of [page1, page2, page3, page4]) {
        await expect(page.getByText('Game In Progress')).toBeVisible({
          timeout: 5_000,
        });
      }

      console.log('[result] All assertions passed ✓');
    } finally {
      // Always close browser contexts to release resources.
      await ctx1.close();
      await ctx2.close();
      await ctx3.close();
      await ctx4.close();
    }
  });
});
