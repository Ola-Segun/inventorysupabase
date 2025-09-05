// <CHANGE> Uncommented and exported the Products interface to fix import error
export interface Products {
  id: number
  name: string
  sku: string
  description: string
  cost_price: number
  price: number
  quantity: number
  category_id: number
  created_at: string
  updated_at: string
  file: File | null
  image_url?: string | ''
  cost?: number
  category?: {
    id: number
    name: string
    created_at: string
    updated_at: string
  }
  barcode?: string
}

export interface User {
  name: string
  email: string
  role: string
  password?: string
  password_confirmation?: string
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User
  access_token?: string
  [key: string]: any; // fallback if backend sends more
}

// ... existing code ...
