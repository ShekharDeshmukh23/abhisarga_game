import React, { useState, useEffect } from 'react';
import { useGameData } from '../contexts/GameContext';
import { Flag, CheckCircle } from 'lucide-react';

const FinalRoomPage = () => {
  const { gameState, teams, updateTeam } = useGameData();
  const [timeLeft, setTimeLeft] = useState('00:00');
  const [notes, setNotes] = useState({});

  const finalistTeams = teams.filter(t => t.team_status === 'Final' || t.team_status === 'Finished');

  useEffect(() => {
    let interval;
    if (gameState.final_start_time) {
      interval = setInterval(() => {
        const start = new Date(gameState.final_start_time).getTime();
        const durationMs = gameState.final_timer_duration * 1000;
        const now = new Date().getTime();
        const diff = Math.max(0, start + durationMs - now);
        
        const minutes = Math.floor(diff / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        
        setTimeLeft(`${minutes}:${seconds}`);

        if (diff <= 0) clearInterval(interval);
      }, 1000);
    } else {
      const minutes = Math.floor(gameState.final_timer_duration / 60).toString().padStart(2, '0');
      const seconds = (gameState.final_timer_duration % 60).toString().padStart(2, '0');
      setTimeLeft(`${minutes}:${seconds}`);
    }

    return () => clearInterval(interval);
  }, [gameState.final_start_time, gameState.final_timer_duration]);

  return (
    <div className="text-white flex flex-col items-center h-full">
      <h1 className="text-4xl font-cinematic text-neonPurple mb-4 drop-shadow-[0_0_10px_rgba(184,0,255,0.8)] tracking-widest">
        FINAL ROOM
      </h1>

      <div className="glass-panel p-8 mb-8 border border-purple-900/50 shadow-[0_0_40px_rgba(184,0,255,0.2)]">
        <div className="text-8xl font-digital text-neonPurple text-glow-purple text-center">
          {timeLeft}
        </div>
        <div className="text-center mt-2 text-gray-400 font-body uppercase tracking-widest">
          {gameState.final_start_time ? 'COUNTDOWN RUNNING' : 'WAITING FOR ADMIN'}
        </div>
      </div>

      <div className="w-full max-w-5xl">
        <h2 className="text-xl font-bold font-body border-b border-gray-700 pb-2 mb-4">Finalist Teams</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {finalistTeams.length === 0 ? (
            <div className="col-span-full p-8 text-center glass-panel text-gray-400">
              No teams have been shortlisted to the Final room yet.
            </div>
          ) : (
            finalistTeams.map(team => (
              <div key={team.team_id} className={`glass-panel p-6 border transition-colors ${team.team_status === 'Finished' ? 'border-neonGreen' : 'border-gray-700'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">{team.team_name}</h3>
                  <span className={`px-3 py-1 text-xs font-bold rounded ${team.team_status === 'Finished' ? 'bg-green-900 text-neonGreen' : 'bg-purple-900 text-neonPurple'}`}>
                    {team.team_status.toUpperCase()}
                  </span>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">Evaluation Notes</label>
                  <textarea
                    value={notes[team.team_id] || ''}
                    onChange={(e) => setNotes({...notes, [team.team_id]: e.target.value})}
                    className="w-full bg-black border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-neonPurple min-h-[100px]"
                    placeholder="Enter manual evaluation notes..."
                  />
                </div>

                <button
                  onClick={() => updateTeam(team.team_id, { team_status: 'Finished' })}
                  disabled={team.team_status === 'Finished'}
                  className={`w-full py-3 rounded font-bold flex justify-center items-center gap-2 transition-all ${
                    team.team_status === 'Finished' 
                      ? 'bg-green-900 text-green-500 cursor-not-allowed border border-green-800' 
                      : 'bg-neonPurple text-white hover:bg-purple-500 shadow-glow-purple'
                  }`}
                >
                  <CheckCircle size={20} />
                  Mark as Completed
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalRoomPage;
