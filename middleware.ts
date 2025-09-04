import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client for middleware
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

  console.log('🔒 Middleware: Processing request for', pathname)

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  // Get session from cookies
  const accessToken = request.cookies.get('sb-access-token')?.value
  const refreshToken = request.cookies.get('sb-refresh-token')?.value

  console.log('🔒 Middleware: Tokens present:', { accessToken: !!accessToken, refreshToken: !!refreshToken })

  let user = null
  let userProfile = null

  // Verify session if tokens exist
  if (accessToken) {
    try {
      console.log('🔒 Middleware: Verifying session with server-side client...')

      // Create server-side Supabase client for session verification
      const serverSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Verify the JWT token directly
      const { data: { user: sessionUser }, error } = await serverSupabase.auth.getUser(accessToken)

      if (!error && sessionUser) {
        user = sessionUser
        console.log('🔒 Middleware: Session verified for user:', sessionUser.id)

        // Get user profile
        try {
          const { data: profile, error: profileError } = await serverSupabase
            .from('users')
            .select('*, store:stores(*)')
            .eq('id', sessionUser.id)
            .single()

          if (!profileError && profile) {
            userProfile = profile
            console.log('🔒 Middleware: User profile loaded:', { role: profile.role, status: profile.status })
          } else {
            // If profile query fails, create a basic profile from auth data
            console.warn('🔒 Middleware: Profile query failed, using basic auth profile:', profileError?.message)
            userProfile = {
              id: sessionUser.id,
              email: sessionUser.email || '',
              name: sessionUser.user_metadata?.name || '',
              role: 'seller',
              status: 'active',
              organization_id: null,
              store_id: null,
              is_store_owner: false,
              permissions: []
            }
          }
        } catch (error) {
          console.warn('🔒 Middleware: Profile query error, using fallback:', error)
          // Create fallback profile
          userProfile = {
            id: sessionUser.id,
            email: sessionUser.email || '',
            name: sessionUser.user_metadata?.name || '',
            role: 'seller',
            status: 'active',
            organization_id: null,
            store_id: null,
            is_store_owner: false,
            permissions: []
          }
        }
      } else {
        console.log('🔒 Middleware: Session verification failed:', error?.message)
      }
    } catch (error) {
      console.error('🔒 Middleware: Session verification error:', error)
    }
  } else {
    console.log('🔒 Middleware: No access token found')
  }

  // Check if route is public
  const isPublicRoute = routeRules.public.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  console.log('🔒 Middleware: Route analysis:', { pathname, isPublicRoute, hasUser: !!user, hasProfile: !!userProfile })

  // If route is public, allow access
  if (isPublicRoute) {
    console.log('🔒 Middleware: Allowing access to public route')
    return NextResponse.next()
  }

  // If no user session and route is not public, redirect to login
  if (!user) {
    console.log('🔒 Middleware: No user session, redirecting to login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user profile not found, redirect to login
  if (!userProfile) {
    console.log('🔒 Middleware: No user profile, redirecting to login')
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Check if user account is active
  if (userProfile.status !== 'active') {
    console.log('🔒 Middleware: User account not active, redirecting to login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'account_inactive')
    return NextResponse.redirect(loginUrl)
  }

  // Check role-based access
  const userRole = userProfile.role
  const allowedRoutes = rolePermissions[userRole as keyof typeof rolePermissions] || []

  console.log('🔒 Middleware: Access check:', { userRole, allowedRoutes, pathname })

  // Super admin has access to everything
  if (userRole === 'super_admin') {
    console.log('🔒 Middleware: Super admin access granted')
    return NextResponse.next()
  }

  // Check if user has permission for this route
  const hasAccess = allowedRoutes.some(route =>
    pathname === route ||
    pathname.startsWith(route + '/') ||
    route === '*' ||
    pathname.startsWith('/api/') // Allow API access for now (will be checked by RLS)
  )

  console.log('🔒 Middleware: Access result:', { hasAccess })

  if (!hasAccess) {
    console.log('🔒 Middleware: Access denied, redirecting to dashboard')
    // Redirect to dashboard or show unauthorized page
    const dashboardUrl = new URL('/dashboard', request.url)
    dashboardUrl.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(dashboardUrl)
  }

  console.log('🔒 Middleware: Access granted, proceeding')

  // Add security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Add user context to headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-User-ID', user.id)
    response.headers.set('X-User-Role', userRole)
    response.headers.set('X-Organization-ID', userProfile.organization_id || '')
    response.headers.set('X-Store-ID', userProfile.store_id || '')
  }

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