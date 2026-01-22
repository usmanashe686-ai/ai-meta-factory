export interface SecurityHeaders {
  'X-DNS-Prefetch-Control': string
  'X-XSS-Protection': string
  'X-Frame-Options': string
  'X-Content-Type-Options': string
  'Referrer-Policy': string
  'Permissions-Policy': string
  'Content-Security-Policy': string
}

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message?: string
  statusCode?: number
}

export interface AuditResult {
  category: string
  status: 'PASS' | 'WARN' | 'FAIL'
  message: string
  details?: string
}

export interface EncryptionResult {
  encrypted: string
  iv?: string
  salt?: string
}

export interface UserSecurityLog {
  userId: string
  action: 'login' | 'logout' | 'password_change' | 'subscription_change'
  timestamp: Date
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}
