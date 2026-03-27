import React from 'react';
import { CheckCircle2, Circle, Trophy } from 'lucide-react';

const LevelProgress = ({ currentLevel, teamStatus, levelTimes = [] }) => {
  const levels = [1, 2, 3];
  const isFinished = teamStatus === 'Finished' || teamStatus === 'Winner' || teamStatus === 'Runner-up' || teamStatus === 'Second Runner-up';

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between px-1">
        {levels.map((lvl) => {
          const isCompleted = isFinished || currentLevel > lvl;
          const isActive = !isFinished && currentLevel === lvl;
          const time = levelTimes[lvl - 1];

          return (
            <div key={lvl} className="flex flex-col items-center gap-1 flex-1 relative">
              {/* Connector Line */}
              {lvl < 3 && (
                <div className={`absolute top-4 left-1/2 w-full h-[2px] z-0 ${isCompleted && (isFinished || currentLevel > lvl + 1 || (currentLevel === lvl + 1 && isCompleted)) ? 'bg-neonGreen/50' : 'bg-gray-800'}`} />
              )}
              
              {/* Icon/Dot */}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                isCompleted 
                  ? 'bg-green-900/40 border-neonGreen text-neonGreen shadow-[0_0_10px_rgba(0,255,102,0.4)]' 
                  : isActive 
                    ? 'bg-blue-900/40 border-neonBlue text-neonBlue shadow-[0_0_10px_rgba(0,243,255,0.4)] animate-pulse' 
                    : 'bg-gray-900 border-gray-700 text-gray-600'
              }`}>
                {isCompleted ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{lvl}</span>}
              </div>

              {/* Time Label */}
              <div className={`text-[10px] font-digital h-4 ${isCompleted ? 'text-neonGreen opacity-80' : 'text-gray-600'}`}>
                {time || (isActive ? 'RUNNING' : '--:--')}
              </div>
              
              {/* Level Label */}
              <div className={`text-[8px] uppercase tracking-tighter ${isActive ? 'text-neonBlue font-bold' : 'text-gray-500'}`}>
                Level {lvl}
              </div>
            </div>
          );
        })}

        {/* Finish Flag */}
        <div className="flex flex-col items-center gap-1 ml-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                isFinished 
                ? 'bg-neonPurple/40 border-neonPurple text-neonPurple shadow-[0_0_10px_rgba(184,0,255,0.4)]' 
                : 'bg-gray-900 border-gray-700 text-gray-600'
            }`}>
                <Trophy size={16} />
            </div>
            <div className="text-[10px] h-4"></div>
            <div className={`text-[8px] uppercase tracking-tighter ${isFinished ? 'text-neonPurple font-bold' : 'text-gray-500'}`}>
                FINISH
            </div>
        </div>
      </div>
    </div>
  );
};

export default LevelProgress;
