![Lockout Game Header](./frontend/src/lockout.png)

# 🔐 Lockout Game

**Lockout** game — a Webex-integrated, real-time multiplayer word game inspired by _Codenames_, reimagined with a **hacker vs cybersecurity AI theme**.

Players join teams, take on roles, ready up, and launch into a game session directly within a Webex meeting using **Socket.IO + LobbyContext-powered React frontend**.

---

## 🚀 Gameplay Theme – Lockout

In the digital underworld, two rival hacker groups — **Bluewave** and **Redshift** — compete to extract sensitive data from a hostile AI system known as **Sentinel**.

- 🧠 **Hackers** (Team Leads): Give strategic clues
- 🤖 **AI Agents** (Teammates): Decode clues and extract files
- 💀 **Cybersecurity Traps**: One wrong guess, game over
- 🕸 **Honeypots**: Decoys planted by Sentinel

Only one team will breach the vault. Will you outsmart the AI, or fall into its trap?

---

## 🧩 Architecture Overview

This frontend is a **Vite + React application** using:

- **React Context API** (no Redux, no external state libraries)
- **MUI v6** for component design
- **Socket.IO** for real-time updates
- **Webex Embedded Apps SDK** for user and meeting identity

---

## 🔧 Key Features

| Feature                          | Description                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 🔐 **LobbyContext**              | All lobby state (participants, roles, team, ready status) is managed globally via React Context               |
| 🔄 **WebSocket Updates**         | All state changes are real-time via `Socket.IO`                                                               |
| 💬 **Team Role Assignment**      | One Hacker per team; players can switch teams or roles                                                        |
| ✅ **Ready Up System**           | Players mark themselves "Ready"; game won't start until conditions are met                                    |
| 🗡 **Self-contained Components** | UI components like `LobbyDetails`, `LobbyParticipants`, and `LobbyActions` are all context-aware and reusable |
| ⚡ **Hot Module Reload Safe**    | All context is split properly for HMR support                                                                 |

---

## 📚 How to Use `LobbyContext` in Components

```js
import { useLobbyContext } from '../context/useLobbyContext';

const MyComponent = () => {
  const {
    lobby,
    user,
    joinLobby,
    toggleReady,
    isUserTeamLead,
    updateDisplayName,
  } = useLobbyContext();

  return <div>Welcome, {user?.display_name}</div>;
};
```

> Must be rendered within a `<LobbyProvider lobbyId="..." initialUser={...}>` scope.

---

## 🧪 Developer Tip – Testing a Component in Isolation

```jsx
import { LobbyContext } from '../context/LobbyContext';

<LobbyContext.Provider value={mockContextValue}>
  <MyComponent />
</LobbyContext.Provider>;
```

---

## 🎞 Game Start Conditions (Enforced by Backend)

- ✅ **Each team has one Hacker (team lead)**
- ✅ **Teams are balanced**
- ✅ **All players are Ready**

Optionally, the **Game Host** can use **Force Start** (bypasses balance check but not readiness).

---

## 📜 Contribution Notes

- Use `Grid2` from `@mui/material` with the `size={{ xs, sm }}` prop.
- Follow Prettier config:
  ```json
  {
    "singleQuote": true,
    "tabWidth": 2,
    "useTabs": false,
    "semi": true,
    "endOfLine": "auto"
  }
  ```
- All Python backend code is formatted via Ruff.
- Context-based code is preferred over prop-drilling or hooks with duplicate state.

---

Made with ❤️ by the Webex Developer Relations Team
