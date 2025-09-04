"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"
import { Loader2 } from "lucide-react"

interface SetupGuardProps {
  children: React.ReactNode
  requireSetup?: boolean
}

export function SetupGuard({ children, requireSetup = true }: SetupGuardProps) {
  const { user, store, isLoading } = useSupabaseAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (requireSetup && store && store.status !== 'active') {
      router.push('/setup')
      return
    }

    // Only redirect if we're not already on the target page
    if (!requireSetup && store && store.status === 'active' && pathname !== '/dashboard') {
      router.push('/dashboard')
      return
    }
  }, [user, store, isLoading, router, requireSetup, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requireSetup && store && store.status !== 'active') {
    return null
  }

  if (!requireSetup && store && store.status === 'active') {
    return null
  }

  return <>{children}</>
}