-- Game State Table (Single Row)
CREATE TABLE IF NOT EXISTS game_state (
  id INT PRIMARY KEY DEFAULT 1,
  global_start_time TIMESTAMPTZ,
  global_timer_status TEXT DEFAULT 'Stopped',
  global_elapsed_ms BIGINT DEFAULT 0,
  final_start_time TIMESTAMPTZ,
  final_timer_status TEXT DEFAULT 'Stopped',
  final_timer_duration BIGINT DEFAULT 600,
  final_elapsed_ms BIGINT DEFAULT 0,
  game_status TEXT DEFAULT 'Not Started',
  leaderboard_locked BOOLEAN DEFAULT false,
  display_top_10 BOOLEAN DEFAULT false,
  display_finalists BOOLEAN DEFAULT false,
  hide_eliminated BOOLEAN DEFAULT false
);

-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
  team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  room_number INT NOT NULL,
  current_level INT DEFAULT 1,
  level_1_time TIMESTAMPTZ,
  level_2_time TIMESTAMPTZ,
  level_3_time TIMESTAMPTZ,
  team_status TEXT DEFAULT 'Playing',
  timer_status TEXT DEFAULT 'Running',
  bonus_time_ms BIGINT DEFAULT 0,
  penalty_time_ms BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers Table
CREATE TABLE IF NOT EXISTS answers (
  level INT PRIMARY KEY,
  correct_answer TEXT NOT NULL
);

-- Insert Default Game State
INSERT INTO game_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Insert Default Answers
INSERT INTO answers (level, correct_answer) VALUES 
  (1, 'demogorgon'),
  (2, 'eleven'),
  (3, 'hawkins')
ON CONFLICT (level) DO NOTHING;

-- Enable Realtime for all tables
alter publication supabase_realtime add table game_state;
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table answers;
