'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface GameStats {
  totalXP: number
  level: number
  currentStreak: number
  longestStreak: number
  totalDecisions: number
  quickDecisions: number
}

interface GameSession {
  id: string
  gameMode: 'quick_sort' | 'speed_toss' | 'deep_sort' | 'free_play'
  startedAt: Date
  totalItems: number
  itemsDecided: number
  itemsKept: number
  itemsTossed: number
  sessionXP: number
  maxStreak: number
  currentStreak: number
  lastDecisionTime?: number
  comboMultiplier: number
  timeRemaining?: number // for timed modes
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  unlockedAt?: Date
}

interface GameState {
  userStats: GameStats
  currentSession: GameSession | null
  achievements: Achievement[]
  unlockedAchievements: string[]
  pendingItems: string[]
  reviewedItems: string[]
  currentItemIndex: number
  isLoading: boolean
  error: string | null
}

type GameAction =
  | { type: 'SET_USER_STATS'; payload: GameStats }
  | { type: 'START_SESSION'; payload: Omit<GameSession, 'currentStreak' | 'comboMultiplier'> }
  | { type: 'END_SESSION' }
  | { type: 'MAKE_DECISION'; payload: { itemId: string; decision: 'keep' | 'toss'; decisionTime: number } }
  | { type: 'UPDATE_STREAK'; payload: number }
  | { type: 'UPDATE_COMBO'; payload: number }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'SET_ACHIEVEMENTS'; payload: Achievement[] }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'SET_PENDING_ITEMS'; payload: string[] }
  | { type: 'NEXT_ITEM' }
  | { type: 'PREVIOUS_ITEM' }
  | { type: 'UPDATE_TIME'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

const initialState: GameState = {
  userStats: {
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    totalDecisions: 0,
    quickDecisions: 0,
  },
  currentSession: null,
  achievements: [],
  unlockedAchievements: [],
  pendingItems: [],
  reviewedItems: [],
  currentItemIndex: 0,
  isLoading: false,
  error: null,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_USER_STATS':
      return { ...state, userStats: action.payload }

    case 'START_SESSION':
      return {
        ...state,
        currentSession: {
          ...action.payload,
          currentStreak: 0,
          comboMultiplier: 1.0,
        },
        reviewedItems: [],
        currentItemIndex: 0,
      }

    case 'END_SESSION':
      return {
        ...state,
        currentSession: null,
        pendingItems: [],
        reviewedItems: [],
        currentItemIndex: 0,
      }

    case 'MAKE_DECISION': {
      if (!state.currentSession) return state

      const isQuickDecision = action.payload.decisionTime < 3000
      const newStreak = isQuickDecision ? state.currentSession.currentStreak + 1 : 0
      const newCombo = calculateComboMultiplier(newStreak)
      const baseXP = 10
      const bonusXP = calculateXPBonus(action.payload.decisionTime, newStreak)
      const totalXP = Math.floor((baseXP + bonusXP) * newCombo)

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          itemsDecided: state.currentSession.itemsDecided + 1,
          itemsKept: action.payload.decision === 'keep' 
            ? state.currentSession.itemsKept + 1 
            : state.currentSession.itemsKept,
          itemsTossed: action.payload.decision === 'toss' 
            ? state.currentSession.itemsTossed + 1 
            : state.currentSession.itemsTossed,
          sessionXP: state.currentSession.sessionXP + totalXP,
          currentStreak: newStreak,
          maxStreak: Math.max(state.currentSession.maxStreak, newStreak),
          comboMultiplier: newCombo,
          lastDecisionTime: action.payload.decisionTime,
        },
        reviewedItems: [...state.reviewedItems, action.payload.itemId],
        userStats: {
          ...state.userStats,
          totalXP: state.userStats.totalXP + totalXP,
          totalDecisions: state.userStats.totalDecisions + 1,
          quickDecisions: isQuickDecision 
            ? state.userStats.quickDecisions + 1 
            : state.userStats.quickDecisions,
          currentStreak: newStreak,
          longestStreak: Math.max(state.userStats.longestStreak, newStreak),
        },
      }
    }

    case 'UPDATE_STREAK':
      return {
        ...state,
        currentSession: state.currentSession
          ? { ...state.currentSession, currentStreak: action.payload }
          : null,
      }

    case 'UPDATE_COMBO':
      return {
        ...state,
        currentSession: state.currentSession
          ? { ...state.currentSession, comboMultiplier: action.payload }
          : null,
      }

    case 'ADD_XP': {
      const newTotalXP = state.userStats.totalXP + action.payload
      const newLevel = calculateLevel(newTotalXP)
      
      return {
        ...state,
        userStats: {
          ...state.userStats,
          totalXP: newTotalXP,
          level: newLevel,
        },
        currentSession: state.currentSession
          ? {
              ...state.currentSession,
              sessionXP: state.currentSession.sessionXP + action.payload,
            }
          : null,
      }
    }

    case 'SET_ACHIEVEMENTS':
      return { ...state, achievements: action.payload }

    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        unlockedAchievements: [...state.unlockedAchievements, action.payload],
      }

    case 'SET_PENDING_ITEMS':
      return { ...state, pendingItems: action.payload }

    case 'NEXT_ITEM':
      return {
        ...state,
        currentItemIndex: Math.min(
          state.currentItemIndex + 1,
          state.pendingItems.length - 1
        ),
      }

    case 'PREVIOUS_ITEM':
      return {
        ...state,
        currentItemIndex: Math.max(state.currentItemIndex - 1, 0),
      }

    case 'UPDATE_TIME':
      return {
        ...state,
        currentSession: state.currentSession
          ? { ...state.currentSession, timeRemaining: action.payload }
          : null,
      }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    default:
      return state
  }
}

