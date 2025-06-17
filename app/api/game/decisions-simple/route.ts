import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    console.log('Recording decision:', {
      item_id,
      session_id,
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

    // For now, just return success
    // In production, you'd save this to the database
    return NextResponse.json({ 
      success: true,
      decision: {
        item_id,
        decision,
        xp_earned
      },
      message: 'Decision recorded (RLS disabled - implement service role for production)'
    })
  } catch (error) {
    console.error('Error recording decision:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}