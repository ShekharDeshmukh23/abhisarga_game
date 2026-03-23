import { supabase } from './supabaseClient';

const DEFAULT_STATE = {
  gameState: {
    global_start_time: null,
    global_timer_status: 'Stopped',
    global_elapsed_ms: 0,
    final_start_time: null,
    final_timer_status: 'Stopped',
    final_timer_duration: 600,
    final_elapsed_ms: 0,
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
  ]
};

class SupabaseGameService {
  constructor() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.listeners = [];
    this.isInitialized = false;
  }

  // --- Realtime & Async Fetching ---

  async initialize() {
    if (this.isInitialized) return;
    try {
      // Fetch initial state
      const [gsRes, teamsRes, answersRes] = await Promise.all([
        supabase.from('game_state').select('*').single(),
        supabase.from('teams').select('*').order('created_at'),
        supabase.from('answers').select('*')
      ]);

      if (gsRes.data) this.state.gameState = { ...this.state.gameState, ...gsRes.data };
      if (teamsRes.data) this.state.teams = teamsRes.data;
      if (answersRes.data && answersRes.data.length > 0) this.state.answers = answersRes.data;

      this.isInitialized = true;
      this._notify();

      // Subscribe to Realtime
      this.subscription = supabase.channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'game_state' },
          (payload) => {
            this.state.gameState = { ...this.state.gameState, ...payload.new };
            this._notify();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'teams' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              this.state.teams.push(payload.new);
            } else if (payload.eventType === 'UPDATE') {
              const idx = this.state.teams.findIndex(t => t.team_id === payload.new.team_id);
              if (idx !== -1) this.state.teams[idx] = { ...this.state.teams[idx], ...payload.new };
            } else if (payload.eventType === 'DELETE') {
              this.state.teams = this.state.teams.filter(t => t.team_id !== payload.old.team_id);
            }
            this._notify();
          }
        )
        .subscribe();

    } catch (err) {
      console.error('Error initializing Supabase state:', err);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  _notify() {
    // Pass a fresh copy to trigger React re-renders or allow direct ref
    this.listeners.forEach(cb => cb({ ...this.state }));
  }

  getState() {
    return this.state;
  }

  // --- Modifiers (Optimistic + Async DB Update) ---

  async updateGameState(updates) {
    this.state.gameState = { ...this.state.gameState, ...updates };
    this._notify();
    await supabase.from('game_state').update(updates).eq('id', 1);
  }

  // GLOBAL TIMER CONTROLS
  startGlobalTimer() {
    const now = new Date().getTime();
    const start_time = new Date(now - this.state.gameState.global_elapsed_ms).toISOString();
    this.updateGameState({
      global_start_time: start_time,
      global_timer_status: 'Running'
    });
  }

  pauseGlobalTimer() {
    if (this.state.gameState.global_timer_status === 'Running') {
      const start = new Date(this.state.gameState.global_start_time).getTime();
      const elapsed = new Date().getTime() - start;
      this.updateGameState({
        global_elapsed_ms: elapsed,
        global_timer_status: 'Paused'
      });
    }
  }

  stopGlobalTimer() {
    this.updateGameState({
      global_timer_status: 'Stopped',
      global_elapsed_ms: 0,
      global_start_time: null
    });
  }

  // FINAL TIMER CONTROLS
  startFinalTimer() {
    const now = new Date().getTime();
    const start_time = new Date(now - this.state.gameState.final_elapsed_ms).toISOString();
    const updates = {
      final_start_time: start_time,
      final_timer_status: 'Running'
    };

    if (this.state.gameState.global_timer_status === 'Running') {
      const gs = new Date(this.state.gameState.global_start_time).getTime();
      updates.global_elapsed_ms = now - gs;
      updates.global_timer_status = 'Stopped';
    }
    
    this.updateGameState(updates);
  }

  pauseFinalTimer() {
    if (this.state.gameState.final_timer_status === 'Running') {
      const start = new Date(this.state.gameState.final_start_time).getTime();
      const elapsed = new Date().getTime() - start;
      this.updateGameState({
        final_elapsed_ms: elapsed,
        final_timer_status: 'Paused'
      });
    }
  }

  resetFinalTimer() {
    this.updateGameState({
      final_timer_status: 'Stopped',
      final_elapsed_ms: 0,
      final_start_time: null
    });
  }

  adjustFinalTimer(durationSecs) {
    let newDuration = this.state.gameState.final_timer_duration + durationSecs;
    if (newDuration < 0) newDuration = 0;
    this.updateGameState({ final_timer_duration: newDuration });
  }

  // --- Teams Modifiers ---
  async addTeam(teamName, roomNumber) {
    const newTeam = {
      team_name: teamName,
      room_number: roomNumber,
      current_level: 1,
      team_status: 'Playing',
      timer_status: 'Running',
      bonus_time_ms: 0,
      penalty_time_ms: 0,
    };
    // Let database generate UUID and defaults, then Realtime will broadcast the INSERT.
    // Or we can optimistic update:
    const { data } = await supabase.from('teams').insert(newTeam).select().single();
    if(data) {
      // We don't necessarily need to push it strictly here if Realtime picks it up, 
      // but doing it avoids race conditions if Realtime is slow.
      const exists = this.state.teams.find(t => t.team_id === data.team_id);
      if(!exists) {
        this.state.teams.push(data);
        this._notify();
      }
    }
  }

  async updateTeam(teamId, updates) {
    const idx = this.state.teams.findIndex(t => t.team_id === teamId);
    if (idx !== -1) {
      this.state.teams[idx] = { ...this.state.teams[idx], ...updates };
      this._notify();
      await supabase.from('teams').update(updates).eq('team_id', teamId);
    }
  }

  async removeTeam(teamId) {
    this.state.teams = this.state.teams.filter(t => t.team_id !== teamId);
    this._notify();
    await supabase.from('teams').delete().eq('team_id', teamId);
  }

  adjustTeamTime(teamId, type, ms) {
    const team = this.state.teams.find(t => t.team_id === teamId);
    if (team) {
      let b = team.bonus_time_ms || 0;
      let p = team.penalty_time_ms || 0;
      if (type === 'bonus') b += ms;
      if (type === 'penalty') p += ms;
      this.updateTeam(teamId, { bonus_time_ms: b, penalty_time_ms: p });
    }
  }

  _formatMs(diff) {
    const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  _getCurrentGlobalElapsedStr() {
    if (this.state.gameState.global_timer_status === 'Stopped') return '00:00:00';
    if (this.state.gameState.global_timer_status === 'Paused') {
      const diff = this.state.gameState.global_elapsed_ms || 0;
      return this._formatMs(diff);
    }
    if (!this.state.gameState.global_start_time) return '00:00:00';
    const start = new Date(this.state.gameState.global_start_time).getTime();
    const now = new Date().getTime();
    return this._formatMs(Math.max(0, now - start));
  }

  // Modifiers returning a result and doing an async update
  async passLevel(teamId, level) {
    const team = this.state.teams.find(t => t.team_id === teamId);
    if (team && team.timer_status === 'Frozen') return { success: false, state: this.state, msg: 'Team is FROZEN' };

    if (team) {
      const timeKey = `level_${level}_time`;
      const snapshotKey = `level_${level}_timer_snapshot`;
      
      const updates = {};
      updates[timeKey] = new Date().toISOString();
      updates[snapshotKey] = this._getCurrentGlobalElapsedStr();
      
      if (level < 3) {
        updates.current_level = level + 1;
      } else {
        updates.team_status = 'Finished';
      }
      
      // Update local optimistically
      await this.updateTeam(teamId, updates);
      return { success: true, state: this.state };
    }
    return { success: false, state: this.state };
  }

  async checkAnswer(teamId, level, answer) {
    const team = this.state.teams.find(t => t.team_id === teamId);
    if (team && team.timer_status === 'Frozen') return { success: false, state: this.state, msg: 'Team is FROZEN' };
    
    const answerObj = this.state.answers.find(a => a.level === level);

    if (team && answerObj) {
      if (answerObj.correct_answer.toLowerCase() === answer.toLowerCase()) {
        const timeKey = `level_${level}_time`;
        const snapshotKey = `level_${level}_timer_snapshot`;
        
        const updates = {};
        updates[timeKey] = new Date().toISOString();
        updates[snapshotKey] = this._getCurrentGlobalElapsedStr();
        
        if (level < 3) {
          updates.current_level = level + 1;
        } else {
          updates.team_status = 'Finished';
        }
        
        await this.updateTeam(teamId, updates);
        return { success: true, state: this.state };
      }
    }
    return { success: false, state: this.state };
  }
}

export const supabaseService = new SupabaseGameService();
