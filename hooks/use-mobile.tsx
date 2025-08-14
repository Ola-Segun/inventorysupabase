"use client"

import { useState, useEffect } from "react"

/**
 * A hook that returns true if the viewport width is less than 768px (md breakpoint in Tailwind)
 */
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Function to check if viewport is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check on initial render
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Clean up event listener
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

// Also export as default for flexibility
export default useMobile

