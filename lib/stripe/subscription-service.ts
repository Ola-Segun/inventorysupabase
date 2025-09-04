import { stripe, SUBSCRIPTION_PLANS, type SubscriptionTier } from './config'
import { supabaseAdmin } from '@/lib/supabase/client'

export interface CreateSubscriptionParams {
  organizationId: string
  priceId: string
  customerId?: string
  customerEmail: string
  customerName: string
  trialDays?: number
}

export interface SubscriptionInfo {
  id: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  tier: SubscriptionTier
  customerId: string
}

export class SubscriptionService {
  /**
   * Create a new Stripe customer
   */
  async createCustomer(email: string, name: string, organizationId: string) {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        organizationId,
      },
    })

    // Update organization with Stripe customer ID
    await supabaseAdmin
      .from('organizations')
      .update({ stripe_customer_id: customer.id })
      .eq('id', organizationId)

    return customer
  }

  /**
   * Create a new subscription
   */
  async createSubscription({
    organizationId,
    priceId,
    customerId,
    customerEmail,
    customerName,
    trialDays = 14,
  }: CreateSubscriptionParams) {
    let customer

    if (customerId) {
      customer = await stripe.customers.retrieve(customerId)
    } else {
      customer = await this.createCustomer(customerEmail, customerName, organizationId)
    }

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      trial_period_days: trialDays,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        organizationId,
      },
    })

    // Update organization with subscription info
    const tier = this.getTierFromPriceId(priceId)
    await supabaseAdmin
      .from('organizations')
      .update({
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        subscription_tier: tier,
        subscription_status: subscription.status === 'trialing' ? 'trialing' : 'active',
        trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      })
      .eq('id', organizationId)

    return subscription
  }

  /**
   * Update subscription (upgrade/downgrade)
   */
  async updateSubscription(subscriptionId: string, newPriceId: string) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    })

    // Update organization tier
    const tier = this.getTierFromPriceId(newPriceId)
    const organizationId = subscription.metadata.organizationId

    if (organizationId) {
      await supabaseAdmin
        .from('organizations')
        .update({
          subscription_tier: tier,
          subscription_status: updatedSubscription.status === 'trialing' ? 'trialing' : 'active',
        })
        .eq('id', organizationId)
    }

    return updatedSubscription
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    })

    // Update organization status
    const organizationId = subscription.metadata.organizationId
    if (organizationId) {
      await supabaseAdmin
        .from('organizations')
        .update({
          subscription_status: cancelAtPeriodEnd ? 'active' : 'canceled',
        })
        .eq('id', organizationId)
    }

    return subscription
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(subscriptionId: string) {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    // Update organization status
    const organizationId = subscription.metadata.organizationId
    if (organizationId) {
      await supabaseAdmin
        .from('organizations')
        .update({
          subscription_status: 'active',
        })
        .eq('id', organizationId)
    }

    return subscription
  }

  /**
   * Get subscription info
   */
  async getSubscription(subscriptionId: string): Promise<SubscriptionInfo | null> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const tier = this.getTierFromPriceId(subscription.items.data[0].price.id)

      return {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        tier,
        customerId: subscription.customer as string,
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      return null
    }
  }

  /**
   * Create billing portal session
   */
  async createBillingPortalSession(customerId: string, returnUrl: string) {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession({
    priceId,
    customerId,
    organizationId,
    successUrl,
    cancelUrl,
    trialDays = 14,
  }: {
    priceId: string
    customerId?: string
    organizationId: string
    successUrl: string
    cancelUrl: string
    trialDays?: number
  }) {
    const sessionParams: any = {
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: trialDays,
        metadata: {
          organizationId,
        },
      },
    }

    if (customerId) {
      sessionParams.customer = customerId
    } else {
      sessionParams.customer_creation = 'always'
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    return session
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(event: any) {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object)
        break

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  }

  private async handleSubscriptionUpdate(subscription: any) {
    const organizationId = subscription.metadata.organizationId
    if (!organizationId) return

    const tier = this.getTierFromPriceId(subscription.items.data[0].price.id)
    
    await supabaseAdmin
      .from('organizations')
      .update({
        subscription_tier: tier,
        subscription_status: subscription.status,
        stripe_subscription_id: subscription.id,
        trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      })
      .eq('id', organizationId)
  }

  private async handleSubscriptionDeleted(subscription: any) {
    const organizationId = subscription.metadata.organizationId
    if (!organizationId) return

    await supabaseAdmin
      .from('organizations')
      .update({
        subscription_tier: 'free',
        subscription_status: 'canceled',
        stripe_subscription_id: null,
        trial_ends_at: null,
      })
      .eq('id', organizationId)
  }

  private async handlePaymentSucceeded(invoice: any) {
    const subscriptionId = invoice.subscription
    if (!subscriptionId) return

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const organizationId = subscription.metadata.organizationId
    
    if (organizationId) {
      await supabaseAdmin
        .from('organizations')
        .update({
          subscription_status: 'active',
        })
        .eq('id', organizationId)
    }
  }

  private async handlePaymentFailed(invoice: any) {
    const subscriptionId = invoice.subscription
    if (!subscriptionId) return

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const organizationId = subscription.metadata.organizationId
    
    if (organizationId) {
      await supabaseAdmin
        .from('organizations')
        .update({
          subscription_status: 'past_due',
        })
        .eq('id', organizationId)
    }
  }

  private getTierFromPriceId(priceId: string): SubscriptionTier {
    for (const [tier, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
      if (plan.priceId === priceId) {
        return tier as SubscriptionTier
      }
    }
    return 'free'
  }
}

export const subscriptionService = new SubscriptionService()