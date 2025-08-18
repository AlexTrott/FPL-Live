import { Redis } from '@upstash/redis'

let redis: Redis | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export class CacheService {
  private static instance: CacheService
  private useRedis: boolean

  constructor() {
    this.useRedis = !!redis
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.useRedis) {
      // Fallback to in-memory cache or session storage
      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem(key)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          return data as T
        }
      }
      return null
    }

    try {
      const data = await redis!.get(key)
      return data as T | null
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.useRedis) {
      // Fallback to in-memory cache or session storage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          key,
          JSON.stringify({ data: value, timestamp: Date.now() })
        )
      }
      return
    }

    try {
      if (ttl) {
        await redis!.set(key, value, { ex: ttl })
      } else {
        await redis!.set(key, value)
      }
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.useRedis) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(key)
      }
      return
    }

    try {
      await redis!.del(key)
    } catch (error) {
      console.error('Redis del error:', error)
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.useRedis) {
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem(key) !== null
      }
      return false
    }

    try {
      const result = await redis!.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis exists error:', error)
      return false
    }
  }

  // Cache key generators
  static getCacheKey(type: string, ...args: (string | number)[]): string {
    return `fpl:${type}:${args.join(':')}`
  }

  static getBootstrapKey(): string {
    return CacheService.getCacheKey('bootstrap')
  }

  static getManagerKey(managerId: number): string {
    return CacheService.getCacheKey('manager', managerId)
  }

  static getManagerPicksKey(managerId: number, event: number): string {
    return CacheService.getCacheKey('picks', managerId, event)
  }

  static getLiveKey(event: number): string {
    return CacheService.getCacheKey('live', event)
  }

  static getLeagueKey(leagueId: number, page: number = 1): string {
    return CacheService.getCacheKey('league', leagueId, page)
  }

  static getFixturesKey(event?: number): string {
    return event 
      ? CacheService.getCacheKey('fixtures', event)
      : CacheService.getCacheKey('fixtures', 'all')
  }
}