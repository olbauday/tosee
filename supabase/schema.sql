-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create inventories table
CREATE TABLE inventories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT,
  share_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_by UUID REFERENCES auth.users(id),
  partner_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create predefined locations table
CREATE TABLE locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inventory_id UUID REFERENCES inventories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create items table
CREATE TABLE items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inventory_id UUID REFERENCES inventories(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  name TEXT,
  location TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create votes table
CREATE TABLE votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  vote TEXT CHECK (vote IN ('keep', 'toss', 'maybe')) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(item_id, user_id)
);

-- Create tags table
CREATE TABLE tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inventory_id UUID REFERENCES inventories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(inventory_id, name)
);

-- Create item_tags junction table
CREATE TABLE item_tags (
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (item_id, tag_id)
);

-- Create comments table
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create inventory_members table for tracking who has access
CREATE TABLE inventory_members (
  inventory_id UUID REFERENCES inventories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('owner', 'partner')) DEFAULT 'partner',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (inventory_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_items_inventory_id ON items(inventory_id);
CREATE INDEX idx_votes_item_id ON votes(item_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_comments_item_id ON comments(item_id);
CREATE INDEX idx_inventory_members_user_id ON inventory_members(user_id);
CREATE INDEX idx_inventories_share_code ON inventories(share_code);

-- Create views for easier querying
CREATE OR REPLACE VIEW items_with_votes AS
SELECT 
  i.*,
  COALESCE(
    json_agg(
      json_build_object(
        'user_id', v.user_id,
        'vote', v.vote,
        'reason', v.reason,
        'created_at', v.created_at
      ) ORDER BY v.created_at
    ) FILTER (WHERE v.id IS NOT NULL), 
    '[]'::json
  ) as votes
FROM items i
LEFT JOIN votes v ON i.id = v.item_id
GROUP BY i.id;

-- Row Level Security (RLS)
ALTER TABLE inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_members ENABLE ROW LEVEL SECURITY;

-- Policies for inventories
CREATE POLICY "Users can view inventories they are members of" ON inventories
  FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM inventory_members 
      WHERE inventory_id = inventories.id 
      AND user_id = auth.uid()
    )
  );

-- Allow authenticated users to view inventories by share code (for joining)
CREATE POLICY "Authenticated users can view inventories by share code" ON inventories
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND share_code IS NOT NULL
  );

CREATE POLICY "Users can create inventories" ON inventories
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Inventory owners can update their inventories" ON inventories
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Inventory owners can delete their inventories" ON inventories
  FOR DELETE USING (auth.uid() = created_by);

-- Policies for inventory_members
CREATE POLICY "Members can view inventory membership" ON inventory_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM inventories 
      WHERE id = inventory_members.inventory_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Inventory owners can manage members" ON inventory_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM inventories 
      WHERE id = inventory_members.inventory_id 
      AND created_by = auth.uid()
    )
  );

-- Allow authenticated users to join inventories (insert themselves as members)
CREATE POLICY "Users can join inventories" ON inventory_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND role = 'partner'
  );

-- Policies for items
CREATE POLICY "Members can view items in their inventories" ON items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM inventory_members 
      WHERE inventory_id = items.inventory_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create items in their inventories" ON items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM inventory_members 
      WHERE inventory_id = items.inventory_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Item creators can update their items" ON items
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Item creators can delete their items" ON items
  FOR DELETE USING (auth.uid() = created_by);

-- Policies for votes
CREATE POLICY "Members can view votes in their inventories" ON votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN inventory_members im ON i.inventory_id = im.inventory_id
      WHERE i.id = votes.item_id 
      AND im.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own votes" ON votes
  FOR ALL USING (auth.uid() = user_id);

-- Policies for comments
CREATE POLICY "Members can view comments in their inventories" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN inventory_members im ON i.inventory_id = im.inventory_id
      WHERE i.id = comments.item_id 
      AND im.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create comments in their inventories" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM items i
      JOIN inventory_members im ON i.inventory_id = im.inventory_id
      WHERE i.id = comments.item_id 
      AND im.user_id = auth.uid()
    )
  );

CREATE POLICY "Comment authors can update their comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Comment authors can delete their comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for locations
CREATE POLICY "Members can manage locations in their inventories" ON locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM inventory_members 
      WHERE inventory_id = locations.inventory_id 
      AND user_id = auth.uid()
    )
  );

-- Policies for tags
CREATE POLICY "Members can manage tags in their inventories" ON tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM inventory_members 
      WHERE inventory_id = tags.inventory_id 
      AND user_id = auth.uid()
    )
  );

-- Policies for item_tags
CREATE POLICY "Members can manage item tags in their inventories" ON item_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN inventory_members im ON i.inventory_id = im.inventory_id
      WHERE i.id = item_tags.item_id 
      AND im.user_id = auth.uid()
    )
  );

-- Functions for triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_inventories_updated_at BEFORE UPDATE ON inventories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();