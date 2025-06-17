'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, PanInfo, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, Clock, Zap, Flame, Star, Edit3, Check, X } from 'lucide-react'
import { useGame } from '@/lib/game/gameContext'
import Image from 'next/image'

interface SwipeModeProps {
  items: Array<{
    id: string
    name: string
    notes?: string
    image_url?: string
    category?: string
    location?: string
  }>
  inventoryId: string
  gameMode: 'quick_sort' | 'speed_toss' | 'deep_sort' | 'free_play'
  onComplete?: () => void
}

export default function SwipeMode({ items, inventoryId, gameMode, onComplete }: SwipeModeProps) {
  const { state, startSession, endSession, makeDecision } = useGame()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [decisionStartTime, setDecisionStartTime] = useState(Date.now())
  const [showDecisionFeedback, setShowDecisionFeedback] = useState<'keep' | 'toss' | null>(null)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedDescription, setEditedDescription] = useState('')
  const [localItems, setLocalItems] = useState(items)
  const controls = useAnimation()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const currentItem = localItems[currentIndex]
  const progress = ((currentIndex + 1) / localItems.length) * 100
  const isLastItem = currentIndex === localItems.length - 1

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      await startSession(gameMode, inventoryId, localItems.map(item => item.id))
      setDecisionStartTime(Date.now())
    }
    initSession()

    return () => {
      endSession()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Timer for timed modes
  useEffect(() => {
    if (state.currentSession?.timeRemaining && state.currentSession.timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        // Update time every second
        // In a real app, you'd dispatch an action to update timeRemaining
      }, 1000)
    }
  }, [state.currentSession?.timeRemaining])

  const handleSwipe = async (direction: 'left' | 'right', velocity: number = 0) => {
    const decision = direction === 'right' ? 'keep' : 'toss'
    const decisionTime = Date.now() - decisionStartTime
    
    // Show feedback
    setShowDecisionFeedback(decision)
    
    // Animate card off screen
    await controls.start({
      x: direction === 'right' ? 1000 : -1000,
      rotate: direction === 'right' ? 30 : -30,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    })

    // Record decision
    await makeDecision(currentItem.id, decision, decisionTime)

    // Move to next item or complete
    console.log('Decision made. Current index:', currentIndex, 'Total items:', localItems.length, 'Is last?', isLastItem)
    
    if (!isLastItem) {
      setCurrentIndex(currentIndex + 1)
      setDecisionStartTime(Date.now())
      setShowDecisionFeedback(null)
      
      // Reset card position
      controls.set({ x: 0, rotate: 0, opacity: 1 })
    } else {
      // Session complete
      console.log('Session complete! Ending session...')
      await endSession()
      console.log('Session ended, calling onComplete')
      if (onComplete) {
        onComplete()
      } else {
        console.error('No onComplete callback provided!')
      }
    }
  }

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const threshold = 100
    const swipeVelocity = 500

    if (Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > swipeVelocity) {
      const direction = info.offset.x > 0 ? 'right' : 'left'
      await handleSwipe(direction, info.velocity.x)
    } else {
      // Snap back to center
      controls.start({ x: 0, rotate: 0 })
    }
  }

  const handleButtonDecision = async (decision: 'keep' | 'toss') => {
    const direction = decision === 'keep' ? 'right' : 'left'
    await handleSwipe(direction)
  }

  return (
    <div className="relative h-screen bg-gradient-to-b from-amber-50 to-white overflow-hidden">
      {/* Header with stats */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20">
        <div className="max-w-lg mx-auto">
          {/* Progress bar */}
          <div className="bg-white/80 backdrop-blur rounded-full p-2 mb-4">
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-400 to-yellow-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-center text-sm mt-1 text-gray-600">
              {currentIndex + 1} of {localItems.length} items
            </p>
          </div>

          {/* Game stats */}
          <div className="flex justify-around items-center bg-white/80 backdrop-blur rounded-2xl p-3">
            {/* Streak */}
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Flame className={`w-5 h-5 ${
                  state.currentSession?.currentStreak && state.currentSession.currentStreak > 0
                    ? 'text-orange-500'
                    : 'text-gray-400'
                }`} />
                <span className="font-bold text-lg">
                  {state.currentSession?.currentStreak || 0}
                </span>
              </div>
              <p className="text-xs text-gray-600">Streak</p>
            </div>

            {/* XP */}
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-lg">
                  {state.currentSession?.sessionXP || 0}
                </span>
              </div>
              <p className="text-xs text-gray-600">XP</p>
            </div>

            {/* Combo */}
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="font-bold text-lg">
                  {state.currentSession?.comboMultiplier.toFixed(1) || '1.0'}x
                </span>
              </div>
              <p className="text-xs text-gray-600">Combo</p>
            </div>

            {/* Timer (for timed modes) */}
            {state.currentSession?.timeRemaining !== undefined && (
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="font-bold text-lg">
                    {Math.floor(state.currentSession.timeRemaining / 60)}:
                    {(state.currentSession.timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Time</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Swipe indicators */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full px-8 flex justify-between pointer-events-none z-10">
        <div className={`bg-red-500/20 backdrop-blur rounded-full p-8 transition-opacity ${
          showDecisionFeedback === 'toss' ? 'opacity-100' : 'opacity-0'
        }`}>
          <Trash2 className="w-12 h-12 text-red-600" />
        </div>
        <div className={`bg-green-500/20 backdrop-blur rounded-full p-8 transition-opacity ${
          showDecisionFeedback === 'keep' ? 'opacity-100' : 'opacity-0'
        }`}>
          <Heart className="w-12 h-12 text-green-600" />
        </div>
      </div>

      {/* Card stack */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <AnimatePresence>
          {currentItem && (
            <motion.div
              key={currentItem.id}
              className="relative w-full max-w-md"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              animate={controls}
              whileDrag={{ scale: 0.95 }}
              style={{
                rotate: 0,
                cursor: 'grab',
              }}
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Item image */}
                <div className="relative h-96 bg-gray-100">
                  {currentItem.image_url ? (
                    <>
                      {console.log('Trying to load image:', currentItem.image_url)}
                      <img
                        src={currentItem.image_url}
                        alt={currentItem.name}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log('Image loaded successfully:', currentItem.image_url)}
                        onError={(e) => {
                          console.error('Image failed to load:', currentItem.image_url)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-gray-400">
                        <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  
                  {/* Quick decision indicators */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-500/50 to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0 }}
                    drag={false}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-l from-green-500/50 to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0 }}
                    drag={false}
                  />
                </div>

                {/* Item details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-2xl font-bold">{currentItem.name}</h3>
                    {!isEditingDescription && (
                      <button
                        onClick={() => {
                          setIsEditingDescription(true)
                          setEditedDescription(currentItem.notes || '')
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                  
                  {isEditingDescription ? (
                    <div className="mb-4">
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        rows={3}
                        placeholder="Add notes or description..."
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={async () => {
                            // Update the local item
                            const updatedItems = [...localItems]
                            updatedItems[currentIndex] = {
                              ...currentItem,
                              notes: editedDescription
                            }
                            setLocalItems(updatedItems)
                            setIsEditingDescription(false)
                            
                            // Save to database
                            try {
                              await fetch(`/api/items/${currentItem.id}/notes`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ notes: editedDescription })
                              })
                            } catch (error) {
                              console.error('Failed to save notes:', error)
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingDescription(false)
                            setEditedDescription('')
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 mb-4">
                      {currentItem.notes || <span className="text-gray-400 italic">No notes. Tap edit to add notes.</span>}
                    </p>
                  )}
                  
                  {currentItem.category && (
                    <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                      {currentItem.category}
                    </span>
                  )}
                </div>

                {/* Decision buttons */}
                <div className="flex gap-4 p-6 pt-0">
                  <button
                    onClick={() => handleButtonDecision('toss')}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    Toss
                  </button>
                  <button
                    onClick={() => handleButtonDecision('keep')}
                    className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    Keep
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hint text */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-gray-500 text-sm">
          Swipe or tap to decide • Quick decisions earn bonus XP!
        </p>
      </div>
    </div>
  )
}