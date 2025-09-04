import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null, // No Stripe price ID for free plan
    features: {
      maxProducts: 100,
      maxTeamMembers: 2,
      storage: '1GB',
      aiFeatures: false,
      apiAccess: false,
      advancedAnalytics: false,
      prioritySupport: false,
    },
  },
  pro: {
    name: 'Pro',
    price: 29.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: {
      maxProducts: 10000,
      maxTeamMembers: 10,
      storage: '50GB',
      aiFeatures: true,
      apiAccess: true,
      advancedAnalytics: true,
      prioritySupport: true,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 99.99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: {
      maxProducts: Infinity,
      maxTeamMembers: Infinity,
      storage: '500GB',
      aiFeatures: true,
      apiAccess: true,
      advancedAnalytics: true,
      prioritySupport: true,
      whiteLabel: true,
      customAiModels: true,
      dedicatedSupport: true,
    },
  },
} as const

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS

// Webhook events we handle
export const STRIPE_WEBHOOK_EVENTS = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.created',
  'customer.updated',
] as const

export type StripeWebhookEvent = typeof STRIPE_WEBHOOK_EVENTS[number]