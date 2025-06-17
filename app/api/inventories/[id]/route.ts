import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Use regular client to check authentication
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: inventoryId } = await params

    // Use service role client to bypass RLS
    const serviceSupabase = createServiceRoleClient()

    // Check if user is a member of this inventory
    const { data: member, error: memberError } = await serviceSupabase
      .from('inventory_members')
      .select('*')
      .eq('inventory_id', inventoryId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Not a member of this inventory' },
        { status: 403 }
      )
    }

    // Fetch inventory details
    const { data: inventory, error: inventoryError } = await serviceSupabase
      .from('inventories')
      .select('*, inventory_members(user_id)')
      .eq('id', inventoryId)
      .single()

    if (inventoryError || !inventory) {
      return NextResponse.json(
        { error: 'Inventory not found' },
        { status: 404 }
      )
    }

    // Fetch all items with votes
    const { data: items } = await serviceSupabase
      .from('items')
      .select('*, votes(*), item_tags(tag_id, tags(name))')
      .eq('inventory_id', inventoryId)
      .order('created_at', { ascending: false })

    // Fetch predefined locations
    const { data: locations } = await serviceSupabase
      .from('locations')
      .select('*')
      .eq('inventory_id', inventoryId)
      .order('name')

    // Fetch all tags for this inventory
    const { data: tags } = await serviceSupabase
      .from('tags')
      .select('*')
      .eq('inventory_id', inventoryId)
      .order('name')

    return NextResponse.json({
      inventory,
      items: items || [],
      locations: locations || [],
      tags: tags || [],
      member
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}