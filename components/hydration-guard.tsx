"use client"

import { useEffect, useState } from 'react'

interface HydrationGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Component to guard against hydration mismatches caused by browser extensions
 * that modify the DOM before React hydrates
 */
export function HydrationGuard({ children, fallback }: HydrationGuardProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Clean up any browser extension attributes that might cause hydration mismatches
    const cleanupBrowserExtensions = () => {
      const elements = document.querySelectorAll('[bis_skin_checked]')
      elements.forEach(element => {
        element.removeAttribute('bis_skin_checked')
      })

      console.log('🔧 DEBUG: Cleaned up browser extension attributes:', elements.length)
    }

    // Run cleanup immediately and after a short delay to catch dynamic insertions
    cleanupBrowserExtensions()
    const timeoutId = setTimeout(cleanupBrowserExtensions, 100)

    // Mark as hydrated
    setIsHydrated(true)

    return () => clearTimeout(timeoutId)
  }, [])

  // Show fallback during hydration to prevent mismatches
  if (!isHydrated) {
    return fallback || <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return <>{children}</>
}

/**
 * Hook to detect and clean up browser extension interference
 */
export function useHydrationGuard() {
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            if (element.hasAttribute('bis_skin_checked')) {
              element.removeAttribute('bis_skin_checked')
              console.log('🔧 DEBUG: Removed bis_skin_checked from dynamically added element')
            }
          }
        })
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['bis_skin_checked']
    })

    return () => observer.disconnect()
  }, [])
}