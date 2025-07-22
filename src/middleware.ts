import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimiter, rateLimitConfig, getClientIdentifier } from '@/lib/rate-limit'

export function middleware(request: NextRequest) {
  // seched
  const response = NextResponse.next()
  
  // seched
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = getClientIdentifier(request)
    let config = rateLimitConfig.default
    
  
    if (request.nextUrl.pathname.includes('/transcribe')) {
      config = rateLimitConfig.transcribe
    } else if (request.nextUrl.pathname.includes('/ai-actions')) {
      config = rateLimitConfig.aiActions
    }
    
    const result = rateLimiter.check(identifier, config.limit, config.windowMs)
    
    if (!result.success) {
      const errorResponse = NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
        },
        { status: 429 }
      )
      
      errorResponse.headers.set('X-RateLimit-Limit', config.limit.toString())
      errorResponse.headers.set('X-RateLimit-Remaining', '0')
      errorResponse.headers.set('X-RateLimit-Reset', result.reset.toString())
      errorResponse.headers.set('Retry-After', Math.ceil((result.reset - Date.now()) / 1000).toString())
      
      return errorResponse
    }
    
    
    response.headers.set('X-RateLimit-Limit', config.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.reset.toString())
  }

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
} 