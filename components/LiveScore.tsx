'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Trophy, Users, ArrowUp, ArrowDown, Zap, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LiveScoreProps {
  score: number
  previousScore?: number
  overallRank?: number
  previousRank?: number
  transferCost?: number
  isLive?: boolean
  lastUpdated?: Date
}

export default function LiveScore({
  score,
  previousScore = 0,
  overallRank,
  previousRank,
  transferCost = 0,
  isLive = false,
  lastUpdated
}: LiveScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(previousScore)
  const [showPulse, setShowPulse] = useState(false)
  const scoreChange = score - previousScore
  const rankChange = previousRank && overallRank ? previousRank - overallRank : 0

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = (score - animatedScore) / steps
    let current = 0

    const timer = setInterval(() => {
      current++
      if (current <= steps) {
        setAnimatedScore(prev => {
          const next = prev + increment
          return current === steps ? score : next
        })
      } else {
        setAnimatedScore(score)
        clearInterval(timer)
        setShowPulse(true)
        setTimeout(() => setShowPulse(false), 1000)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  const formatRank = (rank: number) => {
    if (rank > 1000000) return `${(rank / 1000000).toFixed(1)}M`
    if (rank > 1000) return `${(rank / 1000).toFixed(1)}K`
    return rank.toString()
  }

  return (
    <div className="glass-card rounded-3xl p-6 hover-lift relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pl-purple/20 via-transparent to-pl-green/20 animate-pulse" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-pl-green" />
            Live Score
          </h2>
          {isLive && (
            <div className="badge-live">
              <Activity className="w-3 h-3" />
              LIVE
            </div>
          )}
        </div>

        {/* Main Score Display */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className={cn(
              "text-7xl font-black bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent transition-all duration-300",
              showPulse && "animate-pulse"
            )}>
              {Math.floor(animatedScore)}
            </div>
            {scoreChange !== 0 && (
              <div className={cn(
                "absolute -right-12 top-0 flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full",
                scoreChange > 0 ? "bg-pl-green/20 text-pl-green" : "bg-red-500/20 text-red-400"
              )}>
                {scoreChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {scoreChange > 0 ? '+' : ''}{scoreChange}
              </div>
            )}
          </div>
          
          <div className="mt-2 text-white/60 text-sm">
            Points this gameweek
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Overall Rank Card */}
          {overallRank && (
            <div className="glass-dark rounded-2xl p-4 hover:bg-white/10 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-pl-yellow" />
                    <span className="text-xs text-white/60">Overall Rank</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatRank(overallRank)}
                  </div>
                </div>
                {rankChange !== 0 && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                    rankChange > 0 ? "bg-pl-green/20 text-pl-green" : "bg-red-500/20 text-red-400"
                  )}>
                    {rankChange > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(rankChange)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transfer Cost Card */}
          {transferCost > 0 && (
            <div className="glass-dark rounded-2xl p-4 hover:bg-white/10 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-white/60">Transfer Cost</span>
                  </div>
                  <div className="text-2xl font-bold text-red-400">
                    -{transferCost}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-xs text-white/40">
              <div className="w-1 h-1 bg-pl-green rounded-full animate-pulse" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}