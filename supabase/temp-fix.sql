-- Temporarily create a very permissive policy for testing
-- WARNING: This is for debugging only, remove after fixing the issue

-- First, drop all existing policies on inventories
DROP POLICY IF EXISTS "Users can view inventories they are members of or by share code" ON inventories;
DROP POLICY IF EXISTS "Users can view inventories they are members of" ON inventories;
DROP POLICY IF EXISTS "Authenticated users can view inventories by share code" ON inventories;

-- Create a simple policy that allows authenticated users to view any inventory
CREATE POLICY "Temporary: Authenticated users can view all inventories" ON inventories
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

-- Also simplify the inventory_members policy
DROP POLICY IF EXISTS "Users can view members of inventories they belong to" ON inventory_members;
DROP POLICY IF EXISTS "Members can view inventory membership" ON inventory_members;

-- Create a simple policy for inventory_members
CREATE POLICY "Temporary: Authenticated users can view all members" ON inventory_members
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );