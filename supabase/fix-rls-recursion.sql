-- Temporarily disable RLS on inventory_members to fix recursion
ALTER TABLE inventory_members DISABLE ROW LEVEL SECURITY;

-- Also disable on items table temporarily
ALTER TABLE items DISABLE ROW LEVEL SECURITY;

-- Re-enable with simpler policies later
-- For now, we'll handle authorization in the application layer