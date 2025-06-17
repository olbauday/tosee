'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Zap, TrendingUp, Award, Clock } from 'lucide-react'

interface MomentumDisplayProps {
  streak: number
  combo: number
  sessionXP: number
  decisionsCount: number
  averageTime?: number
  showFullStats?: boolean
}

export default function MomentumDisplay({
  streak,
  combo,
  sessionXP,
  decisionsCount,
  averageTime,
  showFullStats = false
}: MomentumDisplayProps) {
  const getStreakColor = () => {
    if (streak >= 50) return 'from-purple-500 to-pink-500'
    if (streak >= 20) return 'from-orange-500 to-red-500'
    if (streak >= 10) return 'from-yellow-500 to-orange-500'
    if (streak >= 5) return 'from-green-500 to-yellow-500'
    return 'from-gray-400 to-gray-500'
  }

  const getStreakEmoji = () => {
    if (streak >= 50) return '🔥🔥🔥'
    if (streak >= 20) return '🔥🔥'
    if (streak >= 10) return '🔥'
    if (streak >= 5) return '✨'
    return ''
  }

  const getComboLevel = () => {
    if (combo >= 3.0) return 'MEGA'
    if (combo >= 2.5) return 'SUPER'
    if (combo >= 2.0) return 'GREAT'
    if (combo >= 1.5) return 'GOOD'
    return ''
  }

  return (
    <div className="space-y-4">
      {/* Streak Display */}
      <AnimatePresence mode="wait">
        {streak > 0 && (
          <motion.div
            key={streak}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative"
          >
            <div className={`bg-gradient-to-r ${getStreakColor()} rounded-2xl p-4 shadow-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Flame className="w-8 h-8 text-white animate-pulse" />
                  <div>
                    <p className="text-white/80 text-sm font-medium">Decision Streak</p>
                    <p className="text-white text-3xl font-bold">
                      {streak}x {getStreakEmoji()}
                    </p>
                  </div>
                </div>
                {streak >= 5 && (
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="bg-white/20 rounded-full p-3"
                  >
                    <TrendingUp className="w-6 h-6 text-white" />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combo Multiplier */}
      {combo > 1 && (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-amber-100 border-2 border-amber-300 rounded-xl p-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-600" />
              <span className="text-amber-800 font-semibold">
                {getComboLevel()} Combo
              </span>
            </div>
            <span className="text-2xl font-bold text-amber-700">
              {combo.toFixed(1)}x
            </span>
          </div>
        </motion.div>
      )}

      {/* Session Stats */}
      {showFullStats && (
        <div className="grid grid-cols-2 gap-3">
          {/* XP Earned */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl p-4"
          >
            <Award className="w-5 h-5 text-amber-600 mb-1" />
            <p className="text-sm text-amber-700">Session XP</p>
            <p className="text-2xl font-bold text-amber-800">+{sessionXP}</p>
          </motion.div>

          {/* Decisions Made */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-4"
          >
            <TrendingUp className="w-5 h-5 text-blue-600 mb-1" />
            <p className="text-sm text-blue-700">Decisions</p>
            <p className="text-2xl font-bold text-blue-800">{decisionsCount}</p>
          </motion.div>

          {/* Average Time */}
          {averageTime && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 col-span-2"
            >
              <Clock className="w-5 h-5 text-green-600 mb-1" />
              <p className="text-sm text-green-700">Avg Decision Time</p>
              <p className="text-2xl font-bold text-green-800">
                {(averageTime / 1000).toFixed(1)}s
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Bonus Notifications */}
      <AnimatePresence>
        {streak === 5 && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -20 }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-3 text-center shadow-lg"
          >
            <p className="font-bold">🎉 Streak Bonus Unlocked! +10 XP</p>
          </motion.div>
        )}
        {streak === 10 && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -20 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-3 text-center shadow-lg"
          >
            <p className="font-bold">🔥 On Fire! +15 XP Bonus</p>
          </motion.div>
        )}
        {streak === 20 && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -20 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-3 text-center shadow-lg"
          >
            <p className="font-bold">⚡ Lightning Speed! +25 XP Bonus</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}