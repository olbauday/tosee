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
    const { inventory_id, name } = body

    // Use service role client to bypass RLS
    const serviceSupabase = createServiceRoleClient()

    // Verify user is a member of this inventory
    const { data: member, error: memberError } = await serviceSupabase
      .from('inventory_members')
      .select('*')
      .eq('inventory_id', inventory_id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Not authorized to add locations to this inventory' },
        { status: 403 }
      )
    }

    // Create location with service role
    const { data: location, error: locationError } = await serviceSupabase
      .from('locations')
      .insert({
        inventory_id,
        name: name.trim()
      })
      .select()
      .single()

    if (locationError) {
      console.error('Error creating location:', locationError)
      return NextResponse.json(
        { error: locationError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ location })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}