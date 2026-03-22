const DEFAULT_STATE = {
  gameState: {
    global_start_time: null,
    global_timer_status: 'Stopped', // Running, Stopped, Paused
    global_elapsed_ms: 0, // Track previously elapsed ms before pause
    final_start_time: null,
    final_timer_status: 'Stopped',
    final_timer_duration: 600, // in seconds
    final_elapsed_ms: 0, // Track previously elapsed ms before pause
    game_status: 'Not Started',
    leaderboard_locked: false,
    display_top_10: false,
    display_finalists: false,
    hide_eliminated: false,
  },
  teams: [],
  answers: [
    { level: 1, correct_answer: 'demogorgon' },
    { level: 2, correct_answer: 'eleven' },
    { level: 3, correct_answer: 'hawkins' },
  ],
};

class LocalGameService {
  constructor() {
    this.storageKey = 'stranger_things_game_state';
    this._initialize();
  }

  _initialize() {
    const data = localStorage.getItem(this.storageKey);
    if (!data) this._save(DEFAULT_STATE);
    else {
      // Migrate old state to new properties just in case
      let s = JSON.parse(data);
      if(s.gameState.global_elapsed_ms === undefined) s.gameState.global_elapsed_ms = 0;
      if(s.gameState.final_elapsed_ms === undefined) s.gameState.final_elapsed_ms = 0;
      if(s.gameState.final_timer_status === undefined) s.gameState.final_timer_status = 'Stopped';
      this._save(s);
    }
  }

