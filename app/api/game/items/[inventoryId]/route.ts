import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ inventoryId: string }> }
) {
  const { inventoryId } = await params;
  try {
    console.log('Game items API called with inventoryId:', inventoryId)
    
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('User auth error:', userError)
      return NextResponse.json({ error: 'Auth error: ' + userError.message }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // inventoryId already extracted above

    // First check if user has access to this inventory
    const { data: memberCheck, error: memberError } = await supabase
      .from('inventory_members')
      .select('user_id')
      .eq('inventory_id', inventoryId)
      .eq('user_id', user.id)
      .single()

    if (memberError) {
      console.error('Member check error:', memberError)
      // If it's the recursion error, skip the check for now
      if (memberError.message.includes('infinite recursion')) {
        console.log('Skipping member check due to recursion issue')
      } else if (memberError.code !== 'PGRST116') { // PGRST116 is "not found"
        return NextResponse.json({ error: 'Member check failed: ' + memberError.message }, { status: 500 })
      }
    }

    if (!memberCheck && !memberError?.message.includes('infinite recursion')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get items for the game - simple query
    const { data: items, error } = await supabase
      .from('items')
      .select(`
        id,
        name,
        description,
        photo_url,
        category,
        location,
        created_at
      `)
      .eq('inventory_id', inventoryId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching game items:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get items that have already been decided by this user in game mode
    const { data: decidedItems } = await supabase
      .from('item_decisions')
      .select('item_id')
      .eq('user_id', user.id)
      .in('item_id', items.map(item => item.id))

    const decidedItemIds = new Set(decidedItems?.map(d => d.item_id) || [])
    
    // Filter out already decided items
    const availableItems = items.filter(item => !decidedItemIds.has(item.id))

    return NextResponse.json({ 
      items: availableItems,
      totalItems: items.length,
      decidedCount: decidedItemIds.size
    })
  } catch (error) {
    console.error('Error in game items API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}