import { z } from 'zod'

export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, '') // Remove data URLs
    .trim()
    .slice(0, 10000) // Limit length
}

export const aiActionsSchema = z.object({
  userQuery: z.string()
    .min(1, 'User query cannot be empty')
    .max(1000, 'User query too long')
    .transform(sanitizeString),
  domContext: z.any()
    .refine(
      (val) => JSON.stringify(val).length < 50000,
      'DOM context too large'
    )
})

export const transcribeSchema = z.object({
  audio: z.instanceof(File)
    .refine(
      (file) => file.size <= 25 * 1024 * 1024,
      'File size must be less than 25MB'
    )
    .refine(
      (file) => file.type.startsWith('audio/') || file.name.endsWith('.webm'),
      'File must be an audio file'
    ),
  language: z.string()
    .max(10)
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined)
})

export const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean)

export function validateOrigin(request: Request): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  const origin = request.headers.get('origin')
  return origin ? allowedOrigins.includes(origin) : false
}

export function corsHeaders(origin?: string | null) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
  
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  
  return headers
} 