// Helper functions
function calculateComboMultiplier(streak: number): number {
  if (streak >= 50) return 3.0
  if (streak >= 30) return 2.5
  if (streak >= 20) return 2.0
  if (streak >= 10) return 1.5
  if (streak >= 5) return 1.25
  return 1.0
}

function calculateXPBonus(decisionTimeMs: number, streak: number): number {
  let timeBonus = 0
  let streakBonus = 0

  // Time bonus
  if (decisionTimeMs < 1000) timeBonus = 20
  else if (decisionTimeMs < 3000) timeBonus = 10
  else if (decisionTimeMs < 5000) timeBonus = 5

  // Streak bonus
  if (streak >= 50) streakBonus = 50
  else if (streak >= 20) streakBonus = 25
  else if (streak >= 10) streakBonus = 15
  else if (streak >= 5) streakBonus = 10

  return timeBonus + streakBonus
}

function calculateLevel(totalXP: number): number {
  if (totalXP >= 10000) return 10
  if (totalXP >= 5000) return 9
  if (totalXP >= 2500) return 8
  if (totalXP >= 1500) return 7
  if (totalXP >= 1000) return 6
  if (totalXP >= 600) return 5
  if (totalXP >= 350) return 4
  if (totalXP >= 150) return 3
  if (totalXP >= 50) return 2
  return 1
}

// Context
const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<GameAction>
  startSession: (gameMode: GameSession['gameMode'], inventoryId: string, items: string[]) => Promise<void>
  endSession: () => Promise<void>
  makeDecision: (itemId: string, decision: 'keep' | 'toss', decisionTime: number) => Promise<void>
  checkAchievements: () => Promise<void>
} | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const supabase = createClient()

  // Load user stats on mount
  useEffect(() => {
    loadUserStats()
    loadAchievements()
  }, [])

  const loadUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp, level, current_streak, longest_streak, total_decisions, quick_decisions')
        .eq('id', user.id)
        .single()

      if (profile) {
        dispatch({
          type: 'SET_USER_STATS',
          payload: {
            totalXP: profile.total_xp || 0,
            level: profile.level || 1,
            currentStreak: profile.current_streak || 0,
            longestStreak: profile.longest_streak || 0,
            totalDecisions: profile.total_decisions || 0,
            quickDecisions: profile.quick_decisions || 0,
          },
        })
      }
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const loadAchievements = async () => {
    try {
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .order('xp_reward', { ascending: true })

      if (achievements) {
        dispatch({ type: 'SET_ACHIEVEMENTS', payload: achievements })
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: unlocked } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', user.id)

        if (unlocked) {
          unlocked.forEach(ua => {
            dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: ua.achievement_id })
          })
        }
      }
    } catch (error) {
      console.error('Error loading achievements:', error)
    }
  }

  const startSession = async (
    gameMode: GameSession['gameMode'], 
    inventoryId: string, 
    items: string[]
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Create session via API to avoid RLS issues
      const response = await fetch('/api/game/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory_id: inventoryId,
          game_mode: gameMode,
          total_items: items.length,
          pending_items: items
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create session')
      }

      const { session } = await response.json()

      dispatch({
        type: 'START_SESSION',
        payload: {
          id: session.id,
          gameMode,
          startedAt: new Date(session.started_at),
          totalItems: items.length,
          itemsDecided: 0,
          itemsKept: 0,
          itemsTossed: 0,
          sessionXP: 0,
          maxStreak: 0,
          timeRemaining: gameMode === 'quick_sort' ? 300 : gameMode === 'speed_toss' ? 120 : undefined,
        },
      })

      dispatch({ type: 'SET_PENDING_ITEMS', payload: items })
    } catch (error) {
      console.error('Error starting session:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start session' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const endSession = async () => {
    try {
      if (!state.currentSession) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update session via API
      const response = await fetch('/api/game/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: state.currentSession.id,
          ended_at: new Date().toISOString(),
          items_decided: state.currentSession.itemsDecided,
          items_kept: state.currentSession.itemsKept,
          items_tossed: state.currentSession.itemsTossed,
          session_xp: state.currentSession.sessionXP,
          max_streak: state.currentSession.maxStreak,
          is_completed: true
        })
      })

      if (!response.ok) {
        console.error('Failed to end session')
      }

      dispatch({ type: 'END_SESSION' })
      await checkAchievements()
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  const makeDecision = async (
    itemId: string, 
    decision: 'keep' | 'toss', 
    decisionTime: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !state.currentSession) return

      // Calculate XP locally first
      const xpEarned = Math.floor(
        (10 + calculateXPBonus(decisionTime, state.currentSession.currentStreak)) * 
        state.currentSession.comboMultiplier
      )

      // Update local state immediately for responsiveness
      dispatch({ 
        type: 'MAKE_DECISION', 
        payload: { itemId, decision, decisionTime } 
      })

      // Save to database via API to avoid RLS issues
      const response = await fetch('/api/game/decisions-with-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          session_id: state.currentSession.id,
          decision,
          decision_time_ms: decisionTime,
          streak_count: state.currentSession.currentStreak,
          combo_multiplier: state.currentSession.comboMultiplier
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to save decision:', error)
      } else {
        const data = await response.json()
        console.log('Decision saved:', data)
      }

      // Move to next item
      if (state.currentItemIndex < state.pendingItems.length - 1) {
        dispatch({ type: 'NEXT_ITEM' })
      }
    } catch (error) {
      console.error('Error making decision:', error)
    }
  }

  const checkAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check each achievement condition
      for (const achievement of state.achievements) {
        if (state.unlockedAchievements.includes(achievement.id)) continue

        let shouldUnlock = false

        switch (achievement.requirement_type) {
          case 'decisions':
            shouldUnlock = state.userStats.totalDecisions >= achievement.requirement_value
            break
          case 'streak':
            shouldUnlock = state.userStats.longestStreak >= achievement.requirement_value
            break
          case 'xp':
            shouldUnlock = state.userStats.totalXP >= achievement.requirement_value
            break
        }

        if (shouldUnlock) {
          // Unlock achievement
          await supabase
            .from('user_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievement.id,
            })

          dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement.id })
          dispatch({ type: 'ADD_XP', payload: achievement.xpReward })

          // Show notification (you can implement a toast system)
          console.log(`Achievement unlocked: ${achievement.name}!`)
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error)
    }
  }

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        startSession,
        endSession,
        makeDecision,
        checkAchievements,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}