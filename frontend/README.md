# 🎨 LudoNeo — Frontend

React 19 + Vite SPA with a cyberpunk neon aesthetic. Manages local/bot/online game modes through Zustand, communicates with the backend via Axios (REST) and Socket.IO (real-time), and animates everything with GSAP + Framer Motion.

> **→ [Root README](../README.md)** · **→ [Server README](../server/README.md)**

---

## 📦 Dependencies

| Package                  | Version    | Purpose                                                    |
|--------------------------|------------|------------------------------------------------------------|
| `react` / `react-dom`    | ^19.1.1    | UI framework                                               |
| `vite`                   | ^7.3.1     | Build tool & dev server                                    |
| `@vitejs/plugin-react`   | ^5.0.3     | Vite React plugin                                          |
| `tailwindcss`            | ^4.1.13    | Utility-first CSS (v4 — via `@tailwindcss/vite` plugin)    |
| `@tailwindcss/vite`      | ^4.1.13    | Tailwind v4 Vite integration                               |
| `zustand`                | ^5.0.9     | Global state (user store + game store)                     |
| `react-router-dom`       | ^7.9.1     | Client-side routing + navigation blocker                   |
| `axios`                  | ^1.12.2    | HTTP REST client (cookie-based auth)                       |
| `socket.io-client`       | ^4.8.1     | Real-time WebSocket connection to server                   |
| `framer-motion`          | ^12.23.26  | Page transitions & component animations                    |
| `gsap` + `@gsap/react`   | ^3.14.2 / ^2.1.2 | Advanced animations (timers, scroll triggers, tweens)|
| `lucide-react`           | ^0.563.0   | Icon set                                                   |
| `react-toastify`         | ^11.0.5    | Toast notifications (cyberpunk theme override in CSS)      |
| `@imagekit/react`        | ^5.0.2     | ImageKit image components                                  |
| `react-image-crop`       | ^11.0.10   | Avatar cropping UI                                         |
| `clsx` + `tailwind-merge`| ^2.1.1 / ^3.5.0 | Conditional + conflict-free class names              |
| `ogl`                    | ^1.0.11    | WebGL particle background (`Particles.jsx`)                |
| `three`                  | ^0.167.1   | 3D graphics utilities                                      |

---

## 📁 Directory Structure

