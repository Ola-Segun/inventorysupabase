// pages/debug.js
"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DebugPage() {
  const [authState, setAuthState] = useState({})
  
  useEffect(() => {
    const state = {
      userRole: localStorage.getItem('userRole'),
      userEmail: localStorage.getItem('userEmail'),
      cookies: document.cookie,
      pathname: window.location.pathname
    }
    setAuthState(state)
  }, [])
  
  const clearAll = () => {
    localStorage.clear()
    sessionStorage.clear()
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    setAuthState({})
    window.location.href = '/login'
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(authState, null, 2)}</pre>
      <Button onClick={clearAll} className="mt-4">Clear All & Logout</Button>
    </div>
  )
}