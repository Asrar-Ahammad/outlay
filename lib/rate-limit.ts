import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Simple in-memory rate limiter fallback for development
class InMemoryRateLimiter {
  private cache: Map<string, { count: number; reset: number }>

  constructor() {
    this.cache = new Map()
    // Periodic cleanup of expired entries
    if (typeof window === 'undefined') {
      setInterval(() => {
        const now = Date.now()
        for (const [key, value] of this.cache.entries()) {
          if (now > value.reset) {
            this.cache.delete(key)
          }
        }
      }, 60000).unref() // unref so it doesn't block process exit
    }
  }

  async limit(key: string, limitCount: number = 10, windowMs: number = 60000) {
    const now = Date.now()
    const record = this.cache.get(key)
    
    if (!record || now > record.reset) {
      this.cache.set(key, { count: 1, reset: now + windowMs })
      return { success: true, limit: limitCount, remaining: limitCount - 1, reset: now + windowMs }
    }
    
    if (record.count >= limitCount) {
      return { success: false, limit: limitCount, remaining: 0, reset: record.reset }
    }
    
    record.count += 1
    return { success: true, limit: limitCount, remaining: limitCount - record.count, reset: record.reset }
  }
}

const devLimiter = new InMemoryRateLimiter()

let redisInstance: Redis | null = null
let ratelimitInstance: Ratelimit | null = null

function getRatelimit(redisUrl: string, redisToken: string, limitCount: number, windowSeconds: number): Ratelimit {
  if (!redisInstance) {
    redisInstance = new Redis({
      url: redisUrl,
      token: redisToken,
    })
  }
  if (!ratelimitInstance) {
    ratelimitInstance = new Ratelimit({
      redis: redisInstance,
      limiter: Ratelimit.slidingWindow(limitCount, `${windowSeconds} s`),
      analytics: true,
      prefix: '@upstash/ratelimit',
    })
  }
  return ratelimitInstance
}

/**
 * Checks rate limit for a key (e.g., user ID or IP address)
 * Defaults to 10 requests per minute
 */
export async function rateLimit(
  key: string,
  limitCount: number = 10,
  windowSeconds: number = 60
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (redisUrl && redisToken && redisUrl !== 'https://placeholder.upstash.io') {
    try {
      const ratelimit = getRatelimit(redisUrl, redisToken, limitCount, windowSeconds)
      const result = await ratelimit.limit(key)
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      }
    } catch (error) {
      console.error('Upstash Redis Rate limiting failed, falling back to in-memory:', error)
    }
  }

  // Fallback to memory
  const result = await devLimiter.limit(key, limitCount, windowSeconds * 1000)
  return result;
}
