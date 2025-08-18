import { ManagerPick, Player, LiveElement, Fixture } from './types/fpl'
import { PlayerScore } from './score-calculator'

interface SubstitutionResult {
  originalPicks: ManagerPick[]
  substitutedPicks: ManagerPick[]
  substitutions: Array<{
    playerOut: number
    playerIn: number
    reason: string
  }>
  validFormation: boolean
  formation: string
}

interface FormationRequirements {
  minDefenders: number
  minMidfielders: number
  minForwards: number
  maxFromSameTeam: number
}

const FORMATION_RULES: FormationRequirements = {
  minDefenders: 3,
  minMidfielders: 2,
  minForwards: 1,
  maxFromSameTeam: 3,
}

export class AutoSubstitution {
  private players: Map<number, Player> = new Map()
  private liveData: Map<number, LiveElement> = new Map()
  private fixtures: Fixture[] = []

  constructor(
    players: Player[],
    liveData?: LiveElement[],
    fixtures?: Fixture[]
  ) {
    players.forEach(p => this.players.set(p.id, p))
    liveData?.forEach(l => this.liveData.set(l.id, l))
    this.fixtures = fixtures || []
  }

  processAutoSubstitutions(
    picks: ManagerPick[],
    enableAutoSubs: boolean = true
  ): SubstitutionResult {
    if (!enableAutoSubs) {
      return {
        originalPicks: picks,
        substitutedPicks: picks,
        substitutions: [],
        validFormation: this.isValidFormation(picks.slice(0, 11)),
        formation: this.getFormation(picks.slice(0, 11)),
      }
    }

    const substitutedPicks = [...picks]
    const substitutions: SubstitutionResult['substitutions'] = []
    
    // Separate starting XI and bench
    const startingXI = substitutedPicks.filter(p => p.position <= 11)
    const bench = substitutedPicks.filter(p => p.position > 11).sort((a, b) => a.position - b.position)
    
    // Check each starting player
    for (let i = 0; i < startingXI.length; i++) {
      const pick = startingXI[i]
      const player = this.players.get(pick.element)
      
      if (!player) continue
      
      // Check if player played
      const hasPlayed = this.hasPlayerPlayed(pick.element)
      
      if (!hasPlayed && this.isFixtureFinished(player.team)) {
        // Player didn't play and fixture is finished - try to substitute
        
        for (const benchPlayer of bench) {
          const subPlayer = this.players.get(benchPlayer.element)
          if (!subPlayer) continue
          
          // Check if bench player played
          if (!this.hasPlayerPlayed(benchPlayer.element)) continue
          
          // Check if substitution maintains valid formation
          const testPicks = [...substitutedPicks]
          const outIndex = testPicks.findIndex(p => p.element === pick.element)
          const inIndex = testPicks.findIndex(p => p.element === benchPlayer.element)
          
          if (outIndex === -1 || inIndex === -1) continue
          
          // Swap positions
          const tempPosition = testPicks[outIndex].position
          testPicks[outIndex].position = testPicks[inIndex].position
          testPicks[inIndex].position = tempPosition
          
          // Check if new formation is valid
          const newStartingXI = testPicks.filter(p => p.position <= 11)
          if (this.isValidFormation(newStartingXI)) {
            // Apply substitution
            substitutedPicks[outIndex].position = testPicks[outIndex].position
            substitutedPicks[inIndex].position = testPicks[inIndex].position
            
            substitutions.push({
              playerOut: pick.element,
              playerIn: benchPlayer.element,
              reason: `${player.web_name} didn't play (auto-sub)`,
            })
            
            // Move to next non-playing starter
            break
          }
        }
      }
    }
    
    // Handle goalkeeper substitution separately
    const gkPick = startingXI.find(p => {
      const player = this.players.get(p.element)
      return player?.element_type === 1
    })
    
    if (gkPick) {
      const gkPlayer = this.players.get(gkPick.element)
      if (gkPlayer && !this.hasPlayerPlayed(gkPick.element) && this.isFixtureFinished(gkPlayer.team)) {
        // Find substitute goalkeeper
        const subGk = bench.find(p => {
          const player = this.players.get(p.element)
          return player?.element_type === 1 && this.hasPlayerPlayed(p.element)
        })
        
        if (subGk) {
          const outIndex = substitutedPicks.findIndex(p => p.element === gkPick.element)
          const inIndex = substitutedPicks.findIndex(p => p.element === subGk.element)
          
          if (outIndex !== -1 && inIndex !== -1) {
            const tempPosition = substitutedPicks[outIndex].position
            substitutedPicks[outIndex].position = substitutedPicks[inIndex].position
            substitutedPicks[inIndex].position = tempPosition
            
            substitutions.push({
              playerOut: gkPick.element,
              playerIn: subGk.element,
              reason: `${gkPlayer.web_name} didn't play (GK auto-sub)`,
            })
          }
        }
      }
    }
    
    const finalStartingXI = substitutedPicks.filter(p => p.position <= 11)
    
    return {
      originalPicks: picks,
      substitutedPicks,
      substitutions,
      validFormation: this.isValidFormation(finalStartingXI),
      formation: this.getFormation(finalStartingXI),
    }
  }

  private hasPlayerPlayed(playerId: number): boolean {
    const liveData = this.liveData.get(playerId)
    return liveData ? liveData.stats.minutes > 0 : false
  }

  private isFixtureFinished(teamId: number): boolean {
    const fixture = this.fixtures.find(
      f => f.team_h === teamId || f.team_a === teamId
    )
    return fixture ? fixture.finished : false
  }

  private isValidFormation(startingXI: ManagerPick[]): boolean {
    const positions: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
    
    startingXI.forEach(pick => {
      const player = this.players.get(pick.element)
      if (player) {
        positions[player.element_type]++
      }
    })
    
    // Check formation requirements
    if (positions[1] !== 1) return false // Must have exactly 1 GK
    if (positions[2] < FORMATION_RULES.minDefenders) return false
    if (positions[3] < FORMATION_RULES.minMidfielders) return false
    if (positions[4] < FORMATION_RULES.minForwards) return false
    
    // Check total players
    const totalPlayers = positions[1] + positions[2] + positions[3] + positions[4]
    if (totalPlayers !== 11) return false
    
    return true
  }

  private getFormation(startingXI: ManagerPick[]): string {
    const positions: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
    
    startingXI.forEach(pick => {
      const player = this.players.get(pick.element)
      if (player) {
        positions[player.element_type]++
      }
    })
    
    return `${positions[2]}-${positions[3]}-${positions[4]}`
  }

  validateTeamSelection(picks: ManagerPick[]): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    const startingXI = picks.filter(p => p.position <= 11)
    
    // Check formation
    if (!this.isValidFormation(startingXI)) {
      errors.push('Invalid formation: Must have 1 GK, min 3 DEF, min 2 MID, min 1 FWD')
    }
    
    // Check team limits
    const teamCounts = new Map<number, number>()
    startingXI.forEach(pick => {
      const player = this.players.get(pick.element)
      if (player) {
        const count = teamCounts.get(player.team) || 0
        teamCounts.set(player.team, count + 1)
      }
    })
    
    teamCounts.forEach((count, teamId) => {
      if (count > FORMATION_RULES.maxFromSameTeam) {
        errors.push(`Too many players from same team (max ${FORMATION_RULES.maxFromSameTeam})`)
      }
    })
    
    // Check captain and vice-captain
    const captains = picks.filter(p => p.is_captain)
    const viceCaptains = picks.filter(p => p.is_vice_captain)
    
    if (captains.length !== 1) {
      errors.push('Must have exactly one captain')
    }
    if (viceCaptains.length !== 1) {
      errors.push('Must have exactly one vice-captain')
    }
    
    return {
      valid: errors.length === 0,
      errors,
    }
  }
}