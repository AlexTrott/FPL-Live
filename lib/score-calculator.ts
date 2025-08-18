import { Player, LiveElement, ManagerPick, Fixture } from './types/fpl'

interface ScoringRules {
  goals_scored: { [key: number]: number }
  assists: number
  clean_sheets: { [key: number]: number }
  goals_conceded: { [key: number]: number }
  own_goals: number
  penalties_saved: number
  penalties_missed: number
  yellow_cards: number
  red_cards: number
  saves: number
  bonus: number
  minutes: number[]
}

const SCORING_RULES: ScoringRules = {
  goals_scored: {
    1: 6,  // Goalkeeper
    2: 6,  // Defender
    3: 5,  // Midfielder
    4: 4,  // Forward
  },
  assists: 3,
  clean_sheets: {
    1: 4,  // Goalkeeper
    2: 4,  // Defender
    3: 1,  // Midfielder
    4: 0,  // Forward
  },
  goals_conceded: {
    1: -1,  // Goalkeeper (every 2 goals)
    2: -1,  // Defender (every 2 goals)
    3: 0,   // Midfielder
    4: 0,   // Forward
  },
  own_goals: -2,
  penalties_saved: 5,
  penalties_missed: -2,
  yellow_cards: -1,
  red_cards: -3,
  saves: 1, // Every 3 saves
  bonus: 1,
  minutes: [2, 1], // 2 points for 60+ minutes, 1 point for 1-59 minutes
}

export interface PlayerScore {
  playerId: number
  playerName: string
  teamId: number
  position: number
  elementType: number
  points: number
  multiplier: number
  totalPoints: number
  isCaptain: boolean
  isViceCaptain: boolean
  played: boolean
  minutes: number
  breakdown: {
    goals: number
    assists: number
    cleanSheet: number
    goalsConceded: number
    ownGoals: number
    penaltiesSaved: number
    penaltiesMissed: number
    yellowCards: number
    redCards: number
    saves: number
    bonus: number
    minutes: number
  }
}

export interface TeamScore {
  totalPoints: number
  players: PlayerScore[]
  benchPoints: number
  captainPoints: number
  transferCost: number
  finalScore: number
  formation: string
  chipActive: string | null
}

export class ScoreCalculator {
  private players: Map<number, Player> = new Map()
  private liveData: Map<number, LiveElement> = new Map()
  private fixtures: Fixture[] = []

  constructor(players: Player[], liveData?: LiveElement[], fixtures?: Fixture[]) {
    players.forEach(p => this.players.set(p.id, p))
    liveData?.forEach(l => this.liveData.set(l.id, l))
    this.fixtures = fixtures || []
  }

  calculatePlayerScore(
    playerId: number,
    elementType: number,
    multiplier: number = 1,
    isCaptain: boolean = false,
    isViceCaptain: boolean = false
  ): PlayerScore {
    const player = this.players.get(playerId)
    const liveStats = this.liveData.get(playerId)
    
    if (!player) {
      throw new Error(`Player ${playerId} not found`)
    }

    let points = 0
    const breakdown = {
      goals: 0,
      assists: 0,
      cleanSheet: 0,
      goalsConceded: 0,
      ownGoals: 0,
      penaltiesSaved: 0,
      penaltiesMissed: 0,
      yellowCards: 0,
      redCards: 0,
      saves: 0,
      bonus: 0,
      minutes: 0,
    }

    if (liveStats) {
      const stats = liveStats.stats
      
      // Minutes points
      if (stats.minutes > 0) {
        if (stats.minutes >= 60) {
          breakdown.minutes = SCORING_RULES.minutes[0]
        } else {
          breakdown.minutes = SCORING_RULES.minutes[1]
        }
        points += breakdown.minutes
      }

      // Goals
      if (stats.goals_scored > 0) {
        breakdown.goals = stats.goals_scored * SCORING_RULES.goals_scored[elementType]
        points += breakdown.goals
      }

      // Assists
      if (stats.assists > 0) {
        breakdown.assists = stats.assists * SCORING_RULES.assists
        points += breakdown.assists
      }

      // Clean sheets
      if (stats.clean_sheets > 0 && stats.minutes >= 60) {
        breakdown.cleanSheet = SCORING_RULES.clean_sheets[elementType]
        points += breakdown.cleanSheet
      }

      // Goals conceded
      if (stats.goals_conceded > 0 && (elementType === 1 || elementType === 2)) {
        breakdown.goalsConceded = Math.floor(stats.goals_conceded / 2) * SCORING_RULES.goals_conceded[elementType]
        points += breakdown.goalsConceded
      }

      // Own goals
      if (stats.own_goals > 0) {
        breakdown.ownGoals = stats.own_goals * SCORING_RULES.own_goals
        points += breakdown.ownGoals
      }

      // Penalties
      if (stats.penalties_saved > 0) {
        breakdown.penaltiesSaved = stats.penalties_saved * SCORING_RULES.penalties_saved
        points += breakdown.penaltiesSaved
      }
      if (stats.penalties_missed > 0) {
        breakdown.penaltiesMissed = stats.penalties_missed * SCORING_RULES.penalties_missed
        points += breakdown.penaltiesMissed
      }

      // Cards
      if (stats.yellow_cards > 0) {
        breakdown.yellowCards = stats.yellow_cards * SCORING_RULES.yellow_cards
        points += breakdown.yellowCards
      }
      if (stats.red_cards > 0) {
        breakdown.redCards = stats.red_cards * SCORING_RULES.red_cards
        points += breakdown.redCards
      }

      // Saves (for goalkeepers)
      if (elementType === 1 && stats.saves > 0) {
        breakdown.saves = Math.floor(stats.saves / 3) * SCORING_RULES.saves
        points += breakdown.saves
      }

      // Bonus points
      if (stats.bonus > 0) {
        breakdown.bonus = stats.bonus
        points += breakdown.bonus
      }
    }

    const totalPoints = points * multiplier

    return {
      playerId,
      playerName: player.web_name,
      teamId: player.team,
      position: 0,
      elementType,
      points,
      multiplier,
      totalPoints,
      isCaptain,
      isViceCaptain,
      played: liveStats ? liveStats.stats.minutes > 0 : false,
      minutes: liveStats?.stats.minutes || 0,
      breakdown,
    }
  }

  calculateTeamScore(
    picks: ManagerPick[],
    transferCost: number = 0,
    chipActive: string | null = null
  ): TeamScore {
    const players: PlayerScore[] = []
    let totalPoints = 0
    let benchPoints = 0
    let captainPoints = 0

    // Calculate scores for all players
    picks.forEach((pick, index) => {
      const player = this.players.get(pick.element)
      if (!player) return

      const score = this.calculatePlayerScore(
        pick.element,
        player.element_type,
        pick.multiplier,
        pick.is_captain,
        pick.is_vice_captain
      )
      score.position = pick.position
      players.push(score)

      // Starting XI (positions 1-11)
      if (pick.position <= 11) {
        totalPoints += score.totalPoints
        if (pick.is_captain) {
          captainPoints = score.points // Original points before multiplier
        }
      } else {
        // Bench players
        benchPoints += score.totalPoints
      }
    })

    // Apply transfer cost
    const finalScore = Math.max(0, totalPoints - transferCost)

    // Determine formation
    const formation = this.determineFormation(players.slice(0, 11))

    return {
      totalPoints,
      players,
      benchPoints,
      captainPoints,
      transferCost,
      finalScore,
      formation,
      chipActive,
    }
  }

  private determineFormation(startingXI: PlayerScore[]): string {
    const positions: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
    
    startingXI.forEach(player => {
      const elementType = this.players.get(player.playerId)?.element_type
      if (elementType) {
        positions[elementType]++
      }
    })

    return `${positions[2]}-${positions[3]}-${positions[4]}`
  }

  projectBonusPoints(fixtures: Fixture[]): Map<number, number> {
    const bonusProjection = new Map<number, number>()
    
    fixtures.forEach(fixture => {
      if (!fixture.started || fixture.finished) return
      
      // Find top 3 BPS players in the fixture
      const bpsData: Array<{ playerId: number; bps: number }> = []
      
      fixture.stats?.forEach(stat => {
        if (stat.identifier === 'bps') {
          stat.h.forEach(player => {
            bpsData.push({ playerId: player.element, bps: player.value })
          })
          stat.a.forEach(player => {
            bpsData.push({ playerId: player.element, bps: player.value })
          })
        }
      })
      
      // Sort by BPS and assign projected bonus
      bpsData.sort((a, b) => b.bps - a.bps)
      
      if (bpsData[0]) bonusProjection.set(bpsData[0].playerId, 3)
      if (bpsData[1]) bonusProjection.set(bpsData[1].playerId, 2)
      if (bpsData[2]) bonusProjection.set(bpsData[2].playerId, 1)
    })
    
    return bonusProjection
  }

  isFixtureFinished(teamId: number): boolean {
    const fixture = this.fixtures.find(
      f => f.team_h === teamId || f.team_a === teamId
    )
    return fixture ? fixture.finished : false
  }
}