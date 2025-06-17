-- Drop the problematic policies first
DROP POLICY IF EXISTS "Users can view inventories they are members of" ON inventories;
DROP POLICY IF EXISTS "Authenticated users can view inventories by share code" ON inventories;
DROP POLICY IF EXISTS "Members can view inventory membership" ON inventory_members;

-- Create simpler policies that avoid recursion

-- For inventories table
CREATE POLICY "Users can view inventories they are members of or by share code" ON inventories
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      -- User is the creator
      auth.uid() = created_by 
      OR 
      -- User is viewing by share code (for joining)
      share_code IS NOT NULL
      OR
      -- User is a member (simplified check without recursion)
      id IN (
        SELECT inventory_id 
        FROM inventory_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- For inventory_members table - simplified to avoid recursion
CREATE POLICY "Users can view members of inventories they belong to" ON inventory_members
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      -- User can see their own membership
      user_id = auth.uid()
      OR
      -- User can see members of inventories they're in
      inventory_id IN (
        SELECT inventory_id 
        FROM inventory_members AS im2
        WHERE im2.user_id = auth.uid()
      )
      OR
      -- Owner can see all members
      inventory_id IN (
        SELECT id 
        FROM inventories 
        WHERE created_by = auth.uid()
      )
    )
  );