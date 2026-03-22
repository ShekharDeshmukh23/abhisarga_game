import React, { useState, useRef } from 'react';
import { useGameData } from '../contexts/GameContext';
import { Play, Square, Pause, RotateCcw, Download, Upload, RefreshCw, Lock, Unlock, Trophy, Plus, Minus } from 'lucide-react';

const AdminPage = () => {
  const { 
    gameState, updateGameState, appMode, setAppMode, exportState, importState,
    startGlobal, pauseGlobal, stopGlobal,
    startFinal, pauseFinal, resetFinal, adjustFinal,
    teams, updateTeam, adjustTeamTime
  } = useGameData();
  
  const fileInputRef = useRef();
  const [customDuration, setCustomDuration] = useState(10); // in minutes

  const handleSetCustomFinal = () => {
    updateGameState({ final_timer_duration: customDuration * 60 });
  };

  const handleExport = () => {
    const data = exportState();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stranger_things_backup_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSVExport = () => {
    // Basic CSV export for leaderboard
    const headers = ["Team Name", "Room", "Level", "Status", "Bonus(ms)", "Penalty(ms)"];
    const rows = teams.map(t => `${t.team_name},${t.room_number},${t.current_level},${t.team_status},${t.bonus_time_ms},${t.penalty_time_ms}`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encodedUri;
    a.download = `leaderboard_${new Date().toISOString()}.csv`;
    a.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file && window.confirm('Are you sure you want to overwrite current state with this backup?')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        importState(event.target.result);
        window.location.reload();
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="text-white pb-20">
      <h1 className="text-3xl font-cinematic text-neonRed mb-6 drop-shadow-[0_0_10px_rgba(255,0,60,0.8)]">ADMIN CONTROLS</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* TIMERS PANEL */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold font-body text-neonBlue border-b border-gray-700 pb-2 mb-4">GLOBAL TIMER</h2>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Status</span>
              <span className={`px-3 py-1 text-sm font-bold rounded ${gameState.global_timer_status === 'Running' ? 'bg-green-900 text-neonGreen' : gameState.global_timer_status === 'Paused' ? 'bg-yellow-900 text-neonYellow' : 'bg-gray-800'}`}>
                {gameState.global_timer_status.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={startGlobal} className="bg-green-600 hover:bg-green-500 py-2 rounded font-bold shadow-glow-green flex justify-center items-center gap-2"><Play size={16}/> {gameState.global_timer_status === 'Paused' ? 'Resume' : 'Start'}</button>
              <button onClick={pauseGlobal} className="bg-yellow-600 hover:bg-yellow-500 py-2 rounded font-bold shadow-[0_0_15px_rgba(255,238,0,0.3)] flex justify-center items-center gap-2"><Pause size={16}/> Pause</button>
              <button onClick={stopGlobal} className="bg-red-600 hover:bg-red-500 py-2 rounded font-bold shadow-glow-red flex justify-center items-center gap-2"><Square size={16}/> Stop</button>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold font-body text-neonPurple border-b border-gray-700 pb-2 mb-4">FINAL ROOM TIMER</h2>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Status</span>
              <span className={`px-3 py-1 text-sm font-bold rounded ${gameState.final_timer_status === 'Running' ? 'bg-purple-900 text-neonPurple' : gameState.final_timer_status === 'Paused' ? 'bg-orange-900 text-neonOrange' : 'bg-gray-800'}`}>
                {gameState.final_timer_status.toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button onClick={startFinal} className="bg-purple-600 hover:bg-purple-500 py-2 rounded font-bold shadow-glow-purple flex justify-center items-center gap-2"><Play size={16}/> {gameState.final_timer_status === 'Paused' ? 'Resume' : 'Start'}</button>
              <button onClick={pauseFinal} className="bg-orange-600 hover:bg-orange-500 py-2 rounded font-bold shadow-[0_0_15px_rgba(255,102,0,0.3)] flex justify-center items-center gap-2"><Pause size={16}/> Pause</button>
              <button onClick={resetFinal} className="bg-gray-700 hover:bg-gray-600 py-2 rounded font-bold flex justify-center items-center gap-2"><RotateCcw size={16}/> Reset</button>
            </div>

            <div className="flex items-center gap-3 mb-4 p-3 bg-black/50 border border-gray-800 rounded">
              <input type="number" value={customDuration} onChange={e => setCustomDuration(e.target.value)} className="w-16 bg-transparent border-b border-purple-500 text-center text-white focus:outline-none" />
              <span className="text-gray-400 text-sm">Minutes</span>
              <button onClick={handleSetCustomFinal} className="ml-auto text-xs font-bold bg-purple-900 text-white px-3 py-1 rounded hover:bg-purple-700">SET Custom</button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => adjustFinal(-300)} className="bg-gray-800 hover:bg-gray-700 py-2 rounded font-bold text-sm flex gap-1 justify-center items-center border border-red-900/50 text-red-400"><Minus size={14}/> 5 Min</button>
              <button onClick={() => adjustFinal(300)} className="bg-gray-800 hover:bg-gray-700 py-2 rounded font-bold text-sm flex gap-1 justify-center items-center border border-green-900/50 text-green-400"><Plus size={14}/> 5 Min</button>
              <button onClick={() => adjustFinal(600)} className="bg-gray-800 hover:bg-gray-700 py-2 rounded font-bold text-sm flex gap-1 justify-center items-center border border-green-900/50 text-green-400"><Plus size={14}/> 10 Min</button>
            </div>
          </div>
        </div>

        {/* LEADERBOARD & TEAM MANAGEMENT PANEL */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold font-body text-neonOrange border-b border-gray-700 pb-2 mb-4">LEADERBOARD DISPLAY</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button onClick={() => updateGameState({ leaderboard_locked: !gameState.leaderboard_locked })} className={`py-3 rounded flex justify-center items-center gap-2 font-bold transition-all ${gameState.leaderboard_locked ? 'bg-red-900/80 text-neonRed border border-neonRed shadow-glow-red' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                {gameState.leaderboard_locked ? <><Lock size={18}/> LOCKED</> : <><Unlock size={18}/> UNLOCKED</>}
              </button>
              <button onClick={handleCSVExport} className="py-3 bg-gray-800 hover:bg-gray-700 rounded flex justify-center items-center gap-2 font-bold text-neonBlue">
                <Download size={18}/> CSV Export
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 p-2 bg-black/40 rounded cursor-pointer hover:bg-black/60 transition-colors border border-transparent hover:border-gray-800">
                <input type="checkbox" checked={gameState.display_finalists} onChange={(e) => updateGameState({ display_finalists: e.target.checked })} className="accent-neonOrange w-4 h-4" />
                <span className="text-sm font-bold text-gray-300">Show Finalists Only</span>
              </label>
              <label className="flex items-center gap-3 p-2 bg-black/40 rounded cursor-pointer hover:bg-black/60 transition-colors border border-transparent hover:border-gray-800">
                <input type="checkbox" checked={gameState.display_top_10} onChange={(e) => updateGameState({ display_top_10: e.target.checked })} className="accent-neonOrange w-4 h-4" />
                <span className="text-sm font-bold text-gray-300">Show Top 10 Only</span>
              </label>
              <label className="flex items-center gap-3 p-2 bg-black/40 rounded cursor-pointer hover:bg-black/60 transition-colors border border-transparent hover:border-gray-800">
                <input type="checkbox" checked={gameState.hide_eliminated} onChange={(e) => updateGameState({ hide_eliminated: e.target.checked })} className="accent-neonOrange w-4 h-4" />
                <span className="text-sm font-bold text-gray-300">Hide Eliminated Teams</span>
              </label>
            </div>
          </div>

          <div className="glass-panel p-6 flex flex-col gap-4">
            <h2 className="text-xl font-bold font-body text-neonGreen border-b border-gray-700 pb-2">SYSTEM BACKUP</h2>
            <div className="flex items-center justify-between bg-black p-4 rounded-lg border border-gray-800">
              <div>
                <p className="font-bold text-gray-200">Connection Mode</p>
                <p className="text-xs text-gray-500 mt-1">Local saves to browser. Remote syncs heavily.</p>
              </div>
              <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                <button className={`px-3 py-1 text-xs font-bold rounded ${appMode === 'LOCAL' ? 'bg-neonOrange text-black shadow-glow-orange' : 'text-gray-400'}`} onClick={() => setAppMode('LOCAL')}>LOCAL</button>
                <button className={`px-3 py-1 text-xs font-bold rounded ${appMode === 'REMOTE' ? 'bg-neonBlue text-black shadow-glow-blue' : 'text-gray-400'}`} onClick={() => setAppMode('REMOTE')}>REMOTE</button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleExport} className="bg-gray-800 hover:bg-gray-700 text-sm py-2 rounded font-bold border border-gray-600 flex justify-center items-center gap-2"><Download size={16} /> JSON Export</button>
              <button onClick={() => fileInputRef.current.click()} className="bg-gray-800 hover:bg-gray-700 text-sm py-2 rounded font-bold border border-gray-600 flex justify-center items-center gap-2">
                <Upload size={16} /> JSON Import
                <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TEAM OVERRIDE TABLE */}
      <div className="mt-8 glass-panel p-6">
         <h2 className="text-xl font-bold font-body text-pink-500 border-b border-gray-700 pb-2 mb-4">TEAM TIME & STATUS OVERRIDES</h2>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 uppercase tracking-widest border-b border-gray-800">
                  <th className="pb-3 pl-2">Team</th>
                  <th className="pb-3">Timer State</th>
                  <th className="pb-3">+ / - Time (Bonus/Penalty)</th>
                  <th className="pb-3">Declare Title</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(t => (
                  <tr key={t.team_id} className="border-b border-gray-800">
                    <td className="py-3 pl-2 font-bold text-gray-200">{t.team_name}</td>
                    <td className="py-3">
                      <button 
                        onClick={() => updateTeam(t.team_id, { timer_status: t.timer_status === 'Running' ? 'Frozen' : 'Running' })}
                        className={`text-xs px-3 py-1 rounded font-bold border ${t.timer_status === 'Frozen' ? 'bg-blue-900/50 text-neonBlue border-neonBlue shadow-glow-blue' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
                      >
                        {t.timer_status === 'Frozen' ? 'UNFREEZE' : 'FREEZE'}
                      </button>
                    </td>
                    <td className="py-3 flex items-center gap-2">
                      <button onClick={() => adjustTeamTime(t.team_id, 'bonus', 60000)} className="text-xs bg-green-900/30 border border-green-800 text-neonGreen px-2 py-1 rounded hover:bg-green-900/50">+1 Min</button>
                      <button onClick={() => adjustTeamTime(t.team_id, 'penalty', 60000)} className="text-xs bg-red-900/30 border border-red-800 text-neonRed px-2 py-1 rounded hover:bg-red-900/50">-1 Min</button>
                      <span className="text-gray-500 text-xs ml-2 w-32">B: {t.bonus_time_ms/1000}s | P: {t.penalty_time_ms/1000}s</span>
                    </td>
                    <td className="py-3">
                      <select 
                        value={t.team_status}
                        onChange={(e) => updateTeam(t.team_id, { team_status: e.target.value })}
                        className="bg-black border border-gray-700 text-xs px-2 py-1 rounded text-gray-300 focus:outline-none focus:border-neonPurple"
                      >
                        <option value="Playing">Playing</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Final">Final</option>
                        <option value="Finished">Finished</option>
                        <option value="Eliminated">Eliminated</option>
                        <option value="Winner">⭐️ WINNER</option>
                        <option value="Runner-up">2nd Runner-up</option>
                        <option value="Second Runner-up">3rd Runner-up</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AdminPage;
