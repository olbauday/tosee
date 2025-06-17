'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, Zap, Flame, Package2, Trash2, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface SessionStats {
  sessionXP: number
  totalDecisions: number
  itemsKept: number
  itemsTossed: number
  maxStreak: number
  averageDecisionTime?: number
  newLevel?: number
  unlockedAchievements?: Array<{
    name: string
    description: string
    xpReward: number
  }>
}

interface SessionCompleteProps {
  stats: SessionStats
  gameMode: string
  onPlayAgain: () => void
  inventoryId: string
}

export default function SessionComplete({ stats, gameMode, onPlayAgain, inventoryId }: SessionCompleteProps) {
  const keepPercentage = stats.totalDecisions > 0 
    ? Math.round((stats.itemsKept / stats.totalDecisions) * 100) 
    : 0

  const getRank = (xp: number) => {
    if (xp >= 500) return { rank: 'S', color: 'from-purple-500 to-pink-500' }
    if (xp >= 300) return { rank: 'A', color: 'from-orange-500 to-red-500' }
    if (xp >= 200) return { rank: 'B', color: 'from-yellow-500 to-orange-500' }
    if (xp >= 100) return { rank: 'C', color: 'from-green-500 to-emerald-500' }
    return { rank: 'D', color: 'from-gray-400 to-gray-500' }
  }

  const { rank, color } = getRank(stats.sessionXP)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Session Complete Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center mb-8"
        >
          <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Session Complete!</h1>
          <p className="text-gray-600">Great job on your {gameMode} session</p>
        </motion.div>

        {/* Rank Display */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className={`bg-gradient-to-r ${color} rounded-3xl p-8 text-white text-center shadow-xl`}>
            <p className="text-sm uppercase tracking-wide mb-2">Session Rank</p>
            <div className="text-8xl font-bold mb-4">{rank}</div>
            <div className="flex items-center justify-center gap-2 text-2xl">
              <Star className="w-6 h-6 fill-current" />
              <span className="font-bold">{stats.sessionXP} XP</span>
              <Star className="w-6 h-6 fill-current" />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {/* Total Decisions */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              <span className="text-gray-600">Decisions Made</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalDecisions}</p>
          </div>

          {/* Max Streak */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-6 h-6 text-orange-500" />
              <span className="text-gray-600">Best Streak</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.maxStreak}x</p>
          </div>

          {/* Items Kept */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Package2 className="w-6 h-6 text-green-500" />
              <span className="text-gray-600">Items Kept</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.itemsKept}</p>
          </div>

          {/* Items Tossed */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Trash2 className="w-6 h-6 text-red-500" />
              <span className="text-gray-600">Items Tossed</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.itemsTossed}</p>
          </div>
        </motion.div>

        {/* Keep/Toss Ratio */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Decision Breakdown</h3>
          <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${keepPercentage}%` }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-500"
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-600 font-medium">Keep: {keepPercentage}%</span>
            <span className="text-red-600 font-medium">Toss: {100 - keepPercentage}%</span>
          </div>
        </motion.div>

        {/* Average Decision Time */}
        {stats.averageDecisionTime && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <span className="text-indigo-700 font-medium">Avg Decision Time</span>
                </div>
                <p className="text-2xl font-bold text-indigo-800">
                  {(stats.averageDecisionTime / 1000).toFixed(1)}s
                </p>
              </div>
              {stats.averageDecisionTime < 3000 && (
                <div className="bg-indigo-600 text-white rounded-full px-3 py-1 text-sm font-medium">
                  Speed Bonus!
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* New Level */}
        {stats.newLevel && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.7, type: 'spring' }}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-6 mb-8 text-center text-white shadow-xl"
          >
            <Zap className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-2xl font-bold mb-1">LEVEL UP!</h3>
            <p className="text-4xl font-bold">Level {stats.newLevel}</p>
          </motion.div>
        )}

        {/* Unlocked Achievements */}
        {stats.unlockedAchievements && stats.unlockedAchievements.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <h3 className="font-semibold text-gray-900 mb-4">New Achievements!</h3>
            <div className="space-y-3">
              {stats.unlockedAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-amber-800">{achievement.name}</p>
                    <p className="text-sm text-amber-600">{achievement.description}</p>
                  </div>
                  <div className="bg-amber-500 text-white rounded-full px-3 py-1 text-sm font-bold">
                    +{achievement.xpReward} XP
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="space-y-3"
        >
          <button
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Play Again
          </button>
          
          <Link
            href={`/inventory/${inventoryId}`}
            className="block w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-semibold text-lg hover:border-gray-300 hover:shadow-lg transition-all text-center"
          >
            View Inventory
          </Link>
          
          <Link
            href="/dashboard"
            className="block w-full text-center text-gray-600 py-2 hover:text-gray-900 transition-colors"
          >
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  )
}