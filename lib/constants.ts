export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CASHIER: "cashier",
  SELLER: "seller",
} as const

export type UserRole = keyof typeof ROLES

export const PUBLIC_ROUTES = ["/auth", "/welcome"] as const