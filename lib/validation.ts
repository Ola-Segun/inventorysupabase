// Validation utilities for enterprise inventory management system

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface ProductValidationData {
  name?: string
  sku?: string
  price?: number
  cost?: number
  stock?: number
}

export interface UserValidationData {
  name?: string
  email?: string
  phone?: string
  role?: string
}

export interface OrganizationValidationData {
  name?: string
  email?: string
  taxRate?: number
}

// Product validation
export function validateProduct(data: ProductValidationData): ValidationResult {
  const errors: string[] = []

  if (!data.name || data.name.trim().length === 0) {
    errors.push("Product name is required")
  } else if (data.name.length < 2) {
    errors.push("Product name must be at least 2 characters long")
  }

  if (!data.sku || data.sku.trim().length === 0) {
    errors.push("SKU is required")
  } else if (data.sku.length < 3) {
    errors.push("SKU must be at least 3 characters long")
  }

  if (data.price !== undefined && data.price < 0) {
    errors.push("Price cannot be negative")
  }

  if (data.cost !== undefined && data.cost < 0) {
    errors.push("Cost cannot be negative")
  }

  if (data.stock !== undefined && data.stock < 0) {
    errors.push("Stock cannot be negative")
  }

  if (data.price !== undefined && data.cost !== undefined && data.price < data.cost) {
    errors.push("Selling price should be higher than cost price")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// User validation
export function validateUser(data: UserValidationData): ValidationResult {
  const errors: string[] = []

  if (!data.name || data.name.trim().length === 0) {
    errors.push("Name is required")
  } else if (data.name.length < 2) {
    errors.push("Name must be at least 2 characters long")
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push("Email is required")
  } else if (!isValidEmail(data.email)) {
    errors.push("Please enter a valid email address")
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.push("Please enter a valid phone number")
  }

  if (!data.role) {
    errors.push("Role is required")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Organization validation
export function validateOrganization(data: OrganizationValidationData): ValidationResult {
  const errors: string[] = []

  if (!data.name || data.name.trim().length === 0) {
    errors.push("Organization name is required")
  } else if (data.name.length < 2) {
    errors.push("Organization name must be at least 2 characters long")
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push("Please enter a valid email address")
  }

  if (data.taxRate !== undefined && (data.taxRate < 0 || data.taxRate > 100)) {
    errors.push("Tax rate must be between 0 and 100")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Inventory validation
export function validateStockAdjustment(currentStock: number, adjustment: number): ValidationResult {
  const errors: string[] = []

  if (adjustment === 0) {
    errors.push("Adjustment quantity cannot be zero")
  }

  const newStock = currentStock + adjustment
  if (newStock < 0) {
    errors.push("Stock cannot go below zero")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPhone(phone: string): boolean {
  // Basic phone validation - allows digits, spaces, hyphens, parentheses
  const phoneRegex = /^[\d\s\-\(\)\+]+$/
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '')
  return cleanPhone.length >= 10 && cleanPhone.length <= 15 && phoneRegex.test(phone)
}

// Currency formatting utility
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount)
}

// Date formatting utility
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Time formatting utility
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Generate order number
export function generateOrderNumber(prefix: string = 'ORD'): string {
  const timestamp = new Date().getTime().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}-${timestamp}-${random}`
}

// Generate SKU
export function generateSKU(category: string, existingSKUs: string[]): string {
  const prefix = category.substring(0, 3).toUpperCase()
  let counter = 1
  let sku = `${prefix}-${counter.toString().padStart(3, '0')}`

  while (existingSKUs.includes(sku)) {
    counter++
    sku = `${prefix}-${counter.toString().padStart(3, '0')}`
  }

  return sku
}