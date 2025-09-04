import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Client-side Supabase client
export const supabase = createClientComponentClient<Database>()

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key && !url.includes('your-project') && !key.includes('your-anon-key')
}

// Server-side Supabase client with service role (for admin operations)
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper function to get user's organization ID from JWT
export const getUserOrganizationId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.user_metadata?.organization_id || null
}

// Helper function to check if user has required role
export const checkUserRole = async (requiredRoles: string[]) => {
  const { data: { user } } = await supabase.auth.getUser()
  const userRole = user?.user_metadata?.role
  return userRole && requiredRoles.includes(userRole)
}