-- Game Features Database Schema

-- User profiles extension for game features
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_decisions INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS quick_decisions INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES inventories(id) ON DELETE CASCADE,
    game_mode VARCHAR(50) NOT NULL, -- 'quick_sort', 'speed_toss', 'deep_sort'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    total_items INTEGER DEFAULT 0,
    items_decided INTEGER DEFAULT 0,
    items_kept INTEGER DEFAULT 0,
    items_tossed INTEGER DEFAULT 0,
    session_xp INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    average_decision_time FLOAT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Decision tracking with game mechanics
CREATE TABLE IF NOT EXISTS item_decisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
    decision VARCHAR(20) NOT NULL, -- 'keep', 'toss', 'maybe'
    decision_time_ms INTEGER, -- milliseconds taken to decide
    xp_earned INTEGER DEFAULT 10,
    streak_count INTEGER DEFAULT 0,
    combo_multiplier FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements system
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    xp_reward INTEGER DEFAULT 100,
    category VARCHAR(50), -- 'speed', 'volume', 'streak', 'special'
    requirement_type VARCHAR(50), -- 'decisions', 'streak', 'xp', 'items'
    requirement_value INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    leaderboard_type VARCHAR(50) NOT NULL, -- 'weekly_xp', 'monthly_xp', 'all_time_xp', 'streak'
    score INTEGER NOT NULL,
    rank INTEGER,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Container/Location system enhancement
CREATE TABLE IF NOT EXISTS containers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    description TEXT,
    color VARCHAR(7), -- hex color
    icon VARCHAR(50),
    item_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add container reference to items
ALTER TABLE items ADD COLUMN IF NOT EXISTS container_id UUID REFERENCES containers(id) ON DELETE SET NULL;

-- Game state persistence
CREATE TABLE IF NOT EXISTS game_state (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES inventories(id) ON DELETE CASCADE,
    current_item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    pending_items UUID[] DEFAULT '{}',
    reviewed_items UUID[] DEFAULT '{}',
    state_data JSONB DEFAULT '{}', -- flexible storage for game-specific data
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, inventory_id)
);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, xp_reward, category, requirement_type, requirement_value) VALUES
-- Speed achievements
('Speed Demon', 'Make 10 decisions in under 30 seconds', 'zap', 150, 'speed', 'decisions', 10),
('Lightning Fast', 'Make 25 decisions in under 2 minutes', 'bolt', 300, 'speed', 'decisions', 25),
('Instant Decision', 'Make a decision in under 1 second', 'flash', 50, 'speed', 'decision_time', 1000),

-- Streak achievements
('Getting Started', 'Reach a 5 decision streak', 'fire', 50, 'streak', 'streak', 5),
('On Fire', 'Reach a 20 decision streak', 'flame', 200, 'streak', 'streak', 20),
('Unstoppable', 'Reach a 50 decision streak', 'rocket', 500, 'streak', 'streak', 50),

-- Volume achievements
('First Steps', 'Make your first 10 decisions', 'star', 25, 'volume', 'decisions', 10),
('Committed', 'Make 100 total decisions', 'award', 150, 'volume', 'decisions', 100),
('Declutter Master', 'Make 1000 total decisions', 'crown', 1000, 'volume', 'decisions', 1000),

-- Special achievements
('Balanced', 'Keep and toss exactly 50/50 in a session', 'scale', 200, 'special', 'balanced', 1),
('Minimalist', 'Toss 20 items in a row', 'package', 250, 'special', 'toss_streak', 20),
('Collector', 'Keep 20 items in a row', 'heart', 250, 'special', 'keep_streak', 20)
ON CONFLICT (name) DO NOTHING;

-- Functions for game mechanics
CREATE OR REPLACE FUNCTION calculate_xp_with_bonus(
    base_xp INTEGER,
    decision_time_ms INTEGER,
    streak_count INTEGER
) RETURNS INTEGER AS $$
DECLARE
    time_bonus INTEGER := 0;
    streak_bonus INTEGER := 0;
    total_xp INTEGER;
BEGIN
    -- Time bonus: extra XP for quick decisions
    IF decision_time_ms < 1000 THEN
        time_bonus := 20;
    ELSIF decision_time_ms < 3000 THEN
        time_bonus := 10;
    ELSIF decision_time_ms < 5000 THEN
        time_bonus := 5;
    END IF;
    
    -- Streak bonus: exponential growth
    IF streak_count >= 50 THEN
        streak_bonus := 50;
    ELSIF streak_count >= 20 THEN
        streak_bonus := 25;
    ELSIF streak_count >= 10 THEN
        streak_bonus := 15;
    ELSIF streak_count >= 5 THEN
        streak_bonus := 10;
    END IF;
    
    total_xp := base_xp + time_bonus + streak_bonus;
    RETURN total_xp;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats after decisions
CREATE OR REPLACE FUNCTION update_user_game_stats() RETURNS TRIGGER AS $$
BEGIN
    -- Update user profile stats
    UPDATE profiles
    SET 
        total_xp = total_xp + NEW.xp_earned,
        total_decisions = total_decisions + 1,
        quick_decisions = CASE 
            WHEN NEW.decision_time_ms < 3000 THEN quick_decisions + 1
            ELSE quick_decisions
        END,
        last_activity = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Update level based on XP thresholds
    UPDATE profiles
    SET level = CASE
        WHEN total_xp >= 10000 THEN 10
        WHEN total_xp >= 5000 THEN 9
        WHEN total_xp >= 2500 THEN 8
        WHEN total_xp >= 1500 THEN 7
        WHEN total_xp >= 1000 THEN 6
        WHEN total_xp >= 600 THEN 5
        WHEN total_xp >= 350 THEN 4
        WHEN total_xp >= 150 THEN 3
        WHEN total_xp >= 50 THEN 2
        ELSE 1
    END
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_on_decision
AFTER INSERT ON item_decisions
FOR EACH ROW
EXECUTE FUNCTION update_user_game_stats();

-- RLS Policies
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

-- Game sessions policies
CREATE POLICY "Users can view their own game sessions" ON game_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game sessions" ON game_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Item decisions policies
CREATE POLICY "Users can view their own decisions" ON item_decisions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decisions" ON item_decisions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock their own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard policies (public read, user write own)
CREATE POLICY "Anyone can view leaderboards" ON leaderboard_entries
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own leaderboard entries" ON leaderboard_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leaderboard entries" ON leaderboard_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- Containers policies
CREATE POLICY "Users can view their own containers" ON containers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own containers" ON containers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own containers" ON containers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own containers" ON containers
    FOR DELETE USING (auth.uid() = user_id);

-- Game state policies
CREATE POLICY "Users can view their own game state" ON game_state
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game state" ON game_state
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game state" ON game_state
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_inventory_id ON game_sessions(inventory_id);
CREATE INDEX idx_item_decisions_user_id ON item_decisions(user_id);
CREATE INDEX idx_item_decisions_session_id ON item_decisions(session_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_leaderboard_entries_type_score ON leaderboard_entries(leaderboard_type, score DESC);
CREATE INDEX idx_containers_user_id ON containers(user_id);
CREATE INDEX idx_game_state_user_inventory ON game_state(user_id, inventory_id);