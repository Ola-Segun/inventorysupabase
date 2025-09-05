"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User, Session } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import type { Database } from "@/lib/supabase/database.types"
import { getCSRFToken } from "@/lib/auth/csrf"

type UserRole = "super_admin" | "admin" | "manager" | "cashier" | "seller"
type SubscriptionTier = "free" | "pro" | "enterprise"
type StoreType = "retail_store" | "warehouse" | "distribution_center" | "pop_up_store"
type StoreStatus = "active" | "inactive" | "pending_approval" | "suspended"

export interface Store {
  id: string
  name: string
  store_type: StoreType
  status: StoreStatus
  owner_id: string
  business_name: string | null
  business_registration_number: string | null
  tax_number: string | null
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  timezone: string | null
  currency: string | null
  logo_url: string | null
  website_url: string | null
  description: string | null
  settings: any
  subscription_plan: string | null
  subscription_status: string | null
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  subscription_tier: SubscriptionTier
  subscription_status: "active" | "canceled" | "past_due" | "trialing"
  trial_ends_at: string | null
  settings: any
  created_at: string
  updated_at: string
}

interface UserProfile {
  id: string
  organization_id: string | null
  store_id: string | null
  email: string
  name: string
  role: UserRole
  avatar_url: string | null
  status: "active" | "inactive" | "suspended"
  is_store_owner: boolean | null
  permissions: string[] | null
  two_factor_enabled?: boolean
  two_factor_secret?: string
  two_factor_backup_codes?: string[]
  store?: Store
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  store: Store | null
  organization: Organization | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signUp: (
    email: string,
    password: string,
    userData: {
      name: string
      storeName: string
      storeType?: StoreType
      businessName?: string
      organizationName?: string
      organizationSlug?: string
      industry?: string
      country?: string
      role?: UserRole
    },
  ) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
  hasRole: (roles: UserRole[]) => boolean
  hasFeature: (feature: string) => boolean
  isSuperAdmin: boolean
  // Permission system
  hasPermission: (permission: string) => Promise<boolean>
  getUserPermissions: () => Promise<any[]>
  checkPermission: (resource: string, action: string) => Promise<boolean>
  // 2FA methods
  setup2FA: () => Promise<{ secret: string; qrCode: string; otpauthUrl: string }>
  verify2FA: (token: string) => Promise<boolean>
  disable2FA: (token: string) => Promise<void>
  is2FAEnabled: boolean
  // Session management
  getActiveSessions: () => Promise<any[]>
  terminateSession: (sessionId: string) => Promise<void>
  // Super admin methods
  getAllOrganizations: () => Promise<Organization[]>
  updateOrganizationStatus: (orgId: string, status: string) => Promise<void>
  getPlatformStats: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const SupabaseAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [store, setStore] = useState<Store | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // Remove router usage from context - handle redirects in components instead
  // const router = useRouter()
  // const pathname = usePathname()

  // Compute isAuthenticated based on current user state
  const isAuthenticated = !!user

  // Check if Supabase is configured
  const isConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    return url && key && !url.includes("your-project") && !key.includes("your-anon-key")
  }

  const supabase = createClientComponentClient<Database>()

  // Feature flags based on subscription tier
  const FEATURE_FLAGS = {
    free: {
      maxProducts: 100,
      maxTeamMembers: 2,
      storage: "1GB",
      aiFeatures: false,
      apiAccess: false,
      advancedAnalytics: false,
      prioritySupport: false,
    },
    pro: {
      maxProducts: 10000,
      maxTeamMembers: 10,
      storage: "50GB",
      aiFeatures: true,
      apiAccess: true,
      advancedAnalytics: true,
      prioritySupport: true,
    },
    enterprise: {
      maxProducts: Number.POSITIVE_INFINITY,
      maxTeamMembers: Number.POSITIVE_INFINITY,
      storage: "500GB",
      aiFeatures: true,
      apiAccess: true,
      advancedAnalytics: true,
      prioritySupport: true,
      whiteLabel: true,
      customAiModels: true,
    },
  }

  // Load user profile, store data, and organization data
  const loadUserProfile = async (userId: string) => {
    try {
      console.log("🔄 SupabaseAuthContext: Loading user profile for:", userId)

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select(`
          *,
          store:stores(*),
          organization:organizations(*)
        `)
        .eq("id", userId)
        .single()

      if (profileError) {
            // Use warn for expected/handled DB errors to avoid Next dev overlay treating this as an unhandled exception
            console.warn("🔄 SupabaseAuthContext: Profile query failed:", profileError)

        // If user doesn't exist in users table, create a basic profile
        if (profileError.code === 'PGRST116' && user) {
          console.log("🔄 SupabaseAuthContext: User not found in users table, creating basic profile")

          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email || "",
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              role: 'seller',
              status: 'active',
              organization_id: null,
              store_id: null,
              is_store_owner: false,
              permissions: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select(`
              *,
              store:stores(*),
              organization:organizations(*)
            `)
            .single()

          if (createError) {
            console.error("🔄 SupabaseAuthContext: Failed to create user profile:", createError)
            // Create fallback profile
            setUserProfile({
              id: user.id,
              organization_id: null,
              store_id: null,
              email: user.email || "",
              name: user.user_metadata?.name || "",
              role: "seller",
              avatar_url: null,
              status: "active",
              is_store_owner: false,
              permissions: [],
            })
          } else {
            console.log("🔄 SupabaseAuthContext: Successfully created user profile:", newProfile.id)
            setUserProfile(newProfile)
            setStore(newProfile.store || null)
            setOrganization(newProfile.organization || null)
          }
        } else {
          // Create basic profile from auth data for other errors
          if (user) {
            setUserProfile({
              id: user.id,
              organization_id: null,
              store_id: null,
              email: user.email || "",
              name: user.user_metadata?.name || "",
              role: "seller",
              avatar_url: null,
              status: "active",
              is_store_owner: false,
              permissions: [],
            })
          }
        }
        setStore(null)
        setOrganization(null)
        return
      }

      if (profile) {
        console.log("🔄 SupabaseAuthContext: Profile loaded successfully:", profile.id)
        setUserProfile(profile)
        setStore(profile.store || null)
        setOrganization(profile.organization || null)
      }
    } catch (error: any) {
      console.error("🔄 SupabaseAuthContext: Error loading user profile:", error)
      // Create fallback profile
      if (user) {
        setUserProfile({
          id: user.id,
          organization_id: null,
          store_id: null,
          email: user.email || "",
          name: user.user_metadata?.name || "",
          role: "seller",
          avatar_url: null,
          status: "active",
          is_store_owner: false,
          permissions: [],
        })
      }
      setStore(null)
      setOrganization(null)
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔄 SupabaseAuthContext: Starting auth initialization")

        // First, try to get session from Supabase client
        const {
          data: { session: initialSession },
          error: sessionError
        } = await supabase.auth.getSession()

        console.log("🔄 SupabaseAuthContext: Session check result:", {
          hasSession: !!initialSession,
          sessionError: sessionError?.message,
          userId: initialSession?.user?.id
        })

        if (initialSession) {
          console.log("🔄 SupabaseAuthContext: Found existing session, setting up user")
          setSession(initialSession)
          setUser(initialSession.user)
          await loadUserProfile(initialSession.user.id)
        } else {
          console.log("🔄 SupabaseAuthContext: No session found, checking for auth cookies")

          // If no session found, check if we have auth cookies that might indicate a recent login
          const hasAuthCookie = document.cookie.includes('sb-auth-state=authenticated')
          const allCookies = document.cookie

          console.log("🔄 SupabaseAuthContext: Cookie check:", {
            hasAuthCookie,
            allCookies: allCookies.split(';').map(c => c.trim())
          })

          // Check for Supabase session cookies
          const hasAccessToken = document.cookie.includes('sb-access-token=')
          const hasAuthToken = document.cookie.includes('sb-auth-token=')

          console.log("🔄 SupabaseAuthContext: Cookie check:", {
            hasAuthCookie,
            hasAccessToken,
            hasAuthToken,
            allCookies: document.cookie.split(';').map(c => c.trim())
          })

          if (hasAccessToken || hasAuthToken) {
            console.log("🔄 SupabaseAuthContext: Found Supabase cookies, attempting to get current session")

            // Try to get the current session from Supabase
            const { data: currentSession, error: sessionError } = await supabase.auth.getSession()

            console.log("🔄 SupabaseAuthContext: Current session check result:", {
              hasSession: !!currentSession.session,
              sessionError: sessionError?.message,
              userId: currentSession.session?.user?.id
            })

            if (currentSession.session && currentSession.session.user) {
              console.log("🔄 SupabaseAuthContext: Valid session found, setting up user")
              setSession(currentSession.session)
              setUser(currentSession.session.user)
              await loadUserProfile(currentSession.session.user.id)
            } else {
              console.log("🔄 SupabaseAuthContext: No valid client session found, attempting server-side session fetch")

              // Call server endpoint to read session from cookies (server can access httpOnly cookies)
              try {
                const resp = await fetch('/api/auth/session', { credentials: 'include' })
                const sessData = await resp.json()

                if (resp.ok && sessData.session && sessData.session.user) {
                  console.log('🔄 SupabaseAuthContext: Server-side session retrieved')

                  // First, try to set the Supabase client session (best-effort)
                  try {
                    await supabase.auth.setSession({
                      access_token: sessData.session.access_token,
                      refresh_token: sessData.session.refresh_token,
                    })
                    console.log('🔄 SupabaseAuthContext: Supabase client setSession succeeded')
                  } catch (setErr) {
                    console.warn('🔄 SupabaseAuthContext: Failed to set Supabase client session:', setErr)
                  }

                  // Directly set context state as a fallback so UI updates immediately
                  try {
                    setSession(sessData.session)
                    setUser(sessData.session.user)
                    await loadUserProfile(sessData.session.user.id)
                    console.log('🔄 SupabaseAuthContext: Context user/session set from server session')
                  } catch (stateErr) {
                    console.error('🔄 SupabaseAuthContext: Failed to set context from server session:', stateErr)
                  }
                } else {
                  console.log('🔄 SupabaseAuthContext: No server-side session available, attempting refresh')
                  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()

                  console.log("🔄 SupabaseAuthContext: Session refresh result:", {
                    hasRefreshedSession: !!refreshData?.session,
                    refreshError: refreshError?.message
                  })

                  if (refreshData?.session && refreshData.session.user) {
                    console.log("🔄 SupabaseAuthContext: Session refreshed successfully")
                    setSession(refreshData.session)
                    setUser(refreshData.session.user)
                    await loadUserProfile(refreshData.session.user.id)
                  } else {
                    console.log("🔄 SupabaseAuthContext: Session refresh failed, clearing state")
                    setUser(null)
                    setUserProfile(null)
                    setStore(null)
                    setOrganization(null)
                    setSession(null)
                  }
                }
              } catch (err) {
                console.error('🔄 SupabaseAuthContext: Error fetching server-side session:', err)
              }
            }
          } else {
            console.log("🔄 SupabaseAuthContext: No Supabase cookies found, user is not authenticated")
            setUser(null)
            setUserProfile(null)
            setStore(null)
            setOrganization(null)
            setSession(null)
          }
        }
      } catch (error) {
        console.error("🔄 SupabaseAuthContext: Error initializing auth:", error)
        // Clear state on error
        setUser(null)
        setUserProfile(null)
        setStore(null)
        setOrganization(null)
        setSession(null)
      } finally {
        console.log(
          "🔄 SupabaseAuthContext: initializeAuth finished. Final state:",
          {
            hasUser: !!user,
            hasSession: !!session,
            isLoading: false,
            isAuthenticated: !!user
          }
        )
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "🔐 SupabaseAuthContext: Auth state changed. Event:",
        event,
        "Session exists:",
        !!session,
        "User exists:",
        !!session?.user,
        "User ID:",
        session?.user?.id,
        "Timestamp:",
        new Date().toISOString()
      )

      // Set loading to true when auth state changes
      setIsLoading(true)
      console.log("🔐 SupabaseAuthContext: Set loading to true")

      setSession(session)
      setUser(session?.user ?? null)
      console.log("🔐 SupabaseAuthContext: Updated session and user state")

      try {
        if (session?.user) {
          console.log("🔐 SupabaseAuthContext: Loading user profile for:", session.user.id)
          await loadUserProfile(session.user.id)
          console.log("🔐 SupabaseAuthContext: Profile loaded successfully")
        } else {
          console.log("🔐 SupabaseAuthContext: Clearing user profile, store, organization")
          setUserProfile(null)
          setStore(null)
          setOrganization(null)
        }
      } catch (error) {
        console.error("🔐 SupabaseAuthContext: Error during profile loading:", error)
        // Still set loading to false even if profile loading fails
      }

      console.log(
        "🔐 SupabaseAuthContext: Auth state change processed. User:",
        !!session?.user,
        "Session:",
        !!session,
        "isAuthenticated:",
        !!session?.user,
        "Final loading state will be false"
      )
      // Only set loading to false after all async operations complete
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Redirect logic removed - handle redirects in components instead

  useEffect(() => {
    if (user && !userProfile && !isLoading) {
      const profileTimeout = setTimeout(() => {
        console.log("SupabaseAuthContext: Profile loading timeout, creating fallback profile")
        // Create fallback profile if loading takes too long
        setUserProfile({
          id: user.id,
          organization_id: null,
          store_id: null,
          email: user.email || "",
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          role: "seller",
          avatar_url: null,
          status: "active",
          is_store_owner: false,
          permissions: [],
        })
      }, 3000) // 3 second timeout

      return () => clearTimeout(profileTimeout)
    }
  }, [user, userProfile, isLoading])

  // Safety mechanism: Force loading to false after 10 seconds to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.log("SupabaseAuthContext: Force ending loading state after timeout")
        setIsLoading(false)
      }, 10000) // 10 seconds

      return () => clearTimeout(timeout)
    }
  }, [isLoading])

  // Sign up new user and store
  const signUp = async (
    email: string,
    password: string,
    userData: {
      name: string
      storeName: string
      storeType?: StoreType
      businessName?: string
      organizationName?: string
      organizationSlug?: string
      industry?: string
      country?: string
      role?: UserRole
    },
  ) => {
    setIsLoading(true)
    try {
      // Ensure we include a valid CSRF token and send cookies so the server can validate the request
      let csrfToken: string | null = null
      try {
        csrfToken = await getCSRFToken()
        console.log("🔑 SupabaseAuthContext: Obtained CSRF token for signup")
      } catch (csrfErr) {
        console.warn("🔑 SupabaseAuthContext: Failed to obtain CSRF token for signup, proceeding without it:", csrfErr)
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (csrfToken) headers["x-csrf-token"] = csrfToken

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          name: userData.name,
          storeName: userData.storeName,
          storeType: userData.storeType,
          businessName: userData.businessName,
          organizationName: userData.organizationName,
          organizationSlug: userData.organizationSlug,
          industry: userData.industry,
          country: userData.country,
          role: userData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      // Success - redirect to signup success page with email
      window.location.href = `/auth/signup-success?email=${encodeURIComponent(email)}`
    } catch (error: any) {
      console.error("Sign up error:", error)
      throw new Error(error.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  // Sign in existing user
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      console.log("🔑 SupabaseAuthContext: Starting sign in process for:", email)

      // Use the API route instead of direct Supabase client to ensure proper cookie setting
      // Ensure we include a valid CSRF token expected by the server
      let csrfToken: string | null = null
      try {
        csrfToken = await getCSRFToken()
        console.log("🔑 SupabaseAuthContext: Obtained CSRF token for login")
      } catch (csrfErr) {
        console.warn("🔑 SupabaseAuthContext: Failed to obtain CSRF token, proceeding without it:", csrfErr)
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (csrfToken) headers["x-csrf-token"] = csrfToken

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers,
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important for cookie handling
      })

      const data = await response.json();

      if (!response.ok) {
        // CSRF token validation failed on the server
        if (response.status === 403) {
          console.error('🔑 SupabaseAuthContext: Server rejected login - CSRF token validation failed')
          throw new Error('CSRF token validation failed')
        }

        if (data.error?.includes("Email not confirmed")) {
          throw new Error(
            "Email not confirmed. Please check your email and click the confirmation link before logging in.",
          )
        }

        throw new Error(data.error || "Failed to sign in")
      }

      console.log("🔑 SupabaseAuthContext: API login successful, setting session data")

      // Set the user and session state immediately
      setUser(data.user);
      setSession(data.session);

      // Load user profile
      await loadUserProfile(data.user.id);

      console.log("🔑 SupabaseAuthContext: User profile loaded, auth state should update")
      // Ensure the Supabase client also knows about the session so
      // onAuthStateChange handlers fire and state stays consistent.
      try {
        if (data.session) {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          })
          console.log("🔑 SupabaseAuthContext: Supabase client session set")
        }
      } catch (err) {
        console.warn("🔑 SupabaseAuthContext: Failed to set Supabase client session:", err)
      }

      console.log("🔑 SupabaseAuthContext: Sign in process completed successfully");
    } catch (error: any) {
      console.error("🔑 SupabaseAuthContext: Sign in error:", error);
      throw new Error(error.message || "Failed to sign in")
    }
  }

  // Sign out user
  const signOut = async () => {
    setIsLoading(true)
    try {
      // Use Supabase's signOut method directly
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Supabase signOut error:", error)
        // Don't throw here - we still want to clear local state
      }

      // Clear local state (this will happen automatically via auth state listener, but we do it manually too for safety)
      setUser(null)
      setUserProfile(null)
      setStore(null)
      setOrganization(null)
      setSession(null)

      // Redirect to login
      window.location.href = "/login"
    } catch (error: any) {
      console.error("Sign out error:", error)
      // Even if logout fails, clear local state and redirect
      setUser(null)
      setUserProfile(null)
      setStore(null)
      setOrganization(null)
      setSession(null)
      window.location.href = "/login"
    } finally {
      setIsLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      // Ensure CSRF token and cookies are included for state-changing requests
      const csrfToken = await getCSRFToken()
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (csrfToken) headers["x-csrf-token"] = csrfToken

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email")
      }
    } catch (error: any) {
      console.error("Reset password error:", error)
      throw new Error(error.message || "Failed to send reset email")
    }
  }

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      // Get tokens from cookies
      const accessToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sb-access-token="))
        ?.split("=")[1]

      const refreshToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sb-refresh-token="))
        ?.split("=")[1]

      if (!accessToken) {
        throw new Error("No access token found")
      }

      // Ensure CSRF token and cookies are included for state-changing requests
      const csrfToken = await getCSRFToken()
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (csrfToken) headers["x-csrf-token"] = csrfToken

      const response = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          password: newPassword,
          accessToken,
          refreshToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password")
      }
    } catch (error: any) {
      console.error("Update password error:", error)
      throw new Error(error.message || "Failed to update password")
    }
  }

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) throw new Error("No user logged in")

    try {
      const { error } = await supabase.from("users").update(updates).eq("id", user.id)

      if (error) throw error

      // Refresh profile data
      await refreshProfile()
    } catch (error: any) {
      console.error("Update profile error:", error)
      throw new Error(error.message || "Failed to update profile")
    }
  }

  // Refresh user profile data
  const refreshProfile = async () => {
    if (!user) return
    await loadUserProfile(user.id)
  }

  // Check if user has required role
  const hasRole = (roles: UserRole[]): boolean => {
    return userProfile ? roles.includes(userProfile.role) : false
  }

  // Check if store has feature based on subscription
  const hasFeature = (feature: string): boolean => {
    if (!store) return false

    const tierFeatures = FEATURE_FLAGS[store.subscription_plan as keyof typeof FEATURE_FLAGS]
    return tierFeatures[feature as keyof typeof tierFeatures] === true
  }

  // Check if user is super admin
  const isSuperAdmin = userProfile?.role === "super_admin"

  // Permission checking methods
  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!user || !userProfile) return false

    // Super admin has all permissions
    if (userProfile.role === "super_admin") return true

    // Check role-based permissions
    const rolePermissions: Record<string, string[]> = {
      admin: [
        "users.read",
        "users.create",
        "users.update",
        "users.delete",
        "users.invite",
        "products.read",
        "products.create",
        "products.update",
        "products.delete",
        "orders.read",
        "orders.create",
        "orders.update",
        "orders.delete",
        "orders.void",
        "categories.read",
        "categories.create",
        "categories.update",
        "categories.delete",
        "customers.read",
        "customers.create",
        "customers.update",
        "customers.delete",
        "suppliers.read",
        "suppliers.create",
        "suppliers.update",
        "suppliers.delete",
        "reports.read",
        "reports.export",
        "inventory.read",
        "inventory.update",
        "settings.read",
        "settings.update",
        "stores.read",
        "stores.update",
      ],
      manager: [
        "products.read",
        "products.create",
        "products.update",
        "orders.read",
        "orders.create",
        "orders.update",
        "orders.void",
        "categories.read",
        "categories.create",
        "categories.update",
        "customers.read",
        "customers.create",
        "customers.update",
        "suppliers.read",
        "suppliers.create",
        "suppliers.update",
        "reports.read",
        "reports.export",
        "inventory.read",
        "inventory.update",
      ],
      cashier: [
        "products.read",
        "orders.read",
        "orders.create",
        "orders.update",
        "customers.read",
        "customers.create",
        "customers.update",
        "inventory.read",
      ],
      seller: ["products.read", "orders.read", "orders.create", "customers.read", "customers.create"],
    }

    const userRolePermissions = rolePermissions[userProfile.role] || []
    const userCustomPermissions = userProfile.permissions || []

    return userRolePermissions.includes(permission) || userCustomPermissions.includes(permission)
  }

  const getUserPermissions = async (): Promise<any[]> => {
    if (!userProfile) return []

    // Super admin has all permissions
    if (userProfile.role === "super_admin") {
      return [
        "users.*",
        "products.*",
        "orders.*",
        "categories.*",
        "customers.*",
        "suppliers.*",
        "reports.*",
        "inventory.*",
        "settings.*",
        "stores.*",
      ]
    }

    // Return role-based permissions
    const rolePermissions: Record<string, string[]> = {
      admin: [
        "users.read",
        "users.create",
        "users.update",
        "users.delete",
        "users.invite",
        "products.read",
        "products.create",
        "products.update",
        "products.delete",
        "orders.read",
        "orders.create",
        "orders.update",
        "orders.delete",
        "orders.void",
        "categories.read",
        "categories.create",
        "categories.update",
        "categories.delete",
        "customers.read",
        "customers.create",
        "customers.update",
        "customers.delete",
        "suppliers.read",
        "suppliers.create",
        "suppliers.update",
        "suppliers.delete",
        "reports.read",
        "reports.export",
        "inventory.read",
        "inventory.update",
        "settings.read",
        "settings.update",
        "stores.read",
        "stores.update",
      ],
      manager: [
        "products.read",
        "products.create",
        "products.update",
        "orders.read",
        "orders.create",
        "orders.update",
        "orders.void",
        "categories.read",
        "categories.create",
        "categories.update",
        "customers.read",
        "customers.create",
        "customers.update",
        "suppliers.read",
        "suppliers.create",
        "suppliers.update",
        "reports.read",
        "reports.export",
        "inventory.read",
        "inventory.update",
      ],
      cashier: [
        "products.read",
        "orders.read",
        "orders.create",
        "orders.update",
        "customers.read",
        "customers.create",
        "customers.update",
        "inventory.read",
      ],
      seller: ["products.read", "orders.read", "orders.create", "customers.read", "customers.create"],
    }

    const basePermissions = rolePermissions[userProfile.role] || []
    const customPermissions = userProfile.permissions || []

    return [...basePermissions, ...customPermissions]
  }

  const checkPermission = async (resource: string, action: string): Promise<boolean> => {
    return await hasPermission(`${resource}.${action}`)
  }

  // 2FA methods
  const setup2FA = async (): Promise<{ secret: string; qrCode: string; otpauthUrl: string }> => {
    const csrfToken = await getCSRFToken()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (csrfToken) headers["x-csrf-token"] = csrfToken

    const response = await fetch("/api/auth/2fa/setup", {
      method: "POST",
      headers,
      credentials: "include",
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to setup 2FA")
    }

    return data
  }

  const verify2FA = async (token: string): Promise<boolean> => {
    const csrfToken = await getCSRFToken()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (csrfToken) headers["x-csrf-token"] = csrfToken

    const response = await fetch("/api/auth/2fa/verify", {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ token }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to verify 2FA")
    }

    return true
  }

  const disable2FA = async (token: string): Promise<void> => {
    const csrfToken = await getCSRFToken()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (csrfToken) headers["x-csrf-token"] = csrfToken

    const response = await fetch("/api/auth/2fa/setup", {
      method: "DELETE",
      headers,
      credentials: "include",
      body: JSON.stringify({ token }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Failed to disable 2FA")
    }
  }

  // Session management methods
  const getActiveSessions = async (): Promise<any[]> => {
  const response = await fetch("/api/auth/sessions", { credentials: "include" })
  const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to get sessions")
    }

    return data.sessions || []
  }

  const terminateSession = async (sessionId: string): Promise<void> => {
    const csrfToken = await getCSRFToken()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (csrfToken) headers["x-csrf-token"] = csrfToken

    const response = await fetch("/api/auth/sessions", {
      method: "DELETE",
      headers,
      credentials: "include",
      body: JSON.stringify({ sessionId }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Failed to terminate session")
    }
  }

  // Check if 2FA is enabled
  const is2FAEnabled = userProfile?.two_factor_enabled || false

  // Super admin methods
  const getAllOrganizations = async (): Promise<Organization[]> => {
    if (!isSuperAdmin) throw new Error("Unauthorized")

    try {
      const { data, error } = await supabase.from("organizations").select("*").order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error("Error fetching organizations:", error)
      throw new Error(error.message || "Failed to fetch organizations")
    }
  }

  const updateOrganizationStatus = async (orgId: string, status: string): Promise<void> => {
    if (!isSuperAdmin) throw new Error("Unauthorized")

    try {
      const { error } = await supabase.from("organizations").update({ subscription_status: status }).eq("id", orgId)

      if (error) throw error
    } catch (error: any) {
      console.error("Error updating organization status:", error)
      throw new Error(error.message || "Failed to update organization status")
    }
  }

  const getPlatformStats = async (): Promise<any> => {
    if (!isSuperAdmin) throw new Error("Unauthorized")

    try {
      // Get organization stats
      const { data: orgStats, error: orgError } = await supabase
        .from("organizations")
        .select("subscription_tier, subscription_status, created_at")

      if (orgError) throw orgError

      // Get user stats
      const { data: userStats, error: userError } = await supabase.from("users").select("role, created_at")

      if (userError) throw userError

      // Calculate stats
      const totalOrganizations = orgStats?.length || 0
      const activeOrganizations = orgStats?.filter((org) => org.subscription_status === "active").length || 0
      const totalUsers = userStats?.length || 0

      const tierBreakdown =
        orgStats?.reduce((acc: any, org) => {
          acc[org.subscription_tier] = (acc[org.subscription_tier] || 0) + 1
          return acc
        }, {}) || {}

      return {
        totalOrganizations,
        activeOrganizations,
        totalUsers,
        tierBreakdown,
        recentOrganizations: orgStats?.slice(0, 5) || [],
      }
    } catch (error: any) {
      console.error("Error fetching platform stats:", error)
      throw new Error(error.message || "Failed to fetch platform stats")
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    store,
    organization,
    session,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
    hasRole,
    hasFeature,
    isSuperAdmin,
    // Permission system
    hasPermission,
    getUserPermissions,
    checkPermission,
    // 2FA methods
    setup2FA,
    verify2FA,
    disable2FA,
    is2FAEnabled,
    // Session management
    getActiveSessions,
    terminateSession,
    // Super admin methods
    getAllOrganizations,
    updateOrganizationStatus,
    getPlatformStats,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useSupabaseAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider")
  }
  return context
}

// Backward compatibility hook
export const useAuth = useSupabaseAuth
