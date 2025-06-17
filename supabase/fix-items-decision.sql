-- Add decision column to items table if it doesn't exist
-- This is for game mode tracking separate from votes

ALTER TABLE items 
ADD COLUMN IF NOT EXISTS decision VARCHAR(20);

-- The decision column tracks game mode decisions (keep/toss/maybe)
-- This is separate from the votes system which is for collaborative decisions