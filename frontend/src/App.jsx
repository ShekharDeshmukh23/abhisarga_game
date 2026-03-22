import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminPage from './pages/AdminPage';
import TeamsPage from './pages/TeamsPage';
import TimerPage from './pages/TimerPage';
import ModPage from './pages/ModPage';
import FinalRoomPage from './pages/FinalRoomPage';
import LeaderboardPage from './pages/LeaderboardPage';
import WinnerPage from './pages/WinnerPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/winner" element={<WinnerPage />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/admin" replace />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="timer" element={<TimerPage />} />
          <Route path="mod/:roomNumber" element={<ModPage />} />
          <Route path="final" element={<FinalRoomPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
