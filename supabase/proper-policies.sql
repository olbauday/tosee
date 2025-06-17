-- Drop the temporary policies
DROP POLICY IF EXISTS "Temporary: Authenticated users can view all inventories" ON inventories;
DROP POLICY IF EXISTS "Temporary: Authenticated users can view all members" ON inventory_members;

-- Create proper policies for inventories
CREATE POLICY "Users can view their own inventories" ON inventories
  FOR SELECT USING (
    auth.uid() = created_by
  );

CREATE POLICY "Users can view inventories they are members of" ON inventories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM inventory_members 
      WHERE inventory_members.inventory_id = inventories.id 
      AND inventory_members.user_id = auth.uid()
    )
  );

-- IMPORTANT: Separate policy for viewing by share code (no recursion)
CREATE POLICY "Authenticated users can view inventories by share code for joining" ON inventories
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND share_code IS NOT NULL
  );

-- Create proper policies for inventory_members
CREATE POLICY "Users can view their own membership records" ON inventory_members
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can view all members in inventories they belong to" ON inventory_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM inventory_members AS my_membership
      WHERE my_membership.inventory_id = inventory_members.inventory_id
      AND my_membership.user_id = auth.uid()
    )
  );

CREATE POLICY "Inventory owners can view all members" ON inventory_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM inventories 
      WHERE inventories.id = inventory_members.inventory_id 
      AND inventories.created_by = auth.uid()
    )
  );