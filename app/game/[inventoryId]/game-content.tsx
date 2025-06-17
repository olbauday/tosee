'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useGame } from '@/lib/game/gameContext'
import GameModeSelector from '@/components/game/GameModeSelector'
import SwipeMode from '@/components/game/SwipeMode'
import SessionComplete from '@/components/game/SessionComplete'
import { ArrowLeft, Loader2 } from 'lucide-react'

type GameState = 'selecting' | 'playing' | 'complete'
type GameMode = 'quick_sort' | 'speed_toss' | 'deep_sort' | 'free_play'

export default function GameContent() {
  const params = useParams()
  const router = useRouter()
  const { state } = useGame()
  const inventoryId = params.inventoryId as string
  const [gameState, setGameState] = useState<GameState>('selecting')
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [items, setItems] = useState<any[]>([])
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

      // Load items through simplified API to avoid RLS issues
      const response = await fetch(`/api/game/items-simple/${inventoryId}`)
      const data = await response.json()
      
      console.log('Game Debug:', {
        inventoryId,
        itemCount: data.items?.length,
        response: data
      })

      if (!response.ok) {
        console.error('Error loading items:', data.error)
        alert('Error loading items: ' + (data.error || 'Unknown error'))
        router.push(`/inventory/${inventoryId}`)
        return
      }

      if (data.items && data.items.length > 0) {
        console.log('Items loaded:', data.items)
        console.log('First item details:', {
          name: data.items[0]?.name,
          photo_url: data.items[0]?.photo_url,
          description: data.items[0]?.description
        })
        setItems(data.items)
      } else {
        // No items to sort
        alert('No items to sort in this inventory! All items have been decided.')
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

  const handleSessionComplete = () => {
    console.log('handleSessionComplete called')
    console.log('Current session state:', state.currentSession)
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {gameState === 'selecting' && (
        <>
          <button
            onClick={() => router.push(`/inventory/${inventoryId}`)}
            className="absolute top-4 left-4 p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Inventory</span>
          </button>
          
          <GameModeSelector
            onSelectMode={handleModeSelect}
            currentLevel={state.userStats.level}
            totalXP={state.userStats.totalXP}
          />
        </>
      )}

      {gameState === 'playing' && selectedMode && (
        <SwipeMode
          items={items}
          inventoryId={inventoryId}
          gameMode={selectedMode}
          onComplete={handleSessionComplete}
        />
      )}

      {gameState === 'complete' && (
        <>
          {console.log('Rendering complete screen, session:', state.currentSession)}
          {state.currentSession ? (
            <SessionComplete
              stats={{
                sessionXP: state.currentSession.sessionXP,
                totalDecisions: state.currentSession.itemsDecided,
                itemsKept: state.currentSession.itemsKept,
                itemsTossed: state.currentSession.itemsTossed,
                maxStreak: state.currentSession.maxStreak,
                averageDecisionTime: state.currentSession.lastDecisionTime,
                newLevel: state.userStats.level,
                unlockedAchievements: []
              }}
              gameMode={selectedMode || 'free_play'}
              onPlayAgain={handlePlayAgain}
              inventoryId={inventoryId}
            />
          ) : (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Session Complete!</h2>
                <p className="text-gray-600 mb-4">No session data available</p>
                <button
                  onClick={handlePlayAgain}
                  className="bg-amber-500 text-white px-6 py-3 rounded-lg"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}