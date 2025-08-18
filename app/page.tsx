'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import LiveScore from '@/components/LiveScore'
import TeamPitch from '@/components/TeamPitch'
import LeagueTable from '@/components/LeagueTable'
import { FPLApi } from '@/lib/fpl-api'
import { ScoreCalculator } from '@/lib/score-calculator'
import { AutoSubstitution } from '@/lib/auto-subs'
import { CacheService } from '@/lib/cache'
import { BootstrapStatic, ManagerInfo, ManagerPicks, Live, Fixture, LeagueStandings } from '@/lib/types/fpl'
import { Loader2, Settings, Sparkles, Trophy, Users, BarChart3 } from 'lucide-react'

const api = new FPLApi()
const cache = CacheService.getInstance()

export default function Home() {
  const [managerId, setManagerId] = useState<number | null>(null)
  const [inputId, setInputId] = useState('')
  const [autoSubs, setAutoSubs] = useState(true)
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null)

  // Load manager ID from localStorage
  useEffect(() => {
    const savedId = localStorage.getItem('fpl_manager_id')
    if (savedId) {
      setManagerId(parseInt(savedId))
      setInputId(savedId)
    }
  }, [])

  // Fetch bootstrap data
  const { data: bootstrap } = useQuery<BootstrapStatic>({
    queryKey: ['bootstrap'],
    queryFn: async (): Promise<BootstrapStatic> => {
      const cached = await cache.get<BootstrapStatic>(CacheService.getBootstrapKey())
      if (cached) return cached
      const data = await api.getBootstrapStatic()
      await cache.set(CacheService.getBootstrapKey(), data, 900)
      return data
    },
    staleTime: 15 * 60 * 1000,
  })

  // Get current gameweek
  const currentGW = bootstrap?.events.find(e => e.is_current)?.id || 1

  // Fetch manager data
  const { data: managerInfo, isLoading: managerLoading } = useQuery<ManagerInfo | null>({
    queryKey: ['manager', managerId],
    queryFn: async (): Promise<ManagerInfo | null> => {
      if (!managerId) return null
      const cached = await cache.get<ManagerInfo>(CacheService.getManagerKey(managerId))
      if (cached) return cached
      const data = await api.getManagerInfo(managerId)
      await cache.set(CacheService.getManagerKey(managerId), data, 300)
      return data
    },
    enabled: !!managerId,
  })

  // Fetch manager picks
  const { data: picks } = useQuery<ManagerPicks | null>({
    queryKey: ['picks', managerId, currentGW],
    queryFn: async (): Promise<ManagerPicks | null> => {
      if (!managerId) return null
      const cached = await cache.get<ManagerPicks>(CacheService.getManagerPicksKey(managerId, currentGW))
      if (cached) return cached
      const data = await api.getManagerPicks(managerId, currentGW)
      await cache.set(CacheService.getManagerPicksKey(managerId, currentGW), data, 120)
      return data
    },
    enabled: !!managerId && !!currentGW,
  })

  // Fetch live data
  const { data: liveData } = useQuery<Live>({
    queryKey: ['live', currentGW],
    queryFn: async (): Promise<Live> => {
      const cached = await cache.get<Live>(CacheService.getLiveKey(currentGW))
      if (cached) return cached
      const data = await api.getLive(currentGW)
      await cache.set(CacheService.getLiveKey(currentGW), data, 60)
      return data
    },
    enabled: !!currentGW,
    refetchInterval: 60 * 1000,
  })

  // Fetch fixtures
  const { data: fixtures } = useQuery<Fixture[]>({
    queryKey: ['fixtures', currentGW],
    queryFn: async (): Promise<Fixture[]> => {
      const cached = await cache.get<Fixture[]>(CacheService.getFixturesKey(currentGW))
      if (cached) return cached
      const data = await api.getFixtures(currentGW)
      await cache.set(CacheService.getFixturesKey(currentGW), data, 120)
      return data
    },
    enabled: !!currentGW,
    refetchInterval: 2 * 60 * 1000,
  })

  // Fetch league data
  const { data: leagueData, isLoading: leagueLoading } = useQuery<LeagueStandings | null>({
    queryKey: ['league', selectedLeague],
    queryFn: async (): Promise<LeagueStandings | null> => {
      if (!selectedLeague) return null
      const cached = await cache.get<LeagueStandings>(CacheService.getLeagueKey(selectedLeague))
      if (cached) return cached
      const data = await api.getLeagueStandings(selectedLeague)
      await cache.set(CacheService.getLeagueKey(selectedLeague), data, 120)
      return data
    },
    enabled: !!selectedLeague,
    refetchInterval: 2 * 60 * 1000,
  })

  // Calculate team score
  const teamScore = picks && bootstrap && liveData && fixtures
    ? (() => {
        const calculator = new ScoreCalculator(bootstrap.elements, liveData.elements, fixtures)
        const autoSubEngine = new AutoSubstitution(bootstrap.elements, liveData.elements, fixtures)
        
        const subResult = autoSubEngine.processAutoSubstitutions(picks.picks, autoSubs)
        const score = calculator.calculateTeamScore(
          subResult.substitutedPicks,
          picks.entry_history.event_transfers_cost,
          picks.active_chip
        )
        
        return {
          ...score,
          substitutions: subResult.substitutions,
        }
      })()
    : null

  const handleSetManagerId = () => {
    const id = parseInt(inputId)
    if (id) {
      setManagerId(id)
      localStorage.setItem('fpl_manager_id', inputId)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 gradient-mesh" />
      <div className="fixed inset-0 gradient-vibrant opacity-20 animate-pulse" />
      <div className="fixed inset-0 noise-texture" />
      
      {/* Floating orbs */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-pl-green/20 rounded-full blur-3xl animate-float" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-pl-pink/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      
      <div className="relative z-10 container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block">
            <h1 className="text-6xl md:text-8xl font-black text-gradient mb-2 animate-float">
              FPL LIVE
            </h1>
            <div className="flex items-center justify-center gap-2 text-white/80">
              <Sparkles className="w-5 h-5" />
              <p className="text-lg font-medium">Real-time Fantasy Premier League Tracker</p>
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Manager ID Input */}
        {!managerId && (
          <div className="max-w-md mx-auto animate-float">
            <div className="glass-card rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pl-purple to-pl-pink flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Enter Your FPL Manager ID</h2>
                <p className="text-white/60">
                  Find your ID in the FPL website URL when viewing your team
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="e.g. 123456"
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSetManagerId()}
                  className="glass-dark text-white placeholder:text-white/40 border-white/20 focus:border-pl-green"
                />
                <button 
                  onClick={handleSetManagerId}
                  className="btn-premier"
                >
                  Load Team
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {managerId && (
          <div className="space-y-6">
            {/* Navigation Bar */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <Tabs defaultValue="team" className="w-full md:w-auto">
                  <TabsList className="glass-dark border-white/10">
                    <TabsTrigger value="team" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pl-purple data-[state=active]:to-pl-pink">
                      <Users className="w-4 h-4 mr-2" />
                      My Team
                    </TabsTrigger>
                    <TabsTrigger value="leagues" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pl-purple data-[state=active]:to-pl-pink">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Leagues
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 glass-dark rounded-xl px-4 py-2">
                    <Switch
                      checked={autoSubs}
                      onCheckedChange={setAutoSubs}
                      id="auto-subs"
                      className="data-[state=checked]:bg-pl-green"
                    />
                    <label htmlFor="auto-subs" className="text-sm text-white/80 font-medium">Auto-subs</label>
                  </div>
                  <button
                    onClick={() => {
                      setManagerId(null)
                      localStorage.removeItem('fpl_manager_id')
                    }}
                    className="glass-dark hover:bg-white/20 text-white/80 hover:text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    Change ID
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <Tabs defaultValue="team" className="space-y-6">
              <TabsContent value="team" className="space-y-6">
                {managerLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="glass-card rounded-full p-8">
                      <Loader2 className="w-12 h-12 animate-spin text-pl-green" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Manager Info */}
                    {managerInfo && (
                      <div className="glass-card rounded-3xl p-6 hover-lift">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pl-purple to-pl-pink flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-white">{managerInfo.name}</h2>
                            <p className="text-white/60">
                              {managerInfo.player_first_name} {managerInfo.player_last_name}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Live Score */}
                      <div className="lg:col-span-1">
                        {teamScore && managerInfo && (
                          <LiveScore
                            score={teamScore.finalScore}
                            overallRank={managerInfo.summary_overall_rank || undefined}
                            transferCost={teamScore.transferCost}
                            isLive={true}
                            lastUpdated={new Date()}
                          />
                        )}
                      </div>

                      {/* Team Pitch */}
                      <div className="lg:col-span-2">
                        {teamScore && bootstrap && (
                          <TeamPitch
                            players={teamScore.players}
                            allPlayers={bootstrap.elements}
                            formation={teamScore.formation}
                            substitutions={teamScore.substitutions}
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="leagues" className="space-y-4">
                {managerInfo?.leagues.classic && (
                  <>
                    {/* League Selector */}
                    <div className="flex gap-2 flex-wrap">
                      {managerInfo.leagues.classic.map(league => (
                        <button
                          key={league.id}
                          onClick={() => setSelectedLeague(league.id)}
                          className={`px-4 py-2 rounded-xl font-medium transition-all ${
                            selectedLeague === league.id 
                              ? 'bg-gradient-to-r from-pl-purple to-pl-pink text-white shadow-lg' 
                              : 'glass-dark text-white/80 hover:text-white hover:bg-white/20'
                          }`}
                        >
                          {league.name}
                        </button>
                      ))}
                    </div>

                    {/* League Table */}
                    {selectedLeague && leagueData && (
                      <LeagueTable
                        leagueName={leagueData.league.name}
                        entries={leagueData.standings.results.map(entry => ({
                          rank: entry.rank,
                          lastRank: entry.last_rank,
                          entry: entry.entry,
                          entryName: entry.entry_name,
                          playerName: entry.player_name,
                          eventTotal: entry.event_total,
                          total: entry.total,
                          isCurrentUser: entry.entry === managerId,
                        }))}
                        isLoading={leagueLoading}
                        performanceMode={leagueData.standings.results.length > 50}
                        currentUserId={managerId}
                      />
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}