'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Clock, Brain, Gamepad2, Trophy, Users } from 'lucide-react'

interface GameMode {
  id: 'quick_sort' | 'speed_toss' | 'deep_sort' | 'free_play'
  name: string
  description: string
  duration?: string
  icon: React.ReactNode
  color: string
  benefits: string[]
}

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode['id']) => void
  currentLevel?: number
  totalXP?: number
}

export default function GameModeSelector({ onSelectMode, currentLevel = 1, totalXP = 0 }: GameModeSelectorProps) {
  const gameModes: GameMode[] = [
    {
      id: 'quick_sort',
      name: 'Quick Sort',
      description: '5-minute daily sessions to stay on top of clutter',
      duration: '5 minutes',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-amber-400 to-yellow-500',
      benefits: ['Perfect for daily habits', 'Builds consistency', 'Quick XP gains']
    },
    {
      id: 'speed_toss',
      name: 'Speed Toss',
      description: 'Race against the clock for maximum momentum',
      duration: '2 minutes',
      icon: <Clock className="w-8 h-8" />,
      color: 'from-orange-400 to-red-500',
      benefits: ['High combo potential', 'Intense gameplay', 'Big XP multipliers']
    },
    {
      id: 'deep_sort',
      name: 'Deep Sort',
      description: 'Thoughtful decisions for sentimental items',
      duration: 'No time limit',
      icon: <Brain className="w-8 h-8" />,
      color: 'from-green-400 to-emerald-500',
      benefits: ['No pressure', 'Careful consideration', 'Perfect for tough items']
    },
    {
      id: 'free_play',
      name: 'Free Play',
      description: 'Sort at your own pace with all features',
      duration: 'Unlimited',
      icon: <Gamepad2 className="w-8 h-8" />,
      color: 'from-blue-400 to-indigo-500',
      benefits: ['Full control', 'Practice mode', 'Explore features']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Choose Your Game Mode</h1>
          <p className="text-gray-600">Pick the perfect way to declutter today</p>
          
          {/* Player Stats */}
          <div className="flex justify-center gap-6 mt-6">
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
              <p className="text-sm text-gray-500">Level</p>
              <p className="text-xl font-bold text-amber-600">{currentLevel}</p>
            </div>
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
              <p className="text-sm text-gray-500">Total XP</p>
              <p className="text-xl font-bold text-amber-600">{totalXP.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Game Mode Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {gameModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectMode(mode.id)}
              className="cursor-pointer"
            >
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${mode.color} p-6`}>
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{mode.name}</h3>
                      <p className="text-white/90">{mode.description}</p>
                    </div>
                    {mode.icon}
                  </div>
                  {mode.duration && (
                    <div className="mt-4 inline-flex items-center bg-white/20 backdrop-blur rounded-full px-3 py-1">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">{mode.duration}</span>
                    </div>
                  )}
                </div>

                {/* Benefits */}
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Benefits:</h4>
                  <ul className="space-y-2">
                    {mode.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-gray-600">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Play Button */}
                <div className="px-6 pb-6">
                  <button className={`w-full bg-gradient-to-r ${mode.color} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all`}>
                    Start {mode.name}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Options */}
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3"
          >
            <Trophy className="w-6 h-6 text-amber-500" />
            <span className="font-semibold">View Achievements</span>
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3"
          >
            <Users className="w-6 h-6 text-amber-500" />
            <span className="font-semibold">Leaderboards</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}