/**
 * Password Policy Enforcement
 * Provides comprehensive password validation and security features
 */

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  preventCommonPasswords: boolean
  preventPersonalInfo: boolean
  maxConsecutiveChars: number
  historyCheck: boolean
  historySize: number
}

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
  score: number
}

// Default password policy
export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventPersonalInfo: true,
  maxConsecutiveChars: 3,
  historyCheck: true,
  historySize: 5
}

// Common weak passwords to reject
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
  'qwerty123', 'welcome123', 'admin123', 'root', 'user', 'guest'
]

/**
 * Validates a password against the policy
 */
export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
  personalInfo: string[] = []
): PasswordValidationResult {
  const errors: string[] = []
  let score = 0

  // Length check
  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`)
  } else {
    score += Math.min(password.length / 2, 20) // Max 20 points for length
  }

  // Character requirements
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else if (policy.requireUppercase) {
    score += 15
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else if (policy.requireLowercase) {
    score += 15
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else if (policy.requireNumbers) {
    score += 15
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  } else if (policy.requireSpecialChars) {
    score += 15
  }

  // Check for common passwords
  if (policy.preventCommonPasswords && COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password')
  }

  // Check for personal information
  if (policy.preventPersonalInfo && personalInfo.length > 0) {
    const passwordLower = password.toLowerCase()
    const containsPersonalInfo = personalInfo.some(info =>
      info && info.length > 2 && passwordLower.includes(info.toLowerCase())
    )
    if (containsPersonalInfo) {
      errors.push('Password cannot contain personal information')
    }
  }

  // Check for consecutive characters
  if (policy.maxConsecutiveChars > 0) {
    const consecutivePattern = new RegExp(`(.)\\1{${policy.maxConsecutiveChars},}`)
    if (consecutivePattern.test(password)) {
      errors.push(`Password cannot contain more than ${policy.maxConsecutiveChars} consecutive identical characters`)
    }
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 60) strength = 'strong'
  else if (score >= 40) strength = 'medium'

  // Bonus points for variety
  const charTypes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ].filter(Boolean).length

  score += charTypes * 5

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.min(score, 100)
  }
}

/**
 * Generates password strength feedback
 */
export function getPasswordStrengthFeedback(result: PasswordValidationResult): string {
  if (!result.isValid) {
    return result.errors[0] // Return first error
  }

  switch (result.strength) {
    case 'weak':
      return 'Weak password. Consider adding more character types and length.'
    case 'medium':
      return 'Medium strength. Add more variety for better security.'
    case 'strong':
      return 'Strong password! Good job.'
    default:
      return ''
  }
}

/**
 * Generates a secure password suggestion
 */
export function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const allChars = lowercase + uppercase + numbers + symbols
  let password = ''

  // Ensure at least one character from each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Account Lockout Configuration
 */
export interface LockoutConfig {
  maxAttempts: number
  lockoutDuration: number // in minutes
  progressiveLockout: boolean
  resetAfter: number // in minutes
}

export const DEFAULT_LOCKOUT_CONFIG: LockoutConfig = {
  maxAttempts: 5,
  lockoutDuration: 15, // 15 minutes
  progressiveLockout: true,
  resetAfter: 30 // reset counter after 30 minutes
}

/**
 * Checks if account should be locked based on failed attempts
 */
export function shouldLockAccount(
  failedAttempts: number,
  lastFailedAt: Date | null,
  config: LockoutConfig = DEFAULT_LOCKOUT_CONFIG
): { shouldLock: boolean; lockoutUntil: Date | null; remainingAttempts: number } {
  const now = new Date()
  const remainingAttempts = Math.max(0, config.maxAttempts - failedAttempts)

  // Reset counter if enough time has passed
  if (lastFailedAt) {
    const timeSinceLastFailure = (now.getTime() - lastFailedAt.getTime()) / (1000 * 60) // minutes
    if (timeSinceLastFailure >= config.resetAfter) {
      return { shouldLock: false, lockoutUntil: null, remainingAttempts: config.maxAttempts }
    }
  }

  if (failedAttempts >= config.maxAttempts) {
    let lockoutDuration = config.lockoutDuration

    // Progressive lockout: increase duration with each violation
    if (config.progressiveLockout && failedAttempts > config.maxAttempts) {
      const multiplier = Math.floor((failedAttempts - config.maxAttempts) / 2) + 1
      lockoutDuration *= multiplier
    }

    const lockoutUntil = new Date(now.getTime() + lockoutDuration * 60 * 1000)

    return {
      shouldLock: true,
      lockoutUntil,
      remainingAttempts: 0
    }
  }

  return {
    shouldLock: false,
    lockoutUntil: null,
    remainingAttempts
  }
}

/**
 * Calculates time remaining until lockout expires
 */
export function getLockoutTimeRemaining(lockoutUntil: Date): { minutes: number; seconds: number } {
  const now = new Date()
  const remaining = Math.max(0, lockoutUntil.getTime() - now.getTime())

  const minutes = Math.floor(remaining / (1000 * 60))
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

  return { minutes, seconds }
}