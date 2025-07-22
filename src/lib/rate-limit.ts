interface RateLimitStore {
  count: number
  resetTime: number
}

class RateLimiter {
  private store = new Map<string, RateLimitStore>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key)
      }
    }
  }

  check(identifier: string, limit: number, windowMs: number): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now()
    const key = identifier
    const current = this.store.get(key)

    if (!current || now > current.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + windowMs })
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + windowMs
      }
    }

    if (current.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: current.resetTime
      }
    }

    current.count++
    return {
      success: true,
      limit,
      remaining: limit - current.count,
      reset: current.resetTime
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

export const rateLimiter = new RateLimiter()

export const rateLimitConfig = {
  transcribe: {
    limit: 60, // 60 requests per 1 minute (expensive OpenAI calls)
    windowMs: 1 * 60 * 1000
  },
  aiActions: {
    limit: 60, // 60 requests per 1 minute  
    windowMs: 1 * 60 * 1000
  },
  default: {
    limit: 100, // 100 requests per 15 minutes
    windowMs: 15 * 60 * 1000
  }
}

export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for production with proxies)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0].trim() || realIp || 'unknown'
  
  // Include user agent as additional identifier to prevent easy spoofing
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const identifier = `${ip}:${userAgent.slice(0, 50)}`
  
  return identifier
} 