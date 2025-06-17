import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      item_id, 
      session_id, 
      decision, 
      decision_time_ms,
      streak_count = 0,
      combo_multiplier = 1.0 
    } = body

    console.log('Recording decision with item update:', {
      item_id,
      decision,
      user_id: user.id
    })

    // Calculate XP
    let xp_earned = 10 // base XP
    
    // Time bonus
    if (decision_time_ms < 1000) xp_earned += 20
    else if (decision_time_ms < 3000) xp_earned += 10
    else if (decision_time_ms < 5000) xp_earned += 5

    // Streak bonus
    if (streak_count >= 50) xp_earned += 50
    else if (streak_count >= 20) xp_earned += 25
    else if (streak_count >= 10) xp_earned += 15
    else if (streak_count >= 5) xp_earned += 10

    // Apply combo multiplier
    xp_earned = Math.floor(xp_earned * combo_multiplier)

    try {
      // Try to use service role client if available
      const serviceClient = createServiceRoleClient()
      
      // Update the item with the decision
      const { error: itemError } = await serviceClient
        .from('items')
        .update({ 
          decision: decision,
          status: decision // Also update status field if it exists
        })
        .eq('id', item_id)
      
      if (itemError) {
        console.error('Error updating item:', itemError)
      } else {
        console.log('Item updated successfully')
      }
      
      // Record the decision in game history
      const { error: decisionError } = await serviceClient
        .from('item_decisions')
        .insert({
          item_id,
          user_id: user.id,
          session_id,
          decision,
          decision_time_ms,
          xp_earned,
          streak_count,
          combo_multiplier
        })
      
      if (decisionError) {
        console.error('Error recording decision:', decisionError)
      }
      
    } catch (serviceError) {
      console.log('Service role not available, trying regular client')
      
      // Fallback to regular client (will only work if RLS is disabled)
      const { error: itemError } = await supabase
        .from('items')
        .update({ 
          decision: decision,
          status: decision
        })
        .eq('id', item_id)
      
      if (itemError) {
        console.error('Error updating item with regular client:', itemError)
        // Continue anyway - at least the game will work
      }
    }

    // Also create/update a vote for this item so it shows in the inventory
    try {
      // Check if user already has a vote
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('item_id', item_id)
        .eq('user_id', user.id)
        .single()

      if (existingVote) {
        // Update existing vote
        await supabase
          .from('votes')
          .update({ vote: decision })
          .eq('id', existingVote.id)
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            item_id,
            user_id: user.id,
            vote: decision
          })
      }
    } catch (voteError) {
      console.error('Error updating vote:', voteError)
    }

    return NextResponse.json({ 
      success: true,
      decision: {
        item_id,
        decision,
        xp_earned
      }
    })
  } catch (error) {
    console.error('Error recording decision:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}