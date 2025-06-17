'use client'

import { GameProvider } from '@/lib/game/gameContext'
import GameContent from './game-content'

export default function GamePage() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  )
}