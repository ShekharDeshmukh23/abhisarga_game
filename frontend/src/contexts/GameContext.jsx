import React, { createContext, useContext, useState, useEffect } from 'react';
import { localService } from '../services/LocalGameService';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [appMode, setAppMode] = useState('LOCAL'); 
  const [data, setData] = useState(localService.getState());

  const refreshState = () => {
    if (appMode === 'LOCAL') {
      setData(localService.getState());
    }
  };

  const updateGameState = (updates) => {
    if (appMode === 'LOCAL') {
      localService.updateGameState(updates);
      refreshState();
    }
  };

  // Timer Abstractions
  const startGlobal = () => { if(appMode === 'LOCAL') { localService.startGlobalTimer(); refreshState(); } }
  const pauseGlobal = () => { if(appMode === 'LOCAL') { localService.pauseGlobalTimer(); refreshState(); } }
  const stopGlobal = () => { if(appMode === 'LOCAL') { localService.stopGlobalTimer(); refreshState(); } }

  const startFinal = () => { if(appMode === 'LOCAL') { localService.startFinalTimer(); refreshState(); } }
  const pauseFinal = () => { if(appMode === 'LOCAL') { localService.pauseFinalTimer(); refreshState(); } }
  const resetFinal = () => { if(appMode === 'LOCAL') { localService.resetFinalTimer(); refreshState(); } }
  const adjustFinal = (s) => { if(appMode === 'LOCAL') { localService.adjustFinalTimer(s); refreshState(); } }

  const addTeam = (name, room) => {
    if (appMode === 'LOCAL') {
      localService.addTeam(name, room);
      refreshState();
    }
  };

  const updateTeam = (id, updates) => {
    if (appMode === 'LOCAL') {
      localService.updateTeam(id, updates);
      refreshState();
    }
  };

  const removeTeam = (id) => {
    if (appMode === 'LOCAL') {
      localService.removeTeam(id);
      refreshState();
    }
  };
  
  const adjustTeamTime = (id, type, ms) => {
      if(appMode === 'LOCAL') {
          localService.adjustTeamTime(id, type, ms);
          refreshState();
      }
  }

  const checkAnswer = (id, level, answer) => {
    if (appMode === 'LOCAL') {
      const result = localService.checkAnswer(id, level, answer);
      refreshState();
      return result;
    }
  };

  const passLevel = (id, level) => {
    if (appMode === 'LOCAL') {
      const result = localService.passLevel(id, level);
      refreshState();
      return result;
    }
  };

  const importState = (jsonStr) => {
    localService.importState(jsonStr);
    refreshState();
  };

  const exportState = () => {
    return localService.exportState();
  };

  useEffect(() => {
    if (appMode === 'LOCAL') {
      const interval = setInterval(() => {
        setData(localService.getState());
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [appMode]);

  return (
    <GameContext.Provider value={{
      appMode, setAppMode,
      gameState: data.gameState,
      teams: data.teams,
      answers: data.answers,
      updateGameState,
      startGlobal, pauseGlobal, stopGlobal,
      startFinal, pauseFinal, resetFinal, adjustFinal,
      addTeam, updateTeam, removeTeam, adjustTeamTime,
      checkAnswer, passLevel,
      importState, exportState
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameData = () => useContext(GameContext);
