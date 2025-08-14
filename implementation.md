// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/authService';

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
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount and after refresh
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const userData = await authService.getUser();
      
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize auth state
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Listen for auth state changes across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_logout') {
        setUser(null);
        setIsAuthenticated(false);
      } else if (e.key === 'auth_login') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Notify other tabs about login
      localStorage.setItem('auth_login', Date.now().toString());
      localStorage.removeItem('auth_login');
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      
      // Notify other tabs about logout
      localStorage.setItem('auth_logout', Date.now().toString());
      localStorage.removeItem('auth_logout');
    }
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// hooks/useAuthGuard.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UseAuthGuardOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

export function useAuthGuard({ 
  redirectTo = '/login', 
  requireAuth = true 
}: UseAuthGuardOptions = {}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
      } else if (!requireAuth && isAuthenticated) {
        router.push('/dashboard'); // or wherever authenticated users should go
      }
    }
  }, [isAuthenticated, isLoading, router, redirectTo, requireAuth]);

  return { isAuthenticated, isLoading };
}

// components/AuthGuard.tsx
'use client';

import React, { ReactNode } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  fallback = null, 
  requireAuth = true,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthGuard({ 
    requireAuth, 
    redirectTo 
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return fallback;
  }

  if (!requireAuth && isAuthenticated) {
    return fallback;
  }

  return <>{children}</>;
}

// middleware.ts (in your root directory)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  
  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/settings'];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Get authentication cookies
  const sessionCookie = request.cookies.get('laravel_session');
  const xsrfToken = request.cookies.get('XSRF-TOKEN');

  // Simple check for authentication (you might want to make this more robust)
  const isAuthenticated = !!(sessionCookie && xsrfToken);

  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

// app/layout.tsx (or pages/_app.tsx for Pages Router)
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

// Example usage in a protected page
// app/dashboard/page.tsx
'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <AuthGuard>
      <div className="p-6">
        <h1>Dashboard</h1>
        <p>Welcome, {user?.name}!</p>
        <button 
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </AuthGuard>
  );
}

// Example usage in a login page
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await login(email, password);
      // Navigation will be handled by the AuthProvider/middleware
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}


// services/authService.ts
import axios, { AxiosResponse } from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
  role?: string;
}

interface AuthResponse {
  user: User;
  message: string;
}

interface ProfileResponse {
  user: User;
  message: string;
}

class AuthService {
  private baseURL = 'http://localhost:8000';
  private currentUser: User | null = null;

