import React, { useEffect, useState, useMemo } from 'react';
import { useGameData } from '../contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import LevelProgress from '../components/LevelProgress';

const LeaderboardPage = () => {
  const { teams, gameState } = useGameData();
  const [elapsed, setElapsed] = useState('00:00:00');
  const [frozenLeaderboard, setFrozenLeaderboard] = useState(null);

  // Timer logic
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

  // Ranking Logic
  const calculateSortedTeams = () => {
    let filtered = [...teams];

    // Admin Display Filters
    if (gameState.hide_eliminated) {
      filtered = filtered.filter(t => t.team_status !== 'Eliminated');
    }
    if (gameState.display_finalists) {
      filtered = filtered.filter(t => t.team_status === 'Final' || t.team_status === 'Finished' || t.team_status === 'Winner' || t.team_status === 'Runner-up' || t.team_status === 'Second Runner-up');
    }

    filtered.sort((a, b) => {
      // Hard overrides for Winners
      const winRank = { 'Winner': 3, 'Runner-up': 2, 'Second Runner-up': 1 };
      const aWin = winRank[a.team_status] || 0;
      const bWin = winRank[b.team_status] || 0;
      if(aWin !== bWin) return bWin - aWin;

      // 1. Sort by Highest Level Reached
      if (a.current_level !== b.current_level) {
        return b.current_level - a.current_level;
      }
      
      // 2. If same level, sort by completion time of the previous level (adjusted by penalty/bonus)
      const getAdjustedCompletionTime = (t) => {
        const level = t.current_level - 1;
        if (level === 0) return Infinity; 
        const timeKey = `level_${level}_time`;
        const baseTime = t[timeKey] ? new Date(t[timeKey]).getTime() : Infinity;
        if(baseTime === Infinity) return Infinity;
        
        // Bonus time subtracts from completion time (makes them faster), Penalty adds to it.
        return baseTime - (t.bonus_time_ms || 0) + (t.penalty_time_ms || 0);
      };

      const timeA = getAdjustedCompletionTime(a);
      const timeB = getAdjustedCompletionTime(b);

      return timeA - timeB;
    });

    if (gameState.display_top_10) {
      filtered = filtered.slice(0, 10);
    }
    return filtered;
  };

  const currentLeaderboard = useMemo(() => calculateSortedTeams(), [teams, gameState]);

  // Handle Leaderboard Lock
  useEffect(() => {
    if (gameState.leaderboard_locked && !frozenLeaderboard) {
      setFrozenLeaderboard(currentLeaderboard); // Freeze it at current state
    } else if (!gameState.leaderboard_locked && frozenLeaderboard) {
      setFrozenLeaderboard(null); // Unfreeze
    }
  }, [gameState.leaderboard_locked, currentLeaderboard]);

  const displayedTeams = frozenLeaderboard || currentLeaderboard;

  const getRowStyle = (rank, status) => {
    if (status === 'Winner') return 'text-neonGreen shadow-[inset_0_0_40px_rgba(0,255,102,0.4)] border-neonGreen scale-[1.03] z-20 bg-green-900/40';
    if (status === 'Runner-up') return 'text-neonBlue shadow-[inset_0_0_30px_rgba(0,243,255,0.3)] border-neonBlue scale-[1.02] z-10 bg-blue-900/30';
    
    if (status === 'Eliminated') return 'text-gray-600 bg-gray-950/80 border-gray-900';
    if (status === 'Finished') return 'text-neonGreen shadow-[inset_0_0_20px_rgba(0,255,102,0.1)] border-neonGreen/50';
    if (status === 'Final' || status === 'Shortlisted') return 'text-neonPurple shadow-[inset_0_0_20px_rgba(184,0,255,0.2)] border-neonPurple/50';

    if (rank === 1) return 'text-neonRed shadow-[inset_0_0_30px_rgba(255,0,60,0.3)] border-red-500 scale-[1.01] z-10 bg-red-950/40';
    if (rank === 2) return 'text-neonOrange shadow-[inset_0_0_20px_rgba(255,102,0,0.2)] border-orange-500 z-10 bg-orange-950/30';
    if (rank === 3) return 'text-neonYellow shadow-[inset_0_0_15px_rgba(255,238,0,0.15)] border-yellow-500 z-10';

    return 'text-gray-200 border-gray-700/40 hover:bg-gray-800/60';
  };

  const getBadgeStyle = (status) => {
    switch(status) {
      case 'Playing': return 'bg-blue-900/60 text-neonBlue border border-neonBlue shadow-glow-blue';
      case 'Shortlisted': return 'bg-purple-900/60 text-neonPurple border border-neonPurple shadow-glow-purple';
      case 'Final': return 'bg-pink-900/60 text-pink-400 border border-pink-500';
      case 'Eliminated': return 'bg-gray-900/80 text-gray-500 border border-gray-800';
      case 'Finished': return 'bg-green-900/60 text-neonGreen border border-neonGreen shadow-[0_0_10px_#00ff66]';
      case 'Winner': return 'bg-green-600 text-black border border-neonGreen shadow-glow-green animate-pulse';
      case 'Runner-up': return 'bg-cyan-600 text-black border border-neonBlue shadow-glow-blue';
      case 'Second Runner-up': return 'bg-yellow-600 text-black border border-neonYellow shadow-glow-yellow';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  const formatLevelTimes = (t) => {
    const times = [
      t.level_1_timer_snapshot,
      t.level_2_timer_snapshot,
      t.level_3_timer_snapshot
    ].filter(Boolean);
    
    if (times.length === 0) return '---';
    return (
      <div className="flex flex-col items-center">
        {times.map((time, i) => (
          <div key={i} className="text-[10px] md:text-xs">
            L{i+1}: {time}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-body flex flex-col items-center py-10 px-4">
      {/* Horror Atmos */}
      <div className="dark-red-atmosphere"></div>
      <div className="red-lightning"></div>
      <div className="red-lightning-2"></div>
      <div className="moving-red-smoke"></div>
      <div className="moving-red-smoke-slow"></div>
      <div className="cinematic-vignette"></div>
      <div className="glitch-flash"></div>
      <div className="particles"></div>
      
      {/* Background Monsters (Subtle) */}
      <img src="https://www.pngmart.com/files/22/Stranger-Things-Demogorgon-PNG-HD.png" alt="" className="bg-creeper-demogorgon" />
      <img src="https://www.pngmart.com/files/22/Stranger-Things-Vecna-PNG-Isolated-Pic.png" alt="" className="bg-creeper-vecna" />
      
      {/* Content */}
      <div className="w-full max-w-6xl relative z-40 flex flex-col items-center pt-8">
        
        {/* Title */}
        <div className="text-center mb-6 relative">
          <h1 className="text-7xl md:text-9xl font-cinematic text-[#ff003c] tracking-widest relative z-10 animate-bright-flicker" style={{fontFamily: "'Creepster', cursive"}}>
            LEADERBOARD
          </h1>
          <h1 className="text-7xl md:text-9xl font-cinematic text-[#ff003c] tracking-widest absolute top-full left-0 w-full opacity-30 mirror-blur transform translate-y-[-15%] z-0" style={{fontFamily: "'Creepster', cursive"}}>
            LEADERBOARD
          </h1>
        </div>

        {/* Global Timer */}
        <div className="mb-14 flex flex-col items-center">
          <div className={`font-digital text-5xl md:text-7xl bg-black/80 px-8 py-4 rounded-xl border-2 shadow-[0_0_30px_rgba(255,0,60,0.5)] tracking-widest
            ${gameState.global_timer_status === 'Paused' ? 'text-neonYellow border-neonYellow animate-flicker shadow-[0_0_30px_rgba(255,238,0,0.3)]' : 'text-neonRed border-neonRed animate-pulse-glow'}`}>
            {elapsed}
          </div>
          {gameState.leaderboard_locked && (
             <div className="mt-4 text-neonYellow font-bold uppercase tracking-[0.4em] animate-pulse bg-yellow-900/50 px-4 py-1 rounded">
               RANKS LOCKED BY ADMIN
             </div>
          )}
        </div>

        {/* Table Card */}
        <div className="w-full bg-glassDark/90 border border-red-900/60 shadow-[0_0_40px_rgba(255,0,60,0.2)] rounded-xl p-4 md:p-8 backdrop-blur-2xl">
          
          <div className="grid grid-cols-12 gap-2 md:gap-4 border-b border-red-900/50 pb-3 mb-4 text-gray-400 font-bold uppercase tracking-wider text-[10px] md:text-sm px-2">
            <div className="col-span-1 text-center">RANK</div>
            <div className="col-span-3 pl-2">TEAM</div>
            <div className="col-span-3 text-center">PROGRESS</div>
            <div className="col-span-3 text-center">LEVEL TIMES</div>
            <div className="col-span-2 text-center">STATUS</div>
          </div>

          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {displayedTeams.map((team, index) => {
                const rank = index + 1;
                return (
                  <motion.div 
                    key={team.team_id}
                    layout 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
                    className={`grid grid-cols-12 gap-2 md:gap-4 items-center p-3 rounded-lg border bg-black/60 transition-all duration-500 overflow-hidden relative ${getRowStyle(rank, team.team_status)}`}
                  >
                    {team.timer_status === 'Frozen' && (
                       <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[2px] z-30 flex items-center justify-center">
                          <span className="text-neonBlue font-digital tracking-widest text-xl opacity-80 backdrop-blur pointer-events-none drop-shadow-[0_0_5px_#00f3ff]">FROZEN</span>
                       </div>
                    )}

                    <div className="col-span-1 text-center font-digital text-2xl md:text-3xl font-bold">
                      {rank}
                    </div>
                    <div className="col-span-3 font-bold text-base md:text-xl truncate pl-2">
                      {team.team_name}
                    </div>
                    <div className="col-span-3 text-center flex justify-center">
                      <div className="w-full max-w-[150px] scale-75 md:scale-95 origin-center">
                        <LevelProgress 
                          currentLevel={team.current_level} 
                          teamStatus={team.team_status}
                          levelTimes={[
                              team.level_1_timer_snapshot,
                              team.level_2_timer_snapshot,
                              team.level_3_timer_snapshot
                          ]}
                        />
                      </div>
                    </div>
                    <div className="col-span-3 text-center font-digital text-gray-300 tracking-widest leading-tight">
                      {formatLevelTimes(team)}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <span className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold rounded-full uppercase tracking-widest ${getBadgeStyle(team.team_status)}`}>
                        {team.team_status}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {displayedTeams.length === 0 && (
              <div className="text-center py-16 text-gray-500 font-cinematic text-3xl tracking-widest opacity-50">
                NO TEAMS FOUND IN THE UPSIDE DOWN
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default LeaderboardPage;
