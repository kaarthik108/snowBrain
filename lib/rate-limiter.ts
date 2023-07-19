import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 d'),
  prefix: '@upstash/ratelimit'
})
