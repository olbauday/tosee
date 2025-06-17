'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Zap, Flame, TrendingUp, Award, Lock, CheckCircle } from 'lucide-react'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  category: string
  requirementType: string
  requirementValue: number
  unlockedAt?: Date
}

interface UserProgress {
  level: number
  totalXP: number
  nextLevelXP: number
  totalDecisions: number
  longestStreak: number
  quickDecisions: number
}

interface AchievementsDisplayProps {
  achievements: Achievement[]
  userProgress: UserProgress
  unlockedAchievementIds: string[]
}

export default function AchievementsDisplay({ 
  achievements, 
  userProgress, 
  unlockedAchievementIds 
}: AchievementsDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'speed', name: 'Speed', icon: Zap },
    { id: 'streak', name: 'Streaks', icon: Flame },
    { id: 'volume', name: 'Volume', icon: TrendingUp },
    { id: 'special', name: 'Special', icon: Star }
  ]

  const getProgressTowardsAchievement = (achievement: Achievement): number => {
    switch (achievement.requirementType) {
      case 'decisions':
        return Math.min((userProgress.totalDecisions / achievement.requirementValue) * 100, 100)
      case 'streak':
        return Math.min((userProgress.longestStreak / achievement.requirementValue) * 100, 100)
      case 'xp':
        return Math.min((userProgress.totalXP / achievement.requirementValue) * 100, 100)
      default:
        return 0
    }
  }

  const getAchievementIcon = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'zap': <Zap className="w-6 h-6" />,
      'bolt': <Zap className="w-6 h-6" />,
      'flash': <Zap className="w-6 h-6" />,
      'fire': <Flame className="w-6 h-6" />,
      'flame': <Flame className="w-6 h-6" />,
      'rocket': '🚀',
      'star': <Star className="w-6 h-6" />,
      'award': <Award className="w-6 h-6" />,
      'crown': '👑',
      'scale': '⚖️',
      'package': '📦',
      'heart': '❤️'
    }
    return icons[iconName] || <Trophy className="w-6 h-6" />
  }

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory)

  const unlockedCount = unlockedAchievementIds.length
  const totalCount = achievements.length
  const progressPercentage = (unlockedCount / totalCount) * 100

  // Calculate XP to next level
  const currentLevelXP = [0, 50, 150, 350, 600, 1000, 1500, 2500, 5000, 10000]
  const currentLevelThreshold = currentLevelXP[userProgress.level - 1] || 0
  const nextLevelThreshold = currentLevelXP[userProgress.level] || 10000
  const xpInCurrentLevel = userProgress.totalXP - currentLevelThreshold
  const xpNeededForLevel = nextLevelThreshold - currentLevelThreshold
  const levelProgress = (xpInCurrentLevel / xpNeededForLevel) * 100

  return (
    <div className="space-y-8">
      {/* Level Progress */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-3xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">Current Level</p>
            <p className="text-4xl font-bold">Level {userProgress.level}</p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">Total XP</p>
            <p className="text-2xl font-bold">{userProgress.totalXP.toLocaleString()}</p>
          </div>
        </div>
        
        {/* Level Progress Bar */}
        <div className="bg-white/20 rounded-full h-4 overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-white/80 rounded-full"
          />
        </div>
        <p className="text-sm text-white/80">
          {xpInCurrentLevel} / {xpNeededForLevel} XP to Level {userProgress.level + 1}
        </p>
      </motion.div>

      {/* Achievement Progress Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Achievement Progress</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Unlocked</span>
          <span className="font-bold text-amber-600">{unlockedCount} / {totalCount}</span>
        </div>
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <category.icon className="w-5 h-5" />
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredAchievements.map((achievement, index) => {
            const isUnlocked = unlockedAchievementIds.includes(achievement.id)
            const progress = getProgressTowardsAchievement(achievement)

            return (
              <motion.div
                key={achievement.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                className={`relative overflow-hidden rounded-2xl shadow-md transition-all ${
                  isUnlocked 
                    ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300' 
                    : 'bg-white hover:shadow-lg'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      isUnlocked
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {getAchievementIcon(achievement.icon)}
                    </div>
                    
                    {isUnlocked ? (
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Unlocked</span>
                      </div>
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  <h4 className={`font-bold text-lg mb-1 ${
                    isUnlocked ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {achievement.name}
                  </h4>
                  
                  <p className={`text-sm mb-3 ${
                    isUnlocked ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isUnlocked
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      +{achievement.xpReward} XP
                    </div>

                    {!isUnlocked && progress > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {isUnlocked && achievement.unlockedAt && (
                    <p className="text-xs text-amber-600 mt-2">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Decorative element for unlocked achievements */}
                {isUnlocked && (
                  <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full blur-2xl opacity-50" />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}