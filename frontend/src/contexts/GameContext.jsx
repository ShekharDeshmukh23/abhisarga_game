import React, { createContext, useContext, useState, useEffect } from 'react';
import { localService } from '../services/LocalGameService';
import { supabaseService } from '../services/SupabaseGameService';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [appMode, setAppMode] = useState('SUPABASE'); 
  const [data, setData] = useState(appMode === 'LOCAL' ? localService.getState() : supabaseService.getState());

  useEffect(() => {
    if (appMode === 'SUPABASE') {
      supabaseService.initialize();
      const unsubscribe = supabaseService.subscribe((newState) => {
        setData(newState);
      });
      return () => unsubscribe();
    }
  }, [appMode]);

  const refreshState = () => {
    if (appMode === 'LOCAL') {
      setData(localService.getState());
    }
  };

  const updateGameState = (updates) => {
    if (appMode === 'LOCAL') {
      localService.updateGameState(updates);
      refreshState();
    } else if (appMode === 'SUPABASE') {
      supabaseService.updateGameState(updates);
    }
  };

  // Timer Abstractions
  const startGlobal = () => { 
    if(appMode === 'LOCAL') { localService.startGlobalTimer(); refreshState(); }
    else if(appMode === 'SUPABASE') { supabaseService.startGlobalTimer(); }
  };
  const pauseGlobal = () => { 
    if(appMode === 'LOCAL') { localService.pauseGlobalTimer(); refreshState(); }
    else if(appMode === 'SUPABASE') { supabaseService.pauseGlobalTimer(); }
  };
  const stopGlobal = () => { 
    if(appMode === 'LOCAL') { localService.stopGlobalTimer(); refreshState(); }
    else if(appMode === 'SUPABASE') { supabaseService.stopGlobalTimer(); }
  };

  const startFinal = () => { 
    if(appMode === 'LOCAL') { localService.startFinalTimer(); refreshState(); }
    else if(appMode === 'SUPABASE') { supabaseService.startFinalTimer(); }
  };
  const pauseFinal = () => { 
    if(appMode === 'LOCAL') { localService.pauseFinalTimer(); refreshState(); }
    else if(appMode === 'SUPABASE') { supabaseService.pauseFinalTimer(); }
  };
  const resetFinal = () => { 
    if(appMode === 'LOCAL') { localService.resetFinalTimer(); refreshState(); }
    else if(appMode === 'SUPABASE') { supabaseService.resetFinalTimer(); }
  };
  const adjustFinal = (s) => { 
    if(appMode === 'LOCAL') { localService.adjustFinalTimer(s); refreshState(); }
    else if(appMode === 'SUPABASE') { supabaseService.adjustFinalTimer(s); }
  };

  const addTeam = (name, room) => {
    if (appMode === 'LOCAL') {
      localService.addTeam(name, room);
      refreshState();
    } else if (appMode === 'SUPABASE') {
      supabaseService.addTeam(name, room);
    }
  };

  const updateTeam = (id, updates) => {
    if (appMode === 'LOCAL') {
      localService.updateTeam(id, updates);
      refreshState();
    } else if (appMode === 'SUPABASE') {
      supabaseService.updateTeam(id, updates);
    }
  };

  const removeTeam = (id) => {
    if (appMode === 'LOCAL') {
      localService.removeTeam(id);
      refreshState();
    } else if (appMode === 'SUPABASE') {
      supabaseService.removeTeam(id);
    }
  };
  
  const adjustTeamTime = (id, type, ms) => {
      if(appMode === 'LOCAL') {
          localService.adjustTeamTime(id, type, ms);
          refreshState();
      } else if (appMode === 'SUPABASE') {
          supabaseService.adjustTeamTime(id, type, ms);
      }
  }

  const checkAnswer = async (id, level, answer) => {
    if (appMode === 'LOCAL') {
      const result = localService.checkAnswer(id, level, answer);
      refreshState();
      return result;
    } else if (appMode === 'SUPABASE') {
      return await supabaseService.checkAnswer(id, level, answer);
    }
  };

  const passLevel = async (id, level) => {
    if (appMode === 'LOCAL') {
      const result = localService.passLevel(id, level);
      refreshState();
      return result;
    } else if (appMode === 'SUPABASE') {
      return await supabaseService.passLevel(id, level);
    }
  };

  const importState = (jsonStr) => {
    if (appMode === 'LOCAL') {
      localService.importState(jsonStr);
      refreshState();
    }
  };

  const exportState = () => {
    if (appMode === 'LOCAL') {
      return localService.exportState();
    }
    return JSON.stringify(data);
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
