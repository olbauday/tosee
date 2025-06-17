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

    // Calculate XP based on decision time and streak
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

    // Record the decision
    const { data: decisionData, error: decisionError } = await supabase
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
      .select()
      .single()

    if (decisionError) {
      return NextResponse.json({ error: decisionError.message }, { status: 500 })
    }

    // Update item status
    await supabase
      .from('items')
      .update({ 
        status: decision === 'keep' ? 'keep' : 'toss',
        decision 
      })
      .eq('id', item_id)

    // Update game state
    const { data: gameState } = await supabase
      .from('game_state')
      .select('reviewed_items')
      .eq('user_id', user.id)
      .single()

    if (gameState) {
      const reviewedItems = [...(gameState.reviewed_items || []), item_id]
      await supabase
        .from('game_state')
        .update({
          reviewed_items: reviewedItems,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
    }

    // Check for achievement unlocks
    const achievements = await checkAchievements(user.id, supabase)

    return NextResponse.json({ 
      decision: decisionData,
      xp_earned,
      unlocked_achievements: achievements
    })
  } catch (error) {
    console.error('Error recording decision:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function checkAchievements(userId: string, supabase: any) {
  const unlockedAchievements: any[] = []

  // Get user stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_decisions, longest_streak, total_xp')
    .eq('id', userId)
    .single()

  if (!profile) return unlockedAchievements

  // Get all achievements
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')

  // Get user's unlocked achievements
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)

  const unlockedIds = userAchievements?.map(ua => ua.achievement_id) || []

  // Check each achievement
  for (const achievement of achievements || []) {
    if (unlockedIds.includes(achievement.id)) continue

    let shouldUnlock = false

    switch (achievement.requirement_type) {
      case 'decisions':
        shouldUnlock = profile.total_decisions >= achievement.requirement_value
        break
      case 'streak':
        shouldUnlock = profile.longest_streak >= achievement.requirement_value
        break
      case 'xp':
        shouldUnlock = profile.total_xp >= achievement.requirement_value
        break
    }

    if (shouldUnlock) {
      // Unlock achievement
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id
        })

      if (!error) {
        unlockedAchievements.push(achievement)
        
        // Add achievement XP to user
        await supabase
          .from('profiles')
          .update({
            total_xp: profile.total_xp + achievement.xp_reward
          })
          .eq('id', userId)
      }
    }
  }

  return unlockedAchievements
}