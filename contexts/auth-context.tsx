"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/authService"
import type { AuthResponse } from "@/types"
import type { UserRole } from "@/lib/constants"

interface AuthContextType {
  user: AuthResponse | null
  userRole: UserRole | null
  setUserRole: (role: UserRole | null) => void
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>
  logout: () => Promise<void>
  getUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // On mount, try to fetch user if token exists
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (token) {
      authService.getUser()
        .then((data) => {
          if (data && data.user) {
            setUser(data)
            setUserRole(data.user.role as UserRole)
            localStorage.setItem("userRole", data.user.role)
            sessionStorage.setItem("userRole", data.user.role)
          } else {
            setUser(null)
            setUserRole(null)
          }
        })
        .catch(() => {
          setUser(null)
          setUserRole(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    const data = await authService.login(email, password)
    setUser(data)
    if (data.user?.role) {
      setUserRole(data.user.role as UserRole)
      localStorage.setItem("userRole", data.user.role)
      sessionStorage.setItem("userRole", data.user.role)
    }
    setIsLoading(false)
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    const data = await authService.register(name, email, password, password_confirmation)
    setUser(data)
    if (data.user?.role) {
      setUserRole(data.user.role as UserRole)
      localStorage.setItem("userRole", data.user.role)
      sessionStorage.setItem("userRole", data.user.role)
    }
    setIsLoading(false)
  }

  const logout = async () => {
    setIsLoading(true)
    await authService.logout()
    setUser(null)
    setUserRole(null)
    localStorage.removeItem("userRole")
    sessionStorage.removeItem("userRole")
    setIsLoading(false)
  }

  const getUser = async () => {
    setIsLoading(true)
    try {
      const data = await authService.getUser()
      if (data && data.user) {
        setUser(data)
        setUserRole(data.user.role as UserRole)
        localStorage.setItem("userRole", data.user.role)
        sessionStorage.setItem("userRole", data.user.role)
      } else {
        setUser(null)
        setUserRole(null)
      }
    } catch {
      setUser(null)
      setUserRole(null)
    }
    setIsLoading(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        setUserRole,
        isLoading,
        login,
        register,
        logout,
        getUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