  _save(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  getState() {
    return JSON.parse(localStorage.getItem(this.storageKey));
  }

  importState(parsedJsonStr) {
    this._save(JSON.parse(parsedJsonStr));
  }

  exportState() {
    return localStorage.getItem(this.storageKey);
  }

  // --- Game State Modifiers ---
  updateGameState(updates) {
    const state = this.getState();
    state.gameState = { ...state.gameState, ...updates };
    this._save(state);
    return state;
  }

  // GLOBAL TIMER CONTROLS
  startGlobalTimer() {
    const state = this.getState();
    // Re-calculating start time to account for previous elapsed MS (so it resumes correctly)
    const now = new Date().getTime();
    state.gameState.global_start_time = new Date(now - state.gameState.global_elapsed_ms).toISOString();
    state.gameState.global_timer_status = 'Running';
    this._save(state);
  }

  pauseGlobalTimer() {
    const state = this.getState();
    if(state.gameState.global_timer_status === 'Running') {
       const start = new Date(state.gameState.global_start_time).getTime();
       state.gameState.global_elapsed_ms = new Date().getTime() - start;
       state.gameState.global_timer_status = 'Paused';
       this._save(state);
    }
  }

  stopGlobalTimer() {
    const state = this.getState();
    state.gameState.global_timer_status = 'Stopped';
    state.gameState.global_elapsed_ms = 0;
    state.gameState.global_start_time = null;
    this._save(state);
  }

  // FINAL TIMER CONTROLS
  startFinalTimer() {
    const state = this.getState();
    const now = new Date().getTime();
    state.gameState.final_start_time = new Date(now - state.gameState.final_elapsed_ms).toISOString();
    state.gameState.final_timer_status = 'Running';
    // Optionally stop global when final starts
    if(state.gameState.global_timer_status === 'Running') {
      const gs = new Date(state.gameState.global_start_time).getTime();
      state.gameState.global_elapsed_ms = now - gs;
      state.gameState.global_timer_status = 'Stopped';
    }
    this._save(state);
  }

  pauseFinalTimer() {
    const state = this.getState();
    if(state.gameState.final_timer_status === 'Running') {
       const start = new Date(state.gameState.final_start_time).getTime();
       state.gameState.final_elapsed_ms = new Date().getTime() - start;
       state.gameState.final_timer_status = 'Paused';
       this._save(state);
    }
  }

  resetFinalTimer() {
    const state = this.getState();
    state.gameState.final_timer_status = 'Stopped';
    state.gameState.final_elapsed_ms = 0;
    state.gameState.final_start_time = null;
    this._save(state);
  }

  adjustFinalTimer(durationSecs) {
    const state = this.getState();
    state.gameState.final_timer_duration += durationSecs;
    if(state.gameState.final_timer_duration < 0) state.gameState.final_timer_duration = 0;
    this._save(state);
  }

  // --- Teams Modifiers ---
  addTeam(teamName, roomNumber) {
    const state = this.getState();
    const newTeam = {
      team_id: crypto.randomUUID(),
      team_name: teamName,
      room_number: roomNumber,
      current_level: 1,
      level_1_time: null,
      level_2_time: null,
      level_3_time: null,
      team_status: 'Playing',
      timer_status: 'Running', // Running / Frozen
      bonus_time_ms: 0,
      penalty_time_ms: 0,
    };
    state.teams.push(newTeam);
    this._save(state);
    return state;
  }

  updateTeam(teamId, updates) {
    const state = this.getState();
    const idx = state.teams.findIndex(t => t.team_id === teamId);
    if (idx !== -1) {
      state.teams[idx] = { ...state.teams[idx], ...updates };
      this._save(state);
    }
    return state;
  }

  removeTeam(teamId) {
    const state = this.getState();
    state.teams = state.teams.filter(t => t.team_id !== teamId);
    this._save(state);
    return state;
  }
  
  adjustTeamTime(teamId, type, ms) {
    // type is 'bonus' or 'penalty'
    const state = this.getState();
    const team = state.teams.find(t => t.team_id === teamId);
    if(team) {
      if(team.bonus_time_ms === undefined) team.bonus_time_ms = 0;
      if(team.penalty_time_ms === undefined) team.penalty_time_ms = 0;

      if(type === 'bonus') team.bonus_time_ms += ms;
      if(type === 'penalty') team.penalty_time_ms += ms;
      this._save(state);
    }
  }

  _formatMs(diff) {
    const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  _getCurrentGlobalElapsedStr(state) {
    if(state.gameState.global_timer_status === 'Stopped') return '00:00:00';
    if(state.gameState.global_timer_status === 'Paused') {
        const diff = state.gameState.global_elapsed_ms || 0;
        return this._formatMs(diff);
    }
    // Running
    if(!state.gameState.global_start_time) return '00:00:00';
    const start = new Date(state.gameState.global_start_time).getTime();
    const now = new Date().getTime();
    return this._formatMs(Math.max(0, now - start));
  }

  // Mod checks answers
  checkAnswer(teamId, level, answer) {
    const state = this.getState();
    const team = state.teams.find(t => t.team_id === teamId);
    if(team && team.timer_status === 'Frozen') return { success: false, state, msg: 'Team is FROZEN' };
    
    const answerObj = state.answers.find(a => a.level === level);

    if (team && answerObj) {
      if (answerObj.correct_answer.toLowerCase() === answer.toLowerCase()) {
        const timeKey = `level_${level}_time`;
        const snapshotKey = `level_${level}_timer_snapshot`;
        team[timeKey] = new Date().toISOString();
        team[snapshotKey] = this._getCurrentGlobalElapsedStr(state);
        
        if (level < 3) {
          team.current_level = level + 1;
        } else {
          team.team_status = 'Finished';
        }
        this._save(state);
        return { success: true, state };
      }
    }
    return { success: false, state };
  }

  passLevel(teamId, level) {
    const state = this.getState();
    const team = state.teams.find(t => t.team_id === teamId);
    if(team && team.timer_status === 'Frozen') return { success: false, state, msg: 'Team is FROZEN' };

    if (team) {
      const timeKey = `level_${level}_time`;
      const snapshotKey = `level_${level}_timer_snapshot`;
      team[timeKey] = new Date().toISOString();
      team[snapshotKey] = this._getCurrentGlobalElapsedStr(state);
      
      if (level < 3) {
        team.current_level = level + 1;
      } else {
        team.team_status = 'Finished';
      }
      this._save(state);
      return { success: true, state };
    }
    return { success: false, state };
  }
}

export const localService = new LocalGameService();
export { DEFAULT_STATE };