```
frontend/
├── index.html                         ← app shell (title: "Ludo Champ")
├── vite.config.js                     ← React + Tailwind v4 plugins, @ alias
├── jsconfig.json                      ← @/* → src/* path alias for IDEs
├── components.json                    ← shadcn/ui (new-york, neutral, no RSC)
├── eslint.config.js
├── package.json
├── public/
│   ├── ChampLogo.png                  ← favicon
│   └── defaultProfile.png             ← avatar fallback
└── src/
    ├── main.jsx                       ← entry — wraps App in AudioProvider
    ├── App.jsx                        ← BrowserRouter + all routes + ToastContainer
    ├── main.css                       ← Tailwind directives, global resets
    ├── ErrorBoundary.jsx              ← class-based error boundary
    ├── api/
    │   ├── axiosConfig.js             ← Axios instance (baseURL, withCredentials: true)
    │   └── socket.js                  ← Socket.IO singleton (autoConnect: false)
    ├── assets/
    │   ├── DiceRoll.mp3
    │   ├── WinSound.mp3
    │   ├── FinishSound.mp3
    │   └── SlideEffect.mp3
    ├── contexts/
    │   ├── SoundContext.jsx           ← AudioContext — SFX + music state + toggles
    │   └── PiecePath.js               ← pre-computed path arrays (mirrors server util)
    ├── lib/
    │   └── utils.js                   ← cn() helper + validateEmail()
    ├── derivedFuncs/
    │   ├── debounce.js
    │   └── moveFunctions.js
    ├── store/
    │   ├── userStore.js               ← Zustand: identity, stats, inventory, settings
    │   ├── useGameStore.js            ← Zustand: game state (persisted to localStorage)
    │   ├── userActions.js             ← userStore mutators
    │   ├── gameLogic.js               ← offline/bot game actions + stat recording
    │   └── onlineGameLogic.js         ← online state sync (syncFullState, patchDeltaState)
    ├── pages/
    │   ├── Dashboard.jsx              ← main hub: game mode menu, modals
    │   ├── GameSetup.jsx              ← player config + game launch (all 4 modes)
    │   ├── Session.jsx                ← active game wrapper, socket lifecycle
    │   ├── Home.jsx                   ← landing
    │   └── Profile.jsx                ← user profile (placeholder)
    ├── components/
    │   ├── sharedBoardComponents/
    │   │   ├── Cell.jsx               ← single board cell renderer
    │   │   ├── DiceFace.jsx           ← pip-based dice face (values 1–6)
    │   │   └── LudoSkeleton.jsx       ← loading skeleton for game board
    │   ├── customComponents/
    │   │   ├── AnimatedContent.jsx    ← GSAP ScrollTrigger entrance animation
    │   │   ├── GradientText.jsx       ← neon gradient text
    │   │   ├── Particles.jsx          ← WebGL particle system (OGL)
    │   │   └── ElectricBorder.jsx     ← animated glowing border
    │   ├── onlineBoard/
    │   │   ├── LudoOnline.jsx         ← online game orchestrator (all socket events)
    │   │   └── gameboard/
    │   │       ├── GameBoard.jsx      ← online board renderer (pieces, animations)
    │   │       ├── Dice.jsx           ← server-authoritative dice
    │   │       └── PlayerBoard.jsx    ← player HUD with conic-gradient turn timer
    │   └── offlineBoard/
    │       ├── LudoOffline.jsx        ← offline/bot game orchestrator
    │       └── gameboard/
    │           ├── GameBoard.jsx      ← offline board renderer
    │           ├── Dice.jsx           ← local random dice + bot auto-roll logic
    │           └── PlayerBoard.jsx    ← offline player HUD
    └── styles/
        ├── gameBoard.css              ← 15×15 CSS Grid board (grid-template-areas)
        ├── dice.css                   ← shake keyframe animation
        ├── playerBoard.css            ← conic-gradient timer ring
        ├── cell.css                   ← no-select utilities
        ├── session.css                ← session page overrides
        ├── menu.css                   ← dashboard menu hover effects
        ├── StarBorder.css             ← star border sweep animation
        └── options.css                ← custom scrollbar + Toastify cyberpunk overrides
```

---

## ⚙️ Environment Variables

Create `frontend/.env` (or `.env.local`):

```env
# ── Backend URL ──────────────────────────────────────────────────────────────
# Only used in PRODUCTION builds. In development the app hits localhost:3000.
VITE_BACKEND_URL=https://your-backend.onrender.com

# ── Optional: force production mode detection ─────────────────────────────────
# The socket.js file checks import.meta.env.VITE_MODE to decide the server URL.
# Vite's built-in import.meta.env.PROD covers most cases — set this only if needed.
VITE_MODE=production
```

### How the backend URL is resolved

**Axios (`axiosConfig.js`):**
```js
baseURL: import.meta.env.PROD
  ? import.meta.env.VITE_BACKEND_URL  // production build
  : "http://localhost:3000"            // dev server
```

**Socket.IO (`socket.js`):**
```js
const SERVER_URL = import.meta.env.VITE_MODE === "production"
  ? import.meta.env.VITE_BACKEND_URL
  : "http://localhost:3000";
```

---

## 🚦 Running the Frontend

```bash
cd frontend

npm run dev      # Vite dev server → http://localhost:5173
npm run build    # Production build → dist/
npm run preview  # Preview the production build locally
npm run lint     # ESLint check
```

---

## 🗺️ Route Map

