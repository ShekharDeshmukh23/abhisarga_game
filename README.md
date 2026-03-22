# Game Moderator Management System

A full-stack, realtime web application designed to manage a multi-room, multi-level game complete with global countdown timers, final countdown timers, admin controls, moderator interfaces, and a live Stranger Things-themed leaderboard.

## Features

- **📶 Offline-First Architecture**: The frontend uses a LocalStorage layer, meaning you can play, manage, and track the game without any active internet or backend connection.
- **🔄 JSON State Backup**: Admins can export and import the entire game state (Teams, Times, Answers) as `.json` files.
- **🌐 Sync Ready**: Pre-configured Socket.io backend to force-sync local progress to the cloud.
- **🕹️ Specific UIs**: 
  - `Admin Control (/admin)`
  - `Teams Management (/teams)`
  - `Global Timer Display (/timer)`
  - `Moderator Room 1-3 (/mod/1)`
  - `Final Room Check (/final)`
  - `Live Leaderboard (/leaderboard)`

---

## 🚀 Running the Project

### 1. Prerequisites
- Node.js (v18+)

### 2. Frontend (React + Vite + Tailwind)
The frontend contains the primary logic and offline store.

```bash
cd frontend
npm install
npm run dev
```

*The frontend will launch typically on `http://localhost:5173`.*

### 3. Backend (Express + Socket.io + MongoDB)
The backend is a lightweight syncing module.

```bash
cd backend
npm install
node src/index.js
```

*(Note: the backend uses port `4000` by default. You can define a `.env` file inside `backend/` with `MONGO_URI` and `PORT` to change its targets)*

---

## 🏆 Game Flow

### Preparation
1. Open the **Admin Panel** (`/admin`), set your mode.
2. Open the **Teams Management** page (`/teams`). Add Participating Teams and assign their Rooms (`1`, `2`, or `3`).
3. Set up displays for the **Live Leaderboard** (`/leaderboard`).
4. Set up displays for the **Global Timer** (`/timer`).

### Gameplay (Levels 1-3)
1. **Admin** clicks `Start Global Timer`.
2. Teams play the game in their physical/virtual rooms.
3. **Moderators** (on `/mod/1`, `/mod/2`, or `/mod/3`) monitor the teams. When a team provides the correct Answer Key, the Moderator clicks `Submit` or `Pass` to advance them.
4. The **Live Leaderboard** auto-sorts teams based on which level they reached and how fast they completed it.

### Finals (Level 4)
1. When top teams have completed Level 3, the Admin will change their statuses to `Final` in the Teams Page.
2. Admin goes to **Admin Panel** and starts the **Final Countdown**. This stops the Global Timer.
3. The shortlisted teams complete the final objective under a 10:00 visual countdown on the **Final Room Page** (`/final`).
4. Evaluators grade the performance manually on the Final Room Page, then click **Mark as Completed** to officially lock the team as `Finished`.
5. The top `Finished` team on the Leaderboard is the winner!
