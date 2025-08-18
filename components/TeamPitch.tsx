'use client'

import { Player } from '@/lib/types/fpl'
import { PlayerScore } from '@/lib/score-calculator'
import { cn } from '@/lib/utils'
import { Star, ArrowDownUp, Activity, TrendingUp } from 'lucide-react'

interface TeamPitchProps {
  players: PlayerScore[]
  allPlayers: Player[]
  formation: string
  substitutions?: Array<{
    playerOut: number
    playerIn: number
    reason: string
  }>
}

export default function TeamPitch({ 
  players, 
  allPlayers, 
  formation,
  substitutions = []
}: TeamPitchProps) {
  const [def, mid, fwd] = formation.split('-').map(Number)
  
  const getPlayerData = (playerId: number) => {
    const player = allPlayers.find(p => p.id === playerId)
    const score = players.find(p => p.playerId === playerId)
    const wasSubbed = substitutions.some(s => s.playerOut === playerId)
    const wasSubbedIn = substitutions.some(s => s.playerIn === playerId)
    return { player, score, wasSubbed, wasSubbedIn }
  }

  const renderPlayer = (playerId: number, position: 'GK' | 'DEF' | 'MID' | 'FWD', isOnPitch: boolean = true) => {
    const { player, score, wasSubbed, wasSubbedIn } = getPlayerData(playerId)
    if (!player || !score) return null

    const positionColors = {
      GK: 'from-yellow-500 to-amber-600',
      DEF: 'from-emerald-500 to-green-600',
      MID: 'from-blue-500 to-indigo-600',
      FWD: 'from-red-500 to-rose-600'
    }

    const positionGlow = {
      GK: 'shadow-yellow-500/50',
      DEF: 'shadow-emerald-500/50',
      MID: 'shadow-blue-500/50',
      FWD: 'shadow-red-500/50'
    }

    if (!isOnPitch) {
      // Bench player styling
      return (
        <div className="group relative">
          <div className={cn(
            "relative transition-all duration-300",
            wasSubbedIn && "scale-110"
          )}>
            <div className={cn(
              "w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all",
              wasSubbedIn ? positionColors[position] : "from-gray-600 to-gray-700",
              wasSubbedIn && "ring-2 ring-pl-green ring-offset-2 ring-offset-transparent animate-pulse"
            )}>
              <span className="text-[10px] md:text-xs font-bold text-white text-center px-1">
                {player.web_name.split(' ').pop()}
              </span>
            </div>
            <div className={cn(
              "mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-center",
              score.totalPoints > 0 ? "bg-pl-green text-black" : "bg-gray-700 text-gray-300"
            )}>
              {score.totalPoints}
            </div>
            {wasSubbedIn && (
              <div className="absolute -top-2 -right-2">
                <ArrowDownUp className="w-4 h-4 text-pl-green animate-bounce" />
              </div>
            )}
          </div>
        </div>
      )
    }

    // Starting XI player styling
    return (
      <div className="group relative">
        <div className={cn(
          "relative transition-all duration-300 hover:scale-110",
          wasSubbed && "opacity-60 scale-95"
        )}>
          {/* Player card */}
          <div className={cn(
            "relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center",
            positionColors[position],
            "shadow-lg group-hover:shadow-2xl",
            positionGlow[position],
            wasSubbedIn && "ring-2 ring-pl-green ring-offset-2 ring-offset-transparent animate-pulse"
          )}>
            {/* Player name */}
            <span className="text-xs md:text-sm font-bold text-white text-center px-1">
              {player.web_name.split(' ').pop()}
            </span>
            
            {/* Captain/Vice Captain badge */}
            {score.isCaptain && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-pl-purple to-pl-pink rounded-full flex items-center justify-center shadow-lg animate-float">
                <span className="text-[10px] font-black text-white">C</span>
              </div>
            )}
            {score.isViceCaptain && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-[10px] font-black text-white">V</span>
              </div>
            )}
            
            {/* Live indicator */}
            {score.minutes > 0 && score.minutes < 90 && (
              <div className="absolute -bottom-1 -right-1">
                <Activity className="w-4 h-4 text-pl-green animate-pulse" />
              </div>
            )}
          </div>
          
          {/* Points badge */}
          <div className={cn(
            "mt-2 px-3 py-1 rounded-full text-xs font-bold transition-all",
            score.totalPoints > 0 
              ? "bg-gradient-to-r from-pl-green to-emerald-400 text-black shadow-lg" 
              : "bg-gray-800/80 text-gray-400"
          )}>
            {score.totalPoints} pts
          </div>
          
          {/* Minutes played */}
          {score.minutes > 0 && (
            <div className="text-[10px] text-white/60 text-center mt-1">
              {score.minutes}'
            </div>
          )}
          
          {/* Performance indicator */}
          {score.totalPoints >= 10 && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Star className="w-5 h-5 text-pl-yellow animate-pulse" />
            </div>
          )}
        </div>
      </div>
    )
  }

  const startingXI = players.filter(p => p.position <= 11)
  const bench = players.filter(p => p.position > 11).sort((a, b) => a.position - b.position)

  const goalkeeper = startingXI.find(p => p.elementType === 1)
  const defenders = startingXI.filter(p => p.elementType === 2)
  const midfielders = startingXI.filter(p => p.elementType === 3)
  const forwards = startingXI.filter(p => p.elementType === 4)

  return (
    <div className="w-full">
      {/* Main Pitch */}
      <div className="glass-card rounded-3xl p-4 md:p-8 relative overflow-hidden">
        {/* Pitch background with realistic grass pattern */}
        <div 
          className="absolute inset-0 rounded-3xl pitch-pattern opacity-80"
        />
        
        {/* Pitch markings */}
        <div className="absolute inset-x-8 top-8 bottom-8 border-2 border-white/20 rounded-lg" />
        <div className="absolute inset-x-8 top-1/2 h-0.5 bg-white/20" />
        <div className="absolute left-1/2 top-8 bottom-8 w-0.5 bg-white/20" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white/20 rounded-full" />
        
        <div className="relative z-10 space-y-6 md:space-y-8 py-4">
          {/* Goalkeeper */}
          <div className="flex justify-center">
            {goalkeeper && renderPlayer(goalkeeper.playerId, 'GK')}
          </div>

          {/* Defenders */}
          <div className={cn(
            "flex justify-center",
            def === 5 ? "gap-3 md:gap-4" : "gap-4 md:gap-8"
          )}>
            {defenders.map(player => (
              <div key={player.playerId}>
                {renderPlayer(player.playerId, 'DEF')}
              </div>
            ))}
          </div>

          {/* Midfielders */}
          <div className={cn(
            "flex justify-center",
            mid === 5 ? "gap-3 md:gap-4" : "gap-4 md:gap-8"
          )}>
            {midfielders.map(player => (
              <div key={player.playerId}>
                {renderPlayer(player.playerId, 'MID')}
              </div>
            ))}
          </div>

          {/* Forwards */}
          <div className="flex justify-center gap-4 md:gap-8">
            {forwards.map(player => (
              <div key={player.playerId}>
                {renderPlayer(player.playerId, 'FWD')}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bench Section */}
      <div className="mt-4 glass-dark rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-white/60" />
          <h3 className="text-sm font-bold text-white/80">SUBSTITUTES</h3>
        </div>
        <div className="flex justify-center gap-4">
          {bench.map((player) => {
            const playerData = allPlayers.find(p => p.id === player.playerId)
            if (!playerData) return null
            
            const position = playerData.element_type === 1 ? 'GK' :
                           playerData.element_type === 2 ? 'DEF' :
                           playerData.element_type === 3 ? 'MID' : 'FWD'
            
            return (
              <div key={player.playerId}>
                {renderPlayer(player.playerId, position, false)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}