  private api = axios.create({
    baseURL: this.baseURL,
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Get CSRF token from cookies
  private getCsrfTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const xsrfCookie = cookies.find(cookie => 
      cookie.trim().startsWith('XSRF-TOKEN=')
    );
    
    if (xsrfCookie) {
      return decodeURIComponent(xsrfCookie.split('=')[1]);
    }
    
    return null;
  }

  // Get CSRF cookie from server
  private async getCsrfCookie(): Promise<void> {
    try {
      console.log('🍪 Requesting CSRF cookie from Laravel...');
      
      await axios.get(`${this.baseURL}/sanctum/csrf-cookie`, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('✅ CSRF cookie request completed');
    } catch (error) {
      console.error('❌ Error getting CSRF cookie:', error);
      throw error;
    }
  }

  // Clear all authentication cookies
  private clearAuthCookies(): void {
    if (typeof document === 'undefined') return;

    // List of common Laravel/Sanctum auth cookies to clear
    const cookiesToClear = [
      'XSRF-TOKEN',
      'laravel_session',
      'remember_web',
      // Add any other auth-related cookies your app uses
    ];

    cookiesToClear.forEach(cookieName => {
      // Clear cookie for current domain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      // Clear cookie for parent domain (in case of subdomain)
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      // Clear cookie without domain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }

  // Clear local authentication state
  private clearLocalAuthState(): void {
    this.currentUser = null;
    
    // Clear any localStorage/sessionStorage items if you use them
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('authToken');
    }
  }

  // Make authenticated request with CSRF token
  private async makeAuthenticatedRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any
  ): Promise<AxiosResponse<T>> {
    await this.getCsrfCookie();
    
    const csrfToken = this.getCsrfTokenFromCookie();
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = csrfToken;
    }

    return this.api.request({
      method,
      url,
      data,
      headers,
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔄 Starting login process...');
      
      await this.getCsrfCookie();
      const csrfToken = this.getCsrfTokenFromCookie();

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
      }

      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${this.baseURL}/api/login`,
        { email, password },
        { 
          headers,
          withCredentials: true 
        }
      );

      // Store user data locally after successful login
      this.currentUser = response.data.user;

      console.log('✅ Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 
                       error.response?.data?.errors?.email?.[0] || 
                       'Login failed';
        throw new Error(message);
      }
      throw new Error('Unexpected error during login');
    }
  }

  async register(
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ): Promise<AuthResponse> {
    try {
      console.log('Attempting registration...');
      
      const response: AxiosResponse<AuthResponse> = await this.makeAuthenticatedRequest<AuthResponse>(
        'post',
        '/api/register',
        { name, email, password, password_confirmation }
      );

      // Store user data locally after successful registration
      this.currentUser = response.data.user;

      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 
                       'Registration failed';
        throw new Error(message);
      }
      throw new Error('Unexpected error during registration');
    }
  }

  async getUser(forceRefresh: boolean = false): Promise<User | null> {
    try {
      // Return cached user if available and not forcing refresh
      if (this.currentUser && !forceRefresh) {
        return this.currentUser;
      }

      const response: AxiosResponse<ProfileResponse> = await this.api.get('/api/profile');
      this.currentUser = response.data.user;
      return response.data.user;
    } catch (error) {
      console.error('Get user error:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Clear local state if user is not authenticated
        this.clearLocalAuthState();
      }
      this.currentUser = null;
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🔄 Starting logout process...');

      // Always clear local state first
      this.clearLocalAuthState();

      // Attempt to logout from server
      try {
        await this.makeAuthenticatedRequest('post', '/api/logout');
        console.log('✅ Server logout successful');
      } catch (serverError) {
        console.warn('⚠️ Server logout failed, but continuing with local cleanup:', serverError);
        // Don't throw here - we still want to clear local state
      }

      // Clear authentication cookies
      this.clearAuthCookies();

      console.log('✅ Logout process completed');

      // Optional: Redirect to login page or trigger app state update
      // window.location.href = '/login';
      // or emit an event for your app to handle
      // this.emitLogoutEvent();

    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Even if logout fails, clear local state
      this.clearLocalAuthState();
      this.clearAuthCookies();
      
      // Don't throw the error - logout should always succeed locally
      console.log('🔄 Local logout completed despite server error');
    }
  }

  // Force logout - useful for handling 401 responses
  forceLogout(): void {
    console.log('🚨 Force logout triggered');
    this.clearLocalAuthState();
    this.clearAuthCookies();
    
    // Redirect to login or emit event
    // window.location.href = '/login';
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getUser();
      return !!user;
    } catch {
      return false;
    }
  }

  // Get current user without API call
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Add response interceptor to handle 401 responses globally
  setupResponseInterceptor(): void {
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('🚨 401 Unauthorized - forcing logout');
          this.forceLogout();
        }
        return Promise.reject(error);
      }
    );
  }
}

export const authService = new AuthService();

// Setup response interceptor when the service is created
authService.setupResponseInterceptor();


// types/index.ts - Main types file

// ==================== COMMON/BASE TYPES ====================

// Base entity with common fields
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// Pagination types
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// CRUD operation types
export type CrudOperation = 'create' | 'read' | 'update' | 'delete';

// Form states
export type FormMode = 'create' | 'edit' | 'view';

// ==================== AUTH TYPES ====================

export interface User extends BaseEntity {
  name: string;
  email: string;
  email_verified_at?: string | null;
  role?: string;
  avatar?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface AuthResponse {
  user: User;
  message: string;
  token?: string; // if using token-based auth
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// ==================== EXAMPLE ENTITY TYPES ====================

// Product entity example
export interface Product extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  sku: string;
  category_id: number;
  category?: Category;
  stock_quantity: number;
  status: 'active' | 'inactive' | 'discontinued';
  images?: ProductImage[];
  tags?: Tag[];
}

// Product form data (for create/update)
export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  sku: string;
  category_id: number;
  stock_quantity: number;
  status: 'active' | 'inactive' | 'discontinued';
  image_files?: File[];
  tag_ids?: number[];
}

// Category entity
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  parent?: Category;
  children?: Category[];
  products_count?: number;
  status: 'active' | 'inactive';
}

export interface CategoryFormData {
  name: string;
  description?: string;
  parent_id?: number;
  status: 'active' | 'inactive';
}

// Product Image
export interface ProductImage extends BaseEntity {
  product_id: number;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

// Tag entity
export interface Tag extends BaseEntity {
  name: string;
  slug: string;
  color?: string;
}

// ==================== CRUD HOOKS TYPES ====================

// Generic CRUD state
export interface CrudState<T> {
  items: T[];
  currentItem: T | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  formMode: FormMode;
  pagination?: PaginationMeta;
}

// CRUD actions
export interface CrudActions<T, TFormData = Partial<T>> {
  fetchItems: (params?: QueryParams) => Promise<void>;
  fetchItem: (id: number) => Promise<void>;
  createItem: (data: TFormData) => Promise<T>;
  updateItem: (id: number, data: TFormData) => Promise<T>;
  deleteItem: (id: number) => Promise<void>;
  setCurrentItem: (item: T | null) => void;
  setFormMode: (mode: FormMode) => void;
  clearError: () => void;
}

// Query parameters for filtering/searching
export interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// ==================== FORM TYPES ====================

// Generic form state
export interface FormState<T> {
  data: T;
  errors: Record<keyof T, string>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

// Form field configuration
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'file' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: any; label: string }[];
  validation?: ValidationRule[];
}

// Validation rules
export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern';
  value?: any;
  message: string;
}

// ==================== TABLE/LIST TYPES ====================

// Table column configuration
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: T) => React.ReactNode;
  hidden?: boolean;
}

// Table action
export interface TableAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  onClick: (item: T) => void;
  show?: (item: T) => boolean;
}

// List/Table props
export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onSearch?: (query: string) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
}

// ==================== NOTIFICATION TYPES ====================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}

// ==================== MODAL/DIALOG TYPES ====================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  persistent?: boolean;
}

export interface ConfirmDialogProps extends ModalProps {
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
}

// ==================== UPLOAD TYPES ====================

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onFilesChange: (files: UploadFile[]) => void;
  onUpload?: (files: File[]) => Promise<string[]>;
}

// ==================== SPECIFIC ENTITY EXTENSIONS ====================

// Extend base types for specific entities
export interface ProductWithRelations extends Product {
  category: Category;
  images: ProductImage[];
  tags: Tag[];
}

// Search/Filter specific types
export interface ProductFilters {
  category_id?: number;
  price_min?: number;
  price_max?: number;
  status?: Product['status'];
  in_stock?: boolean;
  tags?: number[];
}

export interface CategoryFilters {
  parent_id?: number;
  status?: Category['status'];
  has_products?: boolean;
}

// ==================== UTILITY TYPES ====================

// Make all properties optional for updates
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Omit common fields for form data
export type FormDataType<T extends BaseEntity> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

// Select options type
export interface SelectOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
}

// API endpoints configuration
export interface ApiEndpoints {
  [key: string]: {
    list: string;
    show: string;
    create: string;
    update: string;
    delete: string;
  };
}

// ==================== EXPORT COLLECTIONS ====================

// Export commonly used type collections
export type {
  // Auth related
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  
  // Product related
  Product,
  ProductFormData,
  ProductWithRelations,
  ProductFilters,
  
  // Category related
  Category,
  CategoryFormData,
  CategoryFilters,
  
  // Generic CRUD
  CrudState,
  CrudActions,
  FormState,
  QueryParams,
  
  // UI Components
  TableColumn,
  TableAction,
  DataTableProps,
  ModalProps,
  ConfirmDialogProps,
  
  // Utility
  BaseEntity,
  PaginatedResponse,
  ApiResponse,
  SelectOption,
};

// Type guards
export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.id === 'number' && typeof obj.email === 'string';
};

export const isProduct = (obj: any): obj is Product => {
  return obj && typeof obj.id === 'number' && typeof obj.name === 'string' && typeof obj.price === 'number';
};

// Default values
export const defaultQueryParams: QueryParams = {
  page: 1,
  per_page: 15,
  sort_by: 'created_at',
  sort_order: 'desc',
};

export const defaultPagination: PaginationMeta = {
  current_page: 1,
  from: null,
  last_page: 1,
  per_page: 15,
  to: null,
  total: 0,
};



// services/baseService.ts - Generic CRUD service
import axios, { AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types';

export abstract class BaseService<T, TFormData = Partial<T>> {
  protected baseURL = 'http://localhost:8000/api';
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  protected api = axios.create({
    baseURL: this.baseURL,
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Get all items with optional query parameters
  async getAll(params?: QueryParams): Promise<PaginatedResponse<T>> {
    const response: AxiosResponse<PaginatedResponse<T>> = await this.api.get(
      this.endpoint,
      { params }
    );
    return response.data;
  }

  // Get single item by ID
  async getById(id: number): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.get(
      `${this.endpoint}/${id}`
    );
    return response.data.data!;
  }

  // Create new item
  async create(data: TFormData): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.post(
      this.endpoint,
      data
    );
    return response.data.data!;
  }

  // Update existing item
  async update(id: number, data: TFormData): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.put(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data.data!;
  }

  // Delete item
  async delete(id: number): Promise<void> {
    await this.api.delete(`${this.endpoint}/${id}`);
  }

  // Bulk delete
  async bulkDelete(ids: number[]): Promise<void> {
    await this.api.delete(this.endpoint, {
      data: { ids }
    });
  }
}

// services/productService.ts - Specific product service
import { Product, ProductFormData, ProductFilters } from '@/types';
import { BaseService } from './baseService';

class ProductService extends BaseService<Product, ProductFormData> {
  constructor() {
    super('/products');
  }

  // Product-specific methods
  async getByCategory(categoryId: number, params?: QueryParams) {
    const response = await this.api.get(`/categories/${categoryId}/products`, { params });
    return response.data;
  }

  async search(query: string, filters?: ProductFilters) {
    const response = await this.api.get(`${this.endpoint}/search`, {
      params: { q: query, ...filters }
    });
    return response.data;
  }

  async updateStock(id: number, quantity: number) {
    const response = await this.api.patch(`${this.endpoint}/${id}/stock`, {
      quantity
    });
    return response.data;
  }

  async uploadImages(id: number, files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('images[]', file));

    const response = await this.api.post(
      `${this.endpoint}/${id}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
}

export const productService = new ProductService();

// services/categoryService.ts
import { Category, CategoryFormData } from '@/types';
import { BaseService } from './baseService';

class CategoryService extends BaseService<Category, CategoryFormData> {
  constructor() {
    super('/categories');
  }

  async getTree() {
    const response = await this.api.get(`${this.endpoint}/tree`);
    return response.data;
  }

  async getChildren(parentId: number) {
    const response = await this.api.get(`${this.endpoint}/${parentId}/children`);
    return response.data;
  }
}

export const categoryService = new CategoryService();

// hooks/useCRUD.ts - Generic CRUD hook
import { useState, useCallback } from 'react';
import { CrudState, CrudActions, FormMode, QueryParams } from '@/types';
import { BaseService } from '@/services/baseService';

export function useCRUD<T, TFormData = Partial<T>>(
  service: BaseService<T, TFormData>,
  initialState?: Partial<CrudState<T>>
): CrudState<T> & CrudActions<T, TFormData> {
  const [state, setState] = useState<CrudState<T>>({
    items: [],
    currentItem: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    formMode: 'create',
    pagination: undefined,
    ...initialState,
  });

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const fetchItems = useCallback(async (params?: QueryParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await service.getAll(params);
      
      setState(prev => ({
        ...prev,
        items: response.data,
        pagination: response.meta,
        isLoading: false,
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch items');
      setLoading(false);
    }
  }, [service, setLoading, setError]);

  const fetchItem = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const item = await service.getById(id);
      
      setState(prev => ({
        ...prev,
        currentItem: item,
        isLoading: false,
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch item');
      setLoading(false);
    }
  }, [service, setLoading, setError]);

  const createItem = useCallback(async (data: TFormData): Promise<T> => {
    try {
      setSubmitting(true);
      setError(null);
      
      const newItem = await service.create(data);
      
      setState(prev => ({
        ...prev,
        items: [newItem, ...prev.items],
        currentItem: newItem,
        isSubmitting: false,
      }));
      
      return newItem;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create item');
      setSubmitting(false);
      throw error;
    }
  }, [service, setSubmitting, setError]);

  const updateItem = useCallback(async (id: number, data: TFormData): Promise<T> => {
    try {
      setSubmitting(true);
      setError(null);
      
      const updatedItem = await service.update(id, data);
      
      setState(prev => ({
        ...prev,
        items: prev.items.map(item => 
          (item as any).id === id ? updatedItem : item
        ),
        currentItem: updatedItem,
        isSubmitting: false,
      }));
      
      return updatedItem;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update item');
      setSubmitting(false);
      throw error;
    }
  }, [service, setSubmitting, setError]);

  const deleteItem = useCallback(async (id: number): Promise<void> => {
    try {
      setSubmitting(true);
      setError(null);
      
      await service.delete(id);
      
      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => (item as any).id !== id),
        currentItem: prev.currentItem && (prev.currentItem as any).id === id 
          ? null 
          : prev.currentItem,
        isSubmitting: false,
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete item');
      setSubmitting(false);
      throw error;
    }
  }, [service, setSubmitting, setError]);

  const setCurrentItem = useCallback((item: T | null) => {
    setState(prev => ({ ...prev, currentItem: item }));
  }, []);

  const setFormMode = useCallback((mode: FormMode) => {
    setState(prev => ({ ...prev, formMode: mode }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    ...state,
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    setCurrentItem,
    setFormMode,
    clearError,
  };
}

// hooks/useProducts.ts - Specific product hook
import { Product, ProductFormData, ProductFilters, QueryParams } from '@/types';
import { productService } from '@/services/productService';
import { useCRUD } from './useCRUD';
import { useCallback } from 'react';

export function useProducts() {
  const crud = useCRUD<Product, ProductFormData>(productService);

  const searchProducts = useCallback(async (query: string, filters?: ProductFilters) => {
    try {
      crud.setLoading(true);
      crud.clearError();
      
      const response = await productService.search(query, filters);
      
      crud.setState(prev => ({
        ...prev,
        items: response.data,
        pagination: response.meta,
        isLoading: false,
      }));
    } catch (error) {
      crud.setError(error instanceof Error ? error.message : 'Search failed');
    }
  }, []);

  const updateStock = useCallback(async (id: number, quantity: number) => {
    try {
      await productService.updateStock(id, quantity);
      // Refresh the item
      await crud.fetchItem(id);
    } catch (error) {
      crud.setError(error instanceof Error ? error.message : 'Failed to update stock');
      throw error;
    }
  }, [crud]);

  const uploadImages = useCallback(async (id: number, files: File[]) => {
    try {
      crud.setSubmitting(true);
      const response = await productService.uploadImages(id, files);
      await crud.fetchItem(id); // Refresh to get updated images
      return response;
    } catch (error) {
      crud.setError(error instanceof Error ? error.message : 'Failed to upload images');
      throw error;
    } finally {
      crud.setSubmitting(false);
    }
  }, [crud]);

  return {
    ...crud,
    searchProducts,
    updateStock,
    uploadImages,
  };
}

// hooks/useForm.ts - Generic form hook
import { useState, useCallback, useEffect } from 'react';
import { FormState } from '@/types';

export function useForm<T extends Record<string, any>>(
  initialData: T,
  validationRules?: Partial<Record<keyof T, (value: any) => string | null>>
) {
  const [formState, setFormState] = useState<FormState<T>>({
    data: initialData,
    errors: {} as Record<keyof T, string>,
    isDirty: false,
    isValid: true,
    isSubmitting: false,
  });

  const validateField = useCallback((name: keyof T, value: any): string | null => {
    const rule = validationRules?.[name];
    return rule ? rule(value) : null;
  }, [validationRules]);

  const validateForm = useCallback((): boolean => {
    if (!validationRules) return true;

    const errors: Record<keyof T, string> = {} as Record<keyof T, string>;
    let isValid = true;

    Object.keys(formState.data).forEach((key) => {
      const error = validateField(key as keyof T, formState.data[key as keyof T]);
      if (error) {
        errors[key as keyof T] = error;
        isValid = false;
      }
    });

    setFormState(prev => ({ ...prev, errors, isValid }));
    return isValid;
  }, [formState.data, validateField, validationRules]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setFormState(prev => {
      const newData = { ...prev.data, [name]: value };
      const error = validateField(name, value);
      const newErrors = { ...prev.errors };
      
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }

      return {
        ...prev,
        data: newData,
        errors: newErrors,
        isDirty: true,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, [validateField]);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
      isValid: false,
    }));
  }, []);

  const setFormData = useCallback((data: Partial<T>) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, ...data },
      isDirty: true,
    }));
  }, []);

  const resetForm = useCallback((newData?: T) => {
    setFormState({
      data: newData || initialData,
      errors: {} as Record<keyof T, string>,
      isDirty: false,
      isValid: true,
      isSubmitting: false,
    });
  }, [initialData]);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState(prev => ({ ...prev, isSubmitting }));
  }, []);

  return {
    ...formState,
    setFieldValue,
    setFieldError,
    setFormData,
    resetForm,
    validateForm,
    setSubmitting,
  };
}

// Example usage in a component
// components/ProductForm.tsx
/*
import { useForm } from '@/hooks/useForm';
import { useProducts } from '@/hooks/useProducts';
import { ProductFormData } from '@/types';

export function ProductForm({ productId, onSuccess }: { productId?: number; onSuccess?: () => void }) {
  const { createItem, updateItem, currentItem, isSubmitting } = useProducts();
  
  const form = useForm<ProductFormData>(
    {
      name: '',
      description: '',
      price: 0,
      sku: '',
      category_id: 0,
      stock_quantity: 0,
      status: 'active',
    },
    {
      name: (value) => !value?.trim() ? 'Name is required' : null,
      price: (value) => value <= 0 ? 'Price must be greater than 0' : null,
      sku: (value) => !value?.trim() ? 'SKU is required' : null,
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.validateForm()) return;

    try {
      form.setSubmitting(true);
      
      if (productId) {
        await updateItem(productId, form.data);
      } else {
        await createItem(form.data);
      }
      
      onSuccess?.();
      form.resetForm();
    } catch (error) {
      // Error is handled by the hook
    } finally {
      form.setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={form.data.name}
        onChange={(e) => form.setFieldValue('name', e.target.value)}
        placeholder="Product Name"
      />
      {form.errors.name && <span className="error">{form.errors.name}</span>}
      
      {/* More form fields... */}
      
      <button type="submit" disabled={!form.isValid || form.isSubmitting}>
        {form.isSubmitting ? 'Saving...' : productId ? 'Update' : 'Create'}
      </button>
    </form>
  );
}
*/




// components/forms/ProductForm.tsx
'use client';

import React, { useEffect } from 'react';
import { useForm } from '@/hooks/useForm';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductFormData, Product, Category } from '@/types';

interface ProductFormProps {
  productId?: number;
  initialData?: Partial<ProductFormData>;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export function ProductForm({ 
  productId, 
  initialData, 
  onSuccess, 
  onCancel,
  mode = 'create' 
}: ProductFormProps) {
  const { 
    createItem, 
    updateItem, 
    fetchItem, 
    currentItem, 
    isSubmitting,
    error: crudError 
  } = useProducts();
  
  const { items: categories, fetchItems: fetchCategories } = useCategories();

  // Form validation rules
  const validationRules = {
    name: (value: string) => {
      if (!value?.trim()) return 'Product name is required';
      if (value.length < 3) return 'Product name must be at least 3 characters';
      return null;
    },
    price: (value: number) => {
      if (!value || value <= 0) return 'Price must be greater than 0';
      if (value > 999999) return 'Price is too high';
      return null;
    },
    sku: (value: string) => {
      if (!value?.trim()) return 'SKU is required';
      if (!/^[A-Z0-9-]+$/i.test(value)) return 'SKU can only contain letters, numbers, and hyphens';
      return null;
    },
    category_id: (value: number) => {
      if (!value || value === 0) return 'Please select a category';
      return null;
    },
    stock_quantity: (value: number) => {
      if (value < 0) return 'Stock quantity cannot be negative';
      return null;
    },
  };

  // Initialize form
  const form = useForm<ProductFormData>(
    {
      name: '',
      description: '',
      price: 0,
      sku: '',
      category_id: 0,
      stock_quantity: 0,
      status: 'active',
      ...initialData,
    },
    validationRules
  );

  // Load existing product data for edit mode
  useEffect(() => {
    if (mode === 'edit' && productId && !currentItem) {
      fetchItem(productId);
    }
  }, [mode, productId, currentItem, fetchItem]);

  // Load categories
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // Update form when currentItem changes (edit mode)
  useEffect(() => {
    if (currentItem && mode === 'edit') {
      form.setFormData({
        name: currentItem.name,
        description: currentItem.description || '',
        price: currentItem.price,
        sku: currentItem.sku,
        category_id: currentItem.category_id,
        stock_quantity: currentItem.stock_quantity,
        status: currentItem.status,
      });
    }
  }, [currentItem, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.validateForm()) {
      return;
    }

    try {
      form.setSubmitting(true);
      
      let result: Product;
      if (mode === 'edit' && productId) {
        result = await updateItem(productId, form.data);
      } else {
        result = await createItem(form.data);
      }
      
      onSuccess?.(result);
      
      if (mode === 'create') {
        form.resetForm();
      }
    } catch (error) {
      // Error is handled by the CRUD hook
      console.error('Form submission error:', error);
    } finally {
      form.setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetForm();
    onCancel?.();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {mode === 'edit' ? 'Edit Product' : 'Create New Product'}
      </h2>

      {crudError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{crudError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            value={form.data.name}
            onChange={(e) => form.setFieldValue('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              form.errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter product name"
          />
          {form.errors.name && (
            <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={form.data.description || ''}
            onChange={(e) => form.setFieldValue('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter product description"
          />
        </div>

        {/* Price and SKU Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <input
              type="number"
              id="price"
              step="0.01"
              min="0"
              value={form.data.price}
              onChange={(e) => form.setFieldValue('price', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                form.errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {form.errors.price && (
              <p className="mt-1 text-sm text-red-600">{form.errors.price}</p>
            )}
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
              SKU *
            </label>
            <input
              type="text"
              id="sku"
              value={form.data.sku}
              onChange={(e) => form.setFieldValue('sku', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                form.errors.sku ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="PROD-001"
            />
            {form.errors.sku && (
              <p className="mt-1 text-sm text-red-600">{form.errors.sku}</p>
            )}
          </div>
        </div>

        {/* Category and Stock Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category_id"
              value={form.data.category_id}
              onChange={(e) => form.setFieldValue('category_id', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                form.errors.category_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value={0}>Select a category</option>
              {categories.map((category: Category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {form.errors.category_id && (
              <p className="mt-1 text-sm text-red-600">{form.errors.category_id}</p>
            )}
          </div>

          <div>
            <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              id="stock_quantity"
              min="0"
              value={form.data.stock_quantity}
              onChange={(e) => form.setFieldValue('stock_quantity', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                form.errors.stock_quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {form.errors.stock_quantity && (
              <p className="mt-1 text-sm text-red-600">{form.errors.stock_quantity}</p>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={form.data.status}
            onChange={(e) => form.setFieldValue('status', e.target.value as 'active' | 'inactive' | 'discontinued')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={form.isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!form.isValid || form.isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {form.isSubmitting 
              ? (mode === 'edit' ? 'Updating...' : 'Creating...') 
              : (mode === 'edit' ? 'Update Product' : 'Create Product')
            }
          </button>
        </div>
      </form>
    </div>
  );
}

// components/forms/CategoryForm.tsx
'use client';

import React, { useEffect } from 'react';
import { useForm } from '@/hooks/useForm';
import { useCategories } from '@/hooks/useCategories';
import { CategoryFormData, Category } from '@/types';

interface CategoryFormProps {
  categoryId?: number;
  initialData?: Partial<CategoryFormData>;
  onSuccess?: (category: Category) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export function CategoryForm({ 
  categoryId, 
  initialData, 
  onSuccess, 
  onCancel,
  mode = 'create' 
}: CategoryFormProps) {
  const { 
    createItem, 
    updateItem, 
    fetchItem, 
    currentItem, 
    items: categories,
    fetchItems: fetchCategories,
    isSubmitting,
    error: crudError 
  } = useCategories();

  const validationRules = {
    name: (value: string) => {
      if (!value?.trim()) return 'Category name is required';
      if (value.length < 2) return 'Category name must be at least 2 characters';
      return null;
    },
  };

  const form = useForm<CategoryFormData>(
    {
      name: '',
      description: '',
      parent_id: undefined,
      status: 'active',
      ...initialData,
    },
    validationRules
  );

  useEffect(() => {
    if (mode === 'edit' && categoryId && !currentItem) {
      fetchItem(categoryId);
    }
  }, [mode, categoryId, currentItem, fetchItem]);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  useEffect(() => {
    if (currentItem && mode === 'edit') {
      form.setFormData({
        name: currentItem.name,
        description: currentItem.description || '',
        parent_id: currentItem.parent_id,
        status: currentItem.status,
      });
    }
  }, [currentItem, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.validateForm()) return;

    try {
      form.setSubmitting(true);
      
      let result: Category;
      if (mode === 'edit' && categoryId) {
        result = await updateItem(categoryId, form.data);
      } else {
        result = await createItem(form.data);
      }
      
      onSuccess?.(result);
      
      if (mode === 'create') {
        form.resetForm();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      form.setSubmitting(false);
    }
  };

  const availableParents = categories.filter(cat => cat.id !== categoryId);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {mode === 'edit' ? 'Edit Category' : 'Create New Category'}
      </h2>

      {crudError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{crudError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Category Name *
          </label>
          <input
            type="text"
            id="name"
            value={form.data.name}
            onChange={(e) => form.setFieldValue('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              form.errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter category name"
          />
          {form.errors.name && (
            <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={form.data.description || ''}
            onChange={(e) => form.setFieldValue('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter category description"
          />
        </div>

        <div>
          <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-2">
            Parent Category
          </label>
          <select
            id="parent_id"
            value={form.data.parent_id || ''}
            onChange={(e) => form.setFieldValue('parent_id', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No parent (Top level)</option>
            {availableParents.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={form.data.status}
            onChange={(e) => form.setFieldValue('status', e.target.value as 'active' | 'inactive')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => {
              form.resetForm();
              onCancel?.();
            }}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            disabled={form.isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!form.isValid || form.isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {form.isSubmitting 
              ? (mode === 'edit' ? 'Updating...' : 'Creating...') 
              : (mode === 'edit' ? 'Update Category' : 'Create Category')
            }
          </button>
        </div>
      </form>
    </div>
  );
}

// Example usage in pages/components
// app/products/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { ProductForm } from '@/components/forms/ProductForm';
import { Product } from '@/types';

export default function ProductsPage() {
  const { 
    items: products, 
    fetchItems, 
    deleteItem, 
    isLoading,
    error 
  } = useProducts();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreateSuccess = (product: Product) => {
    console.log('Product created:', product);
    setShowForm(false);
    fetchItems(); // Refresh the list
  };

  const handleEditSuccess = (product: Product) => {
    console.log('Product updated:', product);
    setEditingProduct(null);
    fetchItems(); // Refresh the list
  };

  const handleDelete = async (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteItem(productId);
        fetchItems(); // Refresh the list
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading products...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Product Form Modal/Section */}
      {(showForm || editingProduct) && (
        <div className="mb-8">
          <ProductForm
            productId={editingProduct?.id}
            mode={editingProduct ? 'edit' : 'create'}
            onSuccess={editingProduct ? handleEditSuccess : handleCreateSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        </div>
      )}

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-lg font-bold text-green-600 mb-2">${product.price}</p>
            <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setEditingProduct(product)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found. Create your first product!</p>
        </div>
      )}
    </div>
  );
}



// 1. Update your Laravel backend for persistent sessions
// In your Laravel LoginController or wherever you handle login:

/*
// app/Http/Controllers/Auth/LoginController.php
public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $remember = $request->boolean('remember', false); // Get remember me checkbox

    if (Auth::attempt($credentials, $remember)) {
        $request->session()->regenerate();
        
        $user = Auth::user();
        
        // Set custom cookies with longer expiration if remember is true
        $cookieExpiry = $remember ? 30 * 24 * 60 : null; // 30 days in minutes, or session
        
        return response()->json([
            'user' => $user,
            'message' => 'Login successful'
        ])->withCookie(
            cookie('userId', encrypt($user->id), $cookieExpiry)
        )->withCookie(
            cookie('userName', encrypt($user->name), $cookieExpiry)
        )->withCookie(
            cookie('userEmail', encrypt($user->email), $cookieExpiry)
        )->withCookie(
            cookie('userRole', encrypt($user->role ?? 'user'), $cookieExpiry)
        );
    }

    return response()->json([
        'message' => 'Invalid credentials'
    ], 401);
}
*/

// 2. Update your Laravel session configuration
// In config/session.php:
/*
'lifetime' => env('SESSION_LIFETIME', 120), // Change to longer value like 43200 (30 days)
'expire_on_close' => false, // Set to false for persistent sessions
'remember_me_lifetime' => 43200, // 30 days in minutes
*/

// 3. Updated AuthService with Remember Me functionality
import axios, { AxiosResponse } from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
  role?: string;
}

interface AuthResponse {
  user: User;
  message: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

class AuthService {
  private baseURL = 'http://localhost:8000';
  private currentUser: User | null = null;

  private api = axios.create({
    baseURL: this.baseURL,
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.setupResponseInterceptor();
  }

  // Check if user data exists in cookies (for persistent login)
  private getUserFromCookies(): User | null {
    if (typeof document === 'undefined') return null;

    try {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = decodeURIComponent(value);
        return acc;
      }, {} as Record<string, string>);

      // Check if we have user data in cookies
      if (cookies.userId && cookies.userName && cookies.userEmail) {
        // Note: In a real implementation, you'd want to decrypt these values
        // For now, we'll just check if they exist and make an API call to verify
        return null; // Return null to force API verification
      }

      return null;
    } catch (error) {
      console.error('Error reading user cookies:', error);
      return null;
    }
  }

  // Check if session cookies exist
  private hasValidSessionCookies(): boolean {
    if (typeof document === 'undefined') return false;

    const cookies = document.cookie;
    return cookies.includes('laravel_session=') && cookies.includes('XSRF-TOKEN=');
  }

  private getCsrfTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const xsrfCookie = cookies.find(cookie => 
      cookie.trim().startsWith('XSRF-TOKEN=')
    );
    
    if (xsrfCookie) {
      return decodeURIComponent(xsrfCookie.split('=')[1]);
    }
    
    return null;
  }

  private async getCsrfCookie(): Promise<void> {
    try {
      console.log('🍪 Requesting CSRF cookie from Laravel...');
      
      await axios.get(`${this.baseURL}/sanctum/csrf-cookie`, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('✅ CSRF cookie request completed');
    } catch (error) {
      console.error('❌ Error getting CSRF cookie:', error);
      throw error;
    }
  }

  private clearAuthCookies(): void {
    if (typeof document === 'undefined') return;

    const cookiesToClear = [
      'XSRF-TOKEN',
      'laravel_session',
      'remember_web',
      'userId',
      'userName', 
      'userEmail',
      'userRole'
    ];

    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }

  private clearLocalAuthState(): void {
    this.currentUser = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('authToken');
    }
  }

  private async makeAuthenticatedRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any
  ): Promise<AxiosResponse<T>> {
    await this.getCsrfCookie();
    
    const csrfToken = this.getCsrfTokenFromCookie();
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = csrfToken;
    }

    return this.api.request({
      method,
      url,
      data,
      headers,
    });
  }

  // Updated login method with remember me
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔄 Starting login process...');
      
      await this.getCsrfCookie();
      const csrfToken = this.getCsrfTokenFromCookie();

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
      }

      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${this.baseURL}/api/login`,
        credentials, // This now includes the remember field
        { 
          headers,
          withCredentials: true 
        }
      );

      this.currentUser = response.data.user;

      console.log('✅ Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 
                       error.response?.data?.errors?.email?.[0] || 
                       'Login failed';
        throw new Error(message);
      }
      throw new Error('Unexpected error during login');
    }
  }

  // Enhanced getUser method that checks cookies first
  async getUser(forceRefresh: boolean = false): Promise<User | null> {
    try {
      // If we have cached user and not forcing refresh, return it
      if (this.currentUser && !forceRefresh) {
        return this.currentUser;
      }

      // Check if we have session cookies before making API call
      if (!this.hasValidSessionCookies()) {
        console.log('❌ No valid session cookies found');
        this.clearLocalAuthState();
        return null;
      }

      const response: AxiosResponse<{ user: User }> = await this.api.get('/api/profile');
      this.currentUser = response.data.user;
      return response.data.user;
    } catch (error) {
      console.error('Get user error:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.clearLocalAuthState();
        this.clearAuthCookies();
      }
      this.currentUser = null;
      return null;
    }
  }

  // Check authentication status (this is called on app initialization)
  async checkAuthStatus(): Promise<boolean> {
    try {
      console.log('🔍 Checking authentication status...');
      
      // First check if we have session cookies
      if (!this.hasValidSessionCookies()) {
        console.log('❌ No session cookies found');
        return false;
      }

      // Try to get user profile to verify session is valid
      const user = await this.getUser(true); // Force refresh from server
      
      if (user) {
        console.log('✅ User authenticated:', user.email);
        return true;
      } else {
        console.log('❌ User not authenticated');
        return false;
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🔄 Starting logout process...');

      this.clearLocalAuthState();

      try {
        await this.makeAuthenticatedRequest('post', '/api/logout');
        console.log('✅ Server logout successful');
      } catch (serverError) {
        console.warn('⚠️ Server logout failed, but continuing with local cleanup:', serverError);
      }

      this.clearAuthCookies();
      console.log('✅ Logout process completed');

    } catch (error) {
      console.error('❌ Logout error:', error);
      this.clearLocalAuthState();
      this.clearAuthCookies();
      console.log('🔄 Local logout completed despite server error');
    }
  }

  forceLogout(): void {
    console.log('🚨 Force logout triggered');
    this.clearLocalAuthState();
    this.clearAuthCookies();
  }

  async isAuthenticated(): Promise<boolean> {
    return await this.checkAuthStatus();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setupResponseInterceptor(): void {
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('🚨 401 Unauthorized - forcing logout');
          this.forceLogout();
          // Optionally redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }
}

export const authService = new AuthService();

// 4. Updated AuthContext with better initialization
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated (this will verify cookies and session)
      const isAuth = await authService.checkAuthStatus();
      
      if (isAuth) {
        const userData = authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ User restored from session:', userData?.email);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('❌ No valid session found');
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  // Listen for auth state changes across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_logout') {
        setUser(null);
        setIsAuthenticated(false);
      } else if (e.key === 'auth_login') {
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Notify other tabs about login
      localStorage.setItem('auth_login', Date.now().toString());
      localStorage.removeItem('auth_login');
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      
      // Notify other tabs about logout
      localStorage.setItem('auth_logout', Date.now().toString());
      localStorage.removeItem('auth_logout');
    }
  };

  const refreshUser = async () => {
    await initializeAuth();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 5. Updated Login Form with Remember Me
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await login({ email, password, remember });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          id="remember"
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
          Remember me for 30 days
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}