import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'weekly_xp'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get current period dates
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    let periodStart, periodEnd
    switch (type) {
      case 'weekly_xp':
        periodStart = weekStart
        periodEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly_xp':
        periodStart = monthStart
        periodEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
        break
      case 'all_time_xp':
        periodStart = new Date('2024-01-01')
        periodEnd = new Date('2100-01-01')
        break
      default:
        periodStart = weekStart
        periodEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    }

    // Get leaderboard entries
    const { data: entries, error } = await supabase
      .from('leaderboard_entries')
      .select(`
        *,
        profiles!user_id (
          username,
          avatar_url
        )
      `)
      .eq('leaderboard_type', type)
      .gte('period_start', periodStart.toISOString())
      .lte('period_end', periodEnd.toISOString())
      .order('score', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get current user's rank
    const { data: { user } } = await supabase.auth.getUser()
    let userRank = null

    if (user) {
      const { data: userEntry } = await supabase
        .from('leaderboard_entries')
        .select('rank, score')
        .eq('user_id', user.id)
        .eq('leaderboard_type', type)
        .gte('period_start', periodStart.toISOString())
        .lte('period_end', periodEnd.toISOString())
        .single()

      userRank = userEntry
    }

    return NextResponse.json({ 
      leaderboard: entries,
      user_rank: userRank,
      period: {
        start: periodStart,
        end: periodEnd,
        type
      }
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update leaderboard entries based on current stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_xp, longest_streak')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Update weekly XP leaderboard
    await updateLeaderboardEntry(supabase, {
      user_id: user.id,
      leaderboard_type: 'weekly_xp',
      score: profile.total_xp,
      period_start: weekStart,
      period_end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    })

    // Update monthly XP leaderboard
    await updateLeaderboardEntry(supabase, {
      user_id: user.id,
      leaderboard_type: 'monthly_xp',
      score: profile.total_xp,
      period_start: monthStart,
      period_end: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
    })

    // Update all-time XP leaderboard
    await updateLeaderboardEntry(supabase, {
      user_id: user.id,
      leaderboard_type: 'all_time_xp',
      score: profile.total_xp,
      period_start: new Date('2024-01-01'),
      period_end: new Date('2100-01-01')
    })

    // Update streak leaderboard
    await updateLeaderboardEntry(supabase, {
      user_id: user.id,
      leaderboard_type: 'streak',
      score: profile.longest_streak,
      period_start: new Date('2024-01-01'),
      period_end: new Date('2100-01-01')
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function updateLeaderboardEntry(supabase: any, entry: any) {
  const { error } = await supabase
    .from('leaderboard_entries')
    .upsert({
      ...entry,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,leaderboard_type,period_start'
    })

  if (error) {
    console.error('Error updating leaderboard entry:', error)
  }

  // Update ranks for this leaderboard type and period
  await updateRanks(supabase, entry.leaderboard_type, entry.period_start, entry.period_end)
}

async function updateRanks(supabase: any, type: string, periodStart: Date, periodEnd: Date) {
  // Get all entries for this period sorted by score
  const { data: entries } = await supabase
    .from('leaderboard_entries')
    .select('id, user_id, score')
    .eq('leaderboard_type', type)
    .gte('period_start', periodStart.toISOString())
    .lte('period_end', periodEnd.toISOString())
    .order('score', { ascending: false })

  if (!entries) return

  // Update ranks
  for (let i = 0; i < entries.length; i++) {
    await supabase
      .from('leaderboard_entries')
      .update({ rank: i + 1 })
      .eq('id', entries[i].id)
  }
}