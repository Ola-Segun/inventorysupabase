"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "../services/authService";
import { Loader } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string, 
    email: string, 
    password: string, 
    password_confirmation: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication status...');
      const userData = await authService.getUser();
      if (userData) {
        console.log('✅ User authenticated:', userData);
        setUser(userData);
      } else {
        console.log('❌ No user found');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (initialized) return;
      
      console.log('🚀 Initializing authentication...');
      setIsLoading(true);
      
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        setInitialized(true);
        console.log('✅ Authentication initialized');
      }
    };

    initializeAuth();
  }, [initialized]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('🔄 Starting login process...');
      setIsLoading(true);
      
      const data = await authService.login(email, password);
      console.log('✅ Login successful:', data.user);
      
      setUser(data.user);
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    password_confirmation: string
  ): Promise<void> => {
    try {
      console.log('🔄 Starting registration process...');
      setIsLoading(true);
      
      const data = await authService.register(name, email, password, password_confirmation);
      console.log('✅ Registration successful:', data.user);
      
      setUser(data.user);
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🔄 Starting logout process...');
      setIsLoading(true);
      
      await authService.logout();
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear user state even if logout request fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner only during initial load, not for every auth operation
  if (!initialized && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-2" size={32} />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      isLoading, 
      logout, 
      isAuthenticated,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};