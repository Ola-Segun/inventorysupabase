// services/authService.ts
import axios, { AxiosResponse } from 'axios';
import Cookies from "js-cookie";

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

  private setPersistentCookie(name: string, value: string, days: number = 7): void {
    if (typeof document === 'undefined') return;
    
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
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
        // Set CSRF token as a persistent cookie
        this.setPersistentCookie('XSRF-TOKEN', csrfToken);
      }

      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${this.baseURL}/api/login`,
        { 
          email, 
          password,
          remember: true  // Tell Laravel to remember the user
        },
        { 
          headers,
          withCredentials: true 
        }
      );

      // Store user data locally after successful login
      this.currentUser = response.data.user;
      
      // Store user data in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

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
      
      // Load user from localStorage if not present in memory
      if (!this.currentUser && typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          this.currentUser = JSON.parse(savedUser);
        }
      }
      // Return cached user if available and not forcing refresh
      if (this.currentUser && !forceRefresh) {
        return this.currentUser;
      }

      // Try to fetch from API if not found locally
      const response: AxiosResponse<ProfileResponse> = await this.api.get('/api/profile');
      this.currentUser = response.data.user;
      // Update localStorage with latest user
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
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

  getCurrentUser(): User | null {
    // Always check localStorage for user
    if (!this.currentUser && typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    }
    return this.currentUser;
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