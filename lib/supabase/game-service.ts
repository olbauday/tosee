import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from './service-role'

// Use service role client for game queries to bypass RLS issues
export async function getGameItems(inventoryId: string, userId: string) {
  try {
    // First verify user has access using regular client
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.id !== userId) {
      throw new Error('Unauthorized')
    }

    // Use service role client to bypass RLS
    const serviceClient = createServiceRoleClient()
    
    // Check if user is member of inventory
    const { data: member } = await serviceClient
      .from('inventory_members')
      .select('user_id')
      .eq('inventory_id', inventoryId)
      .eq('user_id', userId)
      .single()
    
    if (!member) {
      throw new Error('Access denied')
    }
    
    // Get all items
    const { data: items, error } = await serviceClient
      .from('items')
      .select('*')
      .eq('inventory_id', inventoryId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Get decided items for this user
    const { data: decisions } = await serviceClient
      .from('item_decisions')
      .select('item_id')
      .eq('user_id', userId)
      .in('item_id', items?.map(i => i.id) || [])
    
    const decidedIds = new Set(decisions?.map(d => d.item_id) || [])
    const availableItems = items?.filter(item => !decidedIds.has(item.id)) || []
    
    return {
      items: availableItems,
      totalItems: items?.length || 0,
      decidedCount: decidedIds.size
    }
  } catch (error) {
    console.error('Game service error:', error)
    throw error
  }
}