interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}
const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 100

export function rateLimit(identifier: string): {
  isLimited: boolean
  remaining: number
  reset: number
} {
  const now = Date.now()
  const windowStart = now - WINDOW_MS
  
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < windowStart) {
      delete store[key]
    }
  })
  
  if (!store[identifier]) {
    store[identifier] = {
      count: 0,
      resetTime: now + WINDOW_MS,
    }
  }
  
  const entry = store[identifier]
  entry.count++
  
  const isLimited = entry.count > MAX_REQUESTS
  const remaining = Math.max(0, MAX_REQUESTS - entry.count)
  const reset = Math.ceil((entry.resetTime - now) / 1000)
  
  return { isLimited, remaining, reset }
}

export function withRateLimit(
  handler: Function,
  options?: {
    windowMs?: number
    maxRequests?: number
    identifier?: (req: any) => string
  }
) {
  const {
    windowMs = WINDOW_MS,
    maxRequests = MAX_REQUESTS,
    identifier = (req) => req.ip || req.headers.get('x-forwarded-for') || 'anonymous',
  } = options || {}
  
  return async (req: any, res: any) => {
    const id = identifier(req)
    const limit = rateLimit(id)
    
    if (limit.isLimited) {
      res.setHeader('X-RateLimit-Limit', maxRequests)
      res.setHeader('X-RateLimit-Remaining', limit.remaining)
      res.setHeader('X-RateLimit-Reset', limit.reset)
      
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${limit.reset} seconds.`,
        retryAfter: limit.reset,
      })
    }
    
    res.setHeader('X-RateLimit-Limit', maxRequests)
    res.setHeader('X-RateLimit-Remaining', limit.remaining)
    res.setHeader('X-RateLimit-Reset', limit.reset)
    
    return handler(req, res)
  }
}
