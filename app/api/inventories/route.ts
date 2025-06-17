import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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

    // Get request body
    const body = await request.json()
    const { name, partnerEmail } = body

    // Generate share code
    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Use service role client to bypass RLS
    const serviceSupabase = createServiceRoleClient()

    // Create inventory with service role (bypasses RLS)
    const { data: inventory, error: inventoryError } = await serviceSupabase
      .from('inventories')
      .insert({
        name: name || 'Untitled Inventory',
        created_by: user.id,
        partner_email: partnerEmail || null,
        share_code: shareCode,
      })
      .select()
      .single()

    if (inventoryError) {
      console.error('Error creating inventory:', inventoryError)
      return NextResponse.json(
        { error: inventoryError.message },
        { status: 400 }
      )
    }

    // Add creator as a member with service role
    const { error: memberError } = await serviceSupabase
      .from('inventory_members')
      .insert({
        inventory_id: inventory.id,
        user_id: user.id,
        role: 'owner',
      })

    if (memberError) {
      console.error('Error adding member:', memberError)
      // Try to clean up the inventory if member creation fails
      await serviceSupabase
        .from('inventories')
        .delete()
        .eq('id', inventory.id)
      
      return NextResponse.json(
        { error: memberError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ inventory })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}