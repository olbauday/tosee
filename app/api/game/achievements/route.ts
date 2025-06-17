import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('xp_reward', { ascending: true })

    if (achievementsError) {
      return NextResponse.json({ error: achievementsError.message }, { status: 500 })
    }

    // Get user's unlocked achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', user.id)

    if (userAchievementsError) {
      return NextResponse.json({ error: userAchievementsError.message }, { status: 500 })
    }

    // Get user stats for progress calculation
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_xp, level, current_streak, longest_streak, total_decisions, quick_decisions')
      .eq('id', user.id)
      .single()

    // Combine achievement data with unlock status
    const achievementsWithStatus = achievements.map(achievement => {
      const userAchievement = userAchievements?.find(ua => ua.achievement_id === achievement.id)
      return {
        ...achievement,
        is_unlocked: !!userAchievement,
        unlocked_at: userAchievement?.unlocked_at
      }
    })

    return NextResponse.json({ 
      achievements: achievementsWithStatus,
      user_stats: profile,
      unlocked_count: userAchievements?.length || 0,
      total_count: achievements.length
    })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}