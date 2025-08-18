'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, Trophy, Loader2, Crown, Medal, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeagueEntry {
  rank: number
  lastRank: number
  entry: number
  entryName: string
  playerName: string
  eventTotal: number
  total: number
  liveScore?: number
  isCurrentUser?: boolean
}

interface LeagueTableProps {
  leagueName: string
  entries: LeagueEntry[]
  isLoading?: boolean
  performanceMode?: boolean
  currentUserId?: number
}

export default function LeagueTable({
  leagueName,
  entries,
  isLoading = false,
  performanceMode = false,
  currentUserId
}: LeagueTableProps) {
  const [sortedEntries, setSortedEntries] = useState<LeagueEntry[]>([])

  useEffect(() => {
    const sorted = [...entries].sort((a, b) => {
      if (performanceMode) {
        return b.total - a.total
      }
      const aTotal = a.total + (a.liveScore || a.eventTotal)
      const bTotal = b.total + (b.liveScore || b.eventTotal)
      return bTotal - aTotal
    })
    setSortedEntries(sorted)
  }, [entries, performanceMode])

  const getRankChange = (current: number, last: number) => {
    if (last === 0) return { icon: null, text: 'NEW', color: 'text-pl-cyan' }
    const change = last - current
    if (change > 0) return { icon: <TrendingUp className="w-3 h-3" />, text: `+${change}`, color: 'text-pl-green' }
    if (change < 0) return { icon: <TrendingDown className="w-3 h-3" />, text: `${change}`, color: 'text-red-400' }
    return { icon: <Minus className="w-3 h-3" />, text: '-', color: 'text-gray-500' }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-pl-yellow animate-pulse" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />
    if (rank === 3) return <Award className="w-5 h-5 text-orange-500" />
    return null
  }

  if (isLoading) {
    return (
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-pl-green mx-auto mb-4" />
            <p className="text-white/60">Loading league data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pl-purple to-pl-pink flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">{leagueName}</h2>
          </div>
          {performanceMode && (
            <div className="badge-live">
              Performance Mode
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-xs font-medium text-white/60 uppercase tracking-wider">Rank</th>
              <th className="text-left p-4 text-xs font-medium text-white/60 uppercase tracking-wider">Team</th>
              <th className="text-center p-4 text-xs font-medium text-white/60 uppercase tracking-wider hidden sm:table-cell">GW</th>
              <th className="text-center p-4 text-xs font-medium text-white/60 uppercase tracking-wider">Total</th>
              <th className="text-center p-4 text-xs font-medium text-white/60 uppercase tracking-wider hidden sm:table-cell">Change</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry, index) => {
              const rankChange = getRankChange(index + 1, entry.lastRank)
              const isUser = currentUserId === entry.entry || entry.isCurrentUser
              const gwScore = entry.liveScore || entry.eventTotal
              const projectedTotal = performanceMode ? entry.total : entry.total + gwScore

              return (
                <tr
                  key={entry.entry}
                  className={cn(
                    "border-b border-white/5 transition-all hover:bg-white/5",
                    isUser && "bg-gradient-to-r from-pl-purple/10 to-pl-pink/10"
                  )}
                >
                  {/* Rank */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-lg font-bold",
                        isUser ? "text-pl-green" : "text-white"
                      )}>
                        {index + 1}
                      </span>
                      {getRankIcon(index + 1)}
                    </div>
                  </td>

                  {/* Team */}
                  <td className="p-4">
                    <div>
                      <div className={cn(
                        "font-medium",
                        isUser ? "text-pl-green" : "text-white"
                      )}>
                        {entry.entryName}
                      </div>
                      <div className="text-xs text-white/40">
                        {entry.playerName}
                      </div>
                    </div>
                  </td>

                  {/* GW Score */}
                  <td className="p-4 text-center hidden sm:table-cell">
                    <span className={cn(
                      "inline-flex px-3 py-1 rounded-full text-sm font-bold",
                      gwScore > 60 
                        ? "bg-pl-green/20 text-pl-green" 
                        : gwScore > 40 
                        ? "bg-white/10 text-white"
                        : "bg-red-500/20 text-red-400"
                    )}>
                      {gwScore}
                    </span>
                  </td>

                  {/* Total */}
                  <td className="p-4 text-center">
                    <div className="text-xl font-bold text-white">
                      {projectedTotal}
                    </div>
                    <div className="text-xs text-white/40 sm:hidden">
                      GW: {gwScore}
                    </div>
                  </td>

                  {/* Change */}
                  <td className="p-4 text-center hidden sm:table-cell">
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                      rankChange.color === 'text-pl-green' && "bg-pl-green/20",
                      rankChange.color === 'text-red-400' && "bg-red-500/20",
                      rankChange.color === 'text-pl-cyan' && "bg-pl-cyan/20",
                      rankChange.color === 'text-gray-500' && "bg-gray-500/20",
                      rankChange.color
                    )}>
                      {rankChange.icon}
                      <span>{rankChange.text}</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer for large leagues */}
      {entries.length > 50 && performanceMode && (
        <div className="p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-t border-white/10">
          <p className="text-center text-xs text-white/60">
            Performance mode active for large league. Live scores not calculated for optimal performance.
          </p>
        </div>
      )}
    </div>
  )
}