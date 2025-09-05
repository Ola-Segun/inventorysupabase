import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { csrfProtection } from '@/lib/auth/csrf'
import { rateLimitService } from '@/lib/auth/rate-limit'

// Create a Supabase client for middleware (using service role for server-side operations)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Define route protection rules
const routeRules = {
  // Public routes (no authentication required)
  public: [
    '/',
    '/login',
    '/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/confirm-email',
    '/auth/accept-invitation',
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/confirm-email',
    '/api/auth/test-email'
  ],

  // Protected routes (authentication required)
  protected: [
    '/dashboard',
    '/admin',
    '/seller',
    '/settings',
    '/inventory',
    '/orders',
    '/products',
    '/customers',
    '/suppliers',
    '/reports',
    '/sales',
    '/analytics'
  ],

  // Admin only routes
  admin: [
    '/admin',
    '/api/admin'
  ],

  // Seller only routes
  seller: [
    '/seller'
  ]
}

// Role-based route permissions
const rolePermissions = {
  super_admin: ['*'], // Access to everything
  admin: [
    '/admin',
    '/dashboard',
    '/settings',
    '/inventory',
    '/orders',
    '/products',
    '/customers',
    '/suppliers',
    '/reports',
    '/sales',
    '/analytics',
    '/api/admin/users',
    '/api/admin/activity-logs'
  ],
  manager: [
    '/dashboard',
    '/inventory',
    '/orders',
    '/products',
    '/customers',
    '/suppliers',
    '/reports',
    '/sales',
    '/analytics'
  ],
  cashier: [
    '/dashboard',
    '/orders',
    '/products',
    '/customers'
  ],
  seller: [
    '/seller',
    '/dashboard',
    '/orders',
    '/products',
    '/customers'
  ]
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('🔒 Middleware: Processing request for', pathname, 'at', new Date().toISOString())

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  // Handle API routes - apply security but skip auth checks (handled by API routes themselves)
  if (pathname.startsWith('/api/')) {
    // Apply rate limiting for API routes
    const rateLimitResult = await rateLimitService.checkRateLimit(
      request,
      {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100, // 100 requests per minute
        skipSuccessfulRequests: false,
        skipFailedRequests: false
      },
      'api'
    )

    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response
    }

    // Apply CSRF protection for state-changing API routes
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const csrfCheck = csrfProtection.middleware(request)
      if (csrfCheck) {
        return csrfCheck
      }
    }

    // For API routes, add security headers and return
      const response = NextResponse.next()
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-Content-Type-Options', 'nosniff')

      // Attempt to attach authenticated user context for API routes so
      // downstream API handlers (server routes) can read X-User-ID / X-User-Role
      // NOTE: skip enriching the auth routes themselves
      try {
        if (!pathname.startsWith('/api/auth')) {
          const accessToken = request.cookies.get('sb-access-token')?.value

          if (accessToken) {
            // Verify token and load lightweight profile
            const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)

            if (!userError && userData?.user) {
              const user = userData.user

              // Query minimal profile fields only
              const { data: profile } = await supabase
                .from('users')
                .select('id, role, organization_id, store_id')
                .eq('id', user.id)
                .single()

              if (profile) {
                response.headers.set('X-User-ID', user.id)
                response.headers.set('X-User-Role', profile.role)
                response.headers.set('X-Organization-ID', profile.organization_id || '')
                response.headers.set('X-Store-ID', profile.store_id || '')
              }
            }
          }
        }
      } catch (err) {
        // Do not fail the request if header enrichment fails
        console.error('Middleware: failed to enrich API request with user headers', err)
      }

      return response
  }

  // For page routes, check if user has valid session via cookies
  const hasAuthCookie = request.cookies.get('sb-auth-state')?.value === 'authenticated'
  const hasAccessToken = !!request.cookies.get('sb-access-token')?.value

  console.log('🔒 Middleware: Page route auth check:', {
    pathname,
    hasAuthCookie,
    hasAccessToken
  })

  // Check if route is public
  const isPublicRoute = routeRules.public.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  console.log('🔒 Middleware: Route analysis:', { pathname, isPublicRoute, hasAuthCookie, hasAccessToken })

  // If route is public, allow access
  if (isPublicRoute) {
    console.log('🔒 Middleware: Allowing access to public route')
    return NextResponse.next()
  }

  // For protected routes, check if user has auth cookies
  if (!hasAuthCookie || !hasAccessToken) {
    console.log('🔒 Middleware: No auth cookies found, redirecting to login')

    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)

    console.log('🔒 Middleware: Redirecting to:', loginUrl.toString())
    return NextResponse.redirect(loginUrl)
  }

  console.log('🔒 Middleware: Auth cookies present, allowing access')

  // Add security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}