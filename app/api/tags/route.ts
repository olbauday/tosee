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
        { error: 'Not authorized to add tags to this inventory' },
        { status: 403 }
      )
    }

    // Create tag with service role
    const { data: tag, error: tagError } = await serviceSupabase
      .from('tags')
      .insert({
        inventory_id,
        name: name.trim()
      })
      .select()
      .single()

    if (tagError) {
      console.error('Error creating tag:', tagError)
      return NextResponse.json(
        { error: tagError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ tag })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}