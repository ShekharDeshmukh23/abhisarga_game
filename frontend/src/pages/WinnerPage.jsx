import React, { useState, useEffect } from 'react';
import { useGameData } from '../contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

const WinnerPage = () => {
  const { teams } = useGameData();
  const [phase, setPhase] = useState(0); 
  // 0: Initial black
  // 1: "THE UPSIDE DOWN HAS CHOSEN"
  // 2: Reveal 3rd
  // 3: Reveal 2nd
  // 4: Reveal Winner

  const winners = teams.filter(t => ['Winner', 'Runner-up', 'Second Runner-up'].includes(t.team_status));
  const winner = winners.find(t => t.team_status === 'Winner');
  const runnerUp = winners.find(t => t.team_status === 'Runner-up');
  const third = winners.find(t => t.team_status === 'Second Runner-up');

  useEffect(() => {
    // Cinematic Timeline
    const t1 = setTimeout(() => setPhase(1), 2000); // Text
    const t2 = setTimeout(() => setPhase(2), 6000); // 3rd
    const t3 = setTimeout(() => setPhase(3), 9000); // 2nd
    const t4 = setTimeout(() => setPhase(4), 13000); // Winner
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-50 flex items-center justify-center font-body">
      {/* Horror Atmos */}
      <div className="moving-fog opacity-30"></div>
      <div className="particles opacity-60"></div>
      <div className="cinematic-vignette opacity-90"></div>
      <div className="glitch-flash"></div>

      {/* Background Creatures Reveal with Winner */}
      {phase >= 4 && (
         <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 2}}>
            <img src="https://www.pngmart.com/files/22/Stranger-Things-Demogorgon-PNG-HD.png" alt="" className="bg-creeper-demogorgon scale-110 right-[-10%]" />
            <img src="https://www.pngmart.com/files/22/Stranger-Things-Vecna-PNG-Transparent.png" alt="" className="fixed bottom-0 left-[-10%] h-[70vh] opacity-20 mix-blend-screen animate-pulse-glow" />
         </motion.div>
      )}

      {/* Red Portal behind winner */}
      {phase >= 4 && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }} 
          animate={{ scale: 1, opacity: 0.4 }} 
          transition={{ duration: 3, ease: 'easeOut' }}
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-red-600 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
        </motion.div>
      )}

      <div className="relative z-20 flex flex-col items-center w-full max-w-7xl px-4">
        
        {/* Intro Text */}
        <AnimatePresence>
          {phase === 1 && (
            <motion.h1 
              initial={{ scale: 0.5, opacity: 0, filter: 'blur(20px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 3 }}
              className="text-center text-4xl md:text-7xl font-cinematic text-neonRed text-glow-red tracking-[0.2em] transform uppercase absolute top-1/2 -translate-y-1/2"
              style={{fontFamily: "'Creepster', cursive"}}
            >
              THE UPSIDE DOWN HAS CHOSEN
            </motion.h1>
          )}
        </AnimatePresence>

        {/* The Reveals */}
        <div className="w-full flex flex-col md:flex-row justify-center items-end gap-6 md:gap-12 mt-20 h-auto md:h-[60vh]">
          
          {/* 3rd Place */}
          {third && phase >= 2 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.5, type: 'spring' }}
              className="flex flex-col items-center z-10 w-full md:w-1/3 order-3 md:order-1"
            >
              <h3 className="text-neonYellow font-bold text-xl tracking-widest mb-4">SECOND RUNNER-UP</h3>
              <div className="glass-panel w-full p-8 border-yellow-600/50 shadow-[0_0_20px_rgba(255,238,0,0.2)] flex flex-col items-center backdrop-blur-3xl bg-black/60">
                <span className="text-5xl font-cinematic text-white">{third.team_name}</span>
                <span className="text-2xl font-digital text-gray-400 mt-2">LVL {third.current_level}</span>
              </div>
            </motion.div>
          )}

          {/* Winner (Center) */}
          {winner && phase >= 4 && (
            <motion.div
              initial={{ y: -50, scale: 0.8, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 2, type: 'spring', bounce: 0.5 }}
              className="flex flex-col items-center z-30 w-full md:w-1/3 order-1 md:order-2 mb-8 md:mb-16"
            >
              <h3 className="text-neonRed font-bold text-3xl tracking-[0.3em] mb-4 text-glow-red animate-pulse">CHAMPIONS</h3>
              <div className="glass-panel w-full p-12 border-neonRed shadow-glow-red flex flex-col items-center backdrop-blur-3xl bg-red-950/40 relative transform scale-110">
                <div className="absolute -inset-4 bg-red-600/20 blur-xl rounded-xl z-0 animate-pulse-glow"></div>
                <span className="text-6xl md:text-7xl font-cinematic text-white text-center z-10">{winner.team_name}</span>
                <span className="text-3xl font-digital text-neonRed mt-4 tracking-widest z-10">LVL {winner.current_level}</span>
              </div>
            </motion.div>
          )}

          {/* 2nd Place */}
          {runnerUp && phase >= 3 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.5, type: 'spring' }}
              className="flex flex-col items-center z-20 w-full md:w-1/3 order-2 md:order-3 md:mb-8"
            >
              <h3 className="text-neonBlue font-bold text-2xl tracking-widest mb-4 shadow-glow-blue">RUNNER-UP</h3>
              <div className="glass-panel w-full p-10 border-blue-600/50 shadow-[0_0_30px_rgba(0,243,255,0.3)] flex flex-col items-center backdrop-blur-3xl bg-black/60">
                <span className="text-5xl md:text-6xl font-cinematic text-white text-center">{runnerUp.team_name}</span>
                <span className="text-2xl font-digital text-neonBlue mt-2 tracking-widest">LVL {runnerUp.current_level}</span>
              </div>
            </motion.div>
          )}

        </div>

      </div>
    </div>
  );
};

export default WinnerPage;