| Path                              | Component    | Notes                                          |
|-----------------------------------|--------------|------------------------------------------------|
| `/`                               | `Home`       | Landing page                                   |
| `/dashboard`                      | `Dashboard`  | Main hub — requires login for online features  |
| `/setup/:boardType`               | `GameSetup`  | boardType: `offline`, `bot`, `poi`, `pof`      |
| `/session/:boardType`             | `Session`    | Offline / bot / POI session                    |
| `/session/:boardType/:gameId`     | `Session`    | POF session or loaded saved game               |
| `/options/*`                      | (auth pages) | Login, register, verify email, reset password  |

---

## 🏪 Zustand Store Architecture

### `userStore` — user identity, stats, inventory

```js
{
  info:      { fullname, username, email, avatar, isVerified, notifications[] },
  stats:     { level, xp, nextLevelXp, wins, losses, totalMatches, winRate, matchHistory[] },
  inventory: { badges[], themes[], currentTheme, avatarBorders[], currentBorder },
  settings:  { musicVolume, sfxVolume, haptics, lowGraphics }
}
```

Actions are in `userActions.js` (`updateUserInfo`, `resetUserStore`, `markNotificationAsRead`).

### `useGameStore` — game state (persisted to `localStorage`)

```js
{
  meta:    { gameId, status, type, syncTick, onBoard (Set), playerCount, winLast, ... },
  move:    { turn, rollAllowed, moveAllowed, moveCount, ticks, moving, timeOut },
  players: { R: { pieceIdx[], pieceRef (Map), homeCount, outCount, winPosn, ... },
             B, Y, G }
}
```

`Map` and `Set` values are serialised/deserialised with a custom `replacer`/`reviver` so they survive `localStorage` round-trips.

**Actions (`gameLogic.js`):** `initiateGame`, `updateMoveCount`, `updatePieceState`, `transferTurn`, `updateTimeOut`, `setMoving`, `resetStore`, `endGame`, `saveGameToDB`, `loadGameFromDB`.

**Online sync (`onlineGameLogic.js`):** `syncFullState` (full replace from server), `patchDeltaState` (partial update using syncTick validation).

---

## 🔌 Socket Lifecycle (`Session.jsx`)

```
mount
  └─ isOnlineMode && userInfo populated
       └─ set socket.auth  (POI: raw user obj; POF: JWT from ?idf= query param)
       └─ socket.connect()

  └─ register connect / connect_error handlers
       └─ on connect (POI only): emit "join-game"
       └─ on connect_error: toast + navigate to /dashboard

  └─ register all game event listeners (LudoOnline.jsx)

unmount
  └─ socket.disconnect()
  └─ gameActions.resetStore()
```

A `useBlocker` hook intercepts navigation while a game is in progress. For offline/bot modes it prompts the user to save before leaving.

---

## 🔊 Audio System

`SoundContext.jsx` exposes `{ sound, music, toggleSound, toggleMusic }` to all components through `AudioContext`.

- **SFX** (`sound`): dice roll, piece slide, win, finish — triggered inside `Dice.jsx` and `GameBoard.jsx` with `<audio>` refs.
- **Music** (`music`): background music toggle — wired to the Dashboard settings modal and the in-game menu.

---

## 🎨 Styling Notes

- **Tailwind v4** is used via the `@tailwindcss/vite` plugin — no separate `tailwind.config.js` is needed.
- The `@` alias maps to `src/` (configured in both `vite.config.js` and `jsconfig.json`).
- The board layout (`gameBoard.css`) uses a named **CSS Grid** with `grid-template-areas` for all 52 track cells, 4 home zones, 4 colour tracks, and the central finish zone — matching the classic 15×15 Ludo grid.
- Player turn timers use a **conic-gradient** animated by GSAP tweening a `--angle` CSS custom property from `0deg` → `360deg` over 30 seconds.
- Toast notifications are styled in `options.css` to match the cyberpunk theme (dark glass background, neon border-left, Courier New font).