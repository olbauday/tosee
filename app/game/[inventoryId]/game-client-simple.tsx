'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GameProvider } from '@/lib/game/gameContext'
import GameModeSelector from '@/components/game/GameModeSelector'
import SwipeMode from '@/components/game/SwipeMode'
import SessionComplete from '@/components/game/SessionComplete'
import { ArrowLeft, Loader2 } from 'lucide-react'

type GameState = 'selecting' | 'playing' | 'complete'
type GameMode = 'quick_sort' | 'speed_toss' | 'deep_sort' | 'free_play'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const inventoryId = params.inventoryId as string
  const [gameState, setGameState] = useState<GameState>('selecting')
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [userStats, setUserStats] = useState<any>(null)
  const [sessionStats, setSessionStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [inventoryId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load user stats
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      // Try to load profile (might not exist yet)
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp, level, current_streak, longest_streak, total_decisions, quick_decisions')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserStats(profile)
      }

      // SIMPLE VERSION: Just load ALL items from the inventory
      const { data: inventoryItems, error } = await supabase
        .from('items')
        .select('*')
        .eq('inventory_id', inventoryId)
        .order('created_at', { ascending: false })

      console.log('Simple Game Debug:', {
        inventoryId,
        itemCount: inventoryItems?.length,
        error
      })

      if (error) {
        console.error('Error loading items:', error)
        alert('Error loading items: ' + error.message)
        router.push(`/inventory/${inventoryId}`)
        return
      }

      if (inventoryItems && inventoryItems.length > 0) {
        setItems(inventoryItems)
      } else {
        alert('No items found in this inventory!')
        router.push(`/inventory/${inventoryId}`)
      }
    } catch (error) {
      console.error('Error loading game data:', error)
      alert('Error: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode)
    setGameState('playing')
  }

  const handleSessionComplete = (stats: any) => {
    setSessionStats(stats)
    setGameState('complete')
  }

  const handlePlayAgain = () => {
    setGameState('selecting')
    setSelectedMode(null)
    loadData() // Reload items
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        {gameState === 'selecting' && (
          <>
            {/* Back button */}
            <button
              onClick={() => router.push(`/inventory/${inventoryId}`)}
              className="absolute top-4 left-4 p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Inventory</span>
            </button>
            
            <GameModeSelector
              onSelectMode={handleModeSelect}
              currentLevel={userStats?.level || 1}
              totalXP={userStats?.total_xp || 0}
            />
          </>
        )}

        {gameState === 'playing' && selectedMode && (
          <SwipeMode
            items={items}
            inventoryId={inventoryId}
            gameMode={selectedMode}
            onComplete={() => {
              handleSessionComplete({
                sessionXP: 250,
                totalDecisions: items.length,
                itemsKept: 10,
                itemsTossed: 5,
                maxStreak: 8,
                averageDecisionTime: 2500,
                newLevel: userStats?.level + 1 > (userStats?.level || 1) ? userStats?.level + 1 : undefined,
                unlockedAchievements: []
              })
            }}
          />
        )}

        {gameState === 'complete' && sessionStats && (
          <SessionComplete
            stats={sessionStats}
            gameMode={selectedMode || 'free_play'}
            onPlayAgain={handlePlayAgain}
            inventoryId={inventoryId}
          />
        )}
      </div>
    </GameProvider>
  )
}