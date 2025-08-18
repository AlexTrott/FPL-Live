import {
  BootstrapStatic,
  Fixture,
  ManagerInfo,
  ManagerHistory,
  ManagerPicks,
  Live,
  LeagueStandings,
} from './types/fpl'

const getProxyUrl = () => {
  const url = process.env.NEXT_PUBLIC_PROXY_URL || 'https://fpl-proxy.workers.dev'
  return url.startsWith('http') ? url : `https://${url}`
}

const PROXY_URL = getProxyUrl()

export class FPLApi {
  private baseUrl: string

  constructor() {
    this.baseUrl = `${PROXY_URL}/api`
  }

  private async fetchWithCache<T>(
    endpoint: string,
    cacheTime: number = 60000
  ): Promise<T> {
    const cacheKey = `fpl_${endpoint}`
    
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < cacheTime) {
          return data
        }
      }
    }

    const response = await fetch(`${this.baseUrl}/${endpoint}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({ data, timestamp: Date.now() })
      )
    }
    
    return data
  }

  async getBootstrapStatic(): Promise<BootstrapStatic> {
    return this.fetchWithCache<BootstrapStatic>('bootstrap-static/', 900000)
  }

  async getFixtures(event?: number): Promise<Fixture[]> {
    const endpoint = event ? `fixtures/?event=${event}` : 'fixtures/'
    return this.fetchWithCache<Fixture[]>(endpoint, 120000)
  }

  async getManagerInfo(managerId: number): Promise<ManagerInfo> {
    return this.fetchWithCache<ManagerInfo>(`entry/${managerId}/`, 300000)
  }

  async getManagerHistory(managerId: number): Promise<ManagerHistory> {
    return this.fetchWithCache<ManagerHistory>(`entry/${managerId}/history/`, 300000)
  }

  async getManagerPicks(managerId: number, event: number): Promise<ManagerPicks> {
    return this.fetchWithCache<ManagerPicks>(
      `entry/${managerId}/event/${event}/picks/`,
      120000
    )
  }

  async getLive(event: number): Promise<Live> {
    return this.fetchWithCache<Live>(`event/${event}/live/`, 60000)
  }

  async getLeagueStandings(
    leagueId: number,
    page: number = 1
  ): Promise<LeagueStandings> {
    return this.fetchWithCache<LeagueStandings>(
      `leagues-classic/${leagueId}/standings/?page_standings=${page}`,
      120000
    )
  }

  async getCurrentGameweek(): Promise<number> {
    const bootstrap = await this.getBootstrapStatic()
    const currentEvent = bootstrap.events.find(e => e.is_current)
    if (!currentEvent) {
      const nextEvent = bootstrap.events.find(e => e.is_next)
      return nextEvent?.id || 1
    }
    return currentEvent.id
  }

  async getPlayerById(playerId: number): Promise<any> {
    const bootstrap = await this.getBootstrapStatic()
    return bootstrap.elements.find(p => p.id === playerId)
  }

  async getTeamById(teamId: number): Promise<any> {
    const bootstrap = await this.getBootstrapStatic()
    return bootstrap.teams.find(t => t.id === teamId)
  }
}