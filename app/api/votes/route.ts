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
    const { item_id, vote } = body

    // Use service role client to bypass RLS
    const serviceSupabase = createServiceRoleClient()

    // Get the item to check inventory membership
    const { data: item, error: itemError } = await serviceSupabase
      .from('items')
      .select('inventory_id')
      .eq('id', item_id)
      .single()

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Verify user is a member of this inventory
    const { data: member, error: memberError } = await serviceSupabase
      .from('inventory_members')
      .select('*')
      .eq('inventory_id', item.inventory_id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Not authorized to vote on this item' },
        { status: 403 }
      )
    }

    // First check if vote exists
    const { data: existingVote } = await serviceSupabase
      .from('votes')
      .select('id')
      .eq('item_id', item_id)
      .eq('user_id', user.id)
      .single()

    let voteData, voteError

    if (existingVote) {
      // Update existing vote
      const { data, error } = await serviceSupabase
        .from('votes')
        .update({ vote })
        .eq('id', existingVote.id)
        .select()
        .single()
      
      voteData = data
      voteError = error
    } else {
      // Create new vote
      const { data, error } = await serviceSupabase
        .from('votes')
        .insert({
          item_id,
          user_id: user.id,
          vote,
        })
        .select()
        .single()
      
      voteData = data
      voteError = error
    }

    if (voteError) {
      console.error('Error creating vote:', voteError)
      return NextResponse.json(
        { error: voteError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ vote: voteData })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}