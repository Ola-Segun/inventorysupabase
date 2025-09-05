"use client"

import { useEffect, useState } from "react"
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
  const [mounted, setMounted] = useState(false)

  // track mount so the initial client render matches server HTML and
  // redirect logic only runs after hydration to avoid mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
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
  }, [mounted, user, store, isLoading, router, requireSetup, pathname])

  // Until mounted, render the same children as the server to avoid
  // hydration mismatches. Once mounted, show the loading state if needed.
  if (!mounted) {
    return <>{children}</>
  }

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