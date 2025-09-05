import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null
  const match = header.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='))
  if (!match) return null
  return decodeURIComponent(match.split('=').slice(1).join('='))
}

export async function getServerUserFromRequest(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const accessToken = parseCookie(cookieHeader, 'sb-access-token')

    if (!accessToken) return null

    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)
    if (userError || !userData?.user) return null

    const user = userData.user

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, role, organization_id, store_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) return { id: user.id }

    return {
      id: user.id,
      role: profile.role,
      organization_id: profile.organization_id,
      store_id: profile.store_id
    }
  } catch (err) {
    console.error('getServerUserFromRequest error', err)
    return null
  }
}
