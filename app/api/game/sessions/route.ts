import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { inventory_id, game_mode, total_items } = body

    // Create new game session
    const { data: session, error } = await supabase
      .from('game_sessions')
      .insert({
        user_id: user.id,
        inventory_id,
        game_mode,
        total_items,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Initialize or update game state
    await supabase
      .from('game_state')
      .upsert({
        user_id: user.id,
        inventory_id,
        pending_items: body.pending_items || [],
        reviewed_items: [],
        state_data: {},
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,inventory_id'
      })

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Error creating game session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { session_id, ...updateData } = body

    // Update game session
    const { data: session, error } = await supabase
      .from('game_sessions')
      .update(updateData)
      .eq('id', session_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If session is being completed, update user profile stats
    if (updateData.is_completed) {
      await supabase
        .from('profiles')
        .update({
          last_activity: new Date().toISOString()
        })
        .eq('id', user.id)
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Error updating game session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}