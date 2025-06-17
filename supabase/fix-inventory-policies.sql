-- Fix the infinite recursion in inventory_members policies

-- First, let's check current policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'inventory_members';

-- Drop problematic policies if they exist
DROP POLICY IF EXISTS "Users can view inventory members" ON inventory_members;
DROP POLICY IF EXISTS "Users can add inventory members" ON inventory_members;

-- Create simpler policies that avoid recursion
CREATE POLICY "Users can view inventory members simple" ON inventory_members
    FOR SELECT 
    USING (
        auth.uid() = user_id 
        OR 
        inventory_id IN (
            SELECT inventory_id 
            FROM inventory_members AS im2 
            WHERE im2.user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can add inventory members" ON inventory_members
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM inventories 
            WHERE inventories.id = inventory_id 
            AND inventories.created_by = auth.uid()
        )
    );

-- Also ensure items table has proper policies
DROP POLICY IF EXISTS "Users can view items in their inventories" ON items;

CREATE POLICY "Users can view items in their inventories simple" ON items
    FOR SELECT 
    USING (
        inventory_id IN (
            SELECT inventory_id 
            FROM inventory_members 
            WHERE user_id = auth.uid()
        )
    );