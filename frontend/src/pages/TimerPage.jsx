import React, { useState, useEffect } from 'react';
import { useGameData } from '../contexts/GameContext';

const TimerPage = () => {
  const { gameState } = useGameData();
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    let interval;
    if (gameState.global_timer_status === 'Running' && gameState.global_start_time) {
      interval = setInterval(() => {
        const start = new Date(gameState.global_start_time).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, now - start);
        
        const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        
        setElapsed(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    } else if (gameState.global_timer_status === 'Paused' || gameState.global_timer_status === 'Stopped') {
      const diff = gameState.global_elapsed_ms || 0;
      const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setElapsed(`${hours}:${minutes}:${seconds}`);
    }

    return () => clearInterval(interval);
  }, [gameState.global_timer_status, gameState.global_start_time, gameState.global_elapsed_ms]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-white">
      <h1 className="text-4xl font-cinematic text-neonRed mb-8 drop-shadow-[0_0_10px_rgba(255,0,60,0.8)] tracking-widest">
        GLOBAL TIMER
      </h1>
      
      <div className={`glass-panel p-16 shadow-[0_0_50px_rgba(255,0,60,0.3)] border relative overflow-hidden transition-all duration-500
        ${gameState.global_timer_status === 'Paused' ? 'border-yellow-500/50 shadow-[0_0_50px_rgba(255,238,0,0.3)]' : 'border-red-900/50'}`}>
        
        {gameState.global_timer_status === 'Running' && (
          <div className="absolute inset-0 bg-red-900/10 animate-pulse-glow z-0 pointer-events-none"></div>
        )}
        
        <div className={`text-9xl font-digital text-glow-red z-10 relative transition-colors duration-500
          ${gameState.global_timer_status === 'Paused' ? 'text-neonYellow text-glow-yellow' : 'text-neonRed'}
          ${gameState.global_timer_status === 'Paused' ? 'animate-pulse' : ''}
        `}>
          {elapsed}
        </div>
        
        <div className="text-center mt-4 text-gray-400 font-body uppercase tracking-widest z-10 relative">
          STATUS: {gameState.global_timer_status}
        </div>
      </div>
    </div>
  );
};

export default TimerPage;
