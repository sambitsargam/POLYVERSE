// X402 Payment Service
// Implementation of X402 protocol for micropayments and subscriptions

import { Address } from 'viem'

export interface SubscriptionPlan {
  id: string
  creatorId: Address
  name: string
  description: string
  priceUSD: number
  interval: 'month' | 'year'
  intervalCount: number
  paymentAsset: Address
  isActive: boolean
}

export interface SubscriptionState {
  planId: string
  subscriberId: Address
  creatorId: Address
  status: 'active' | 'inactive' | 'cancelled'
  startDate: Date
  endDate: Date
  nextBillingDate: Date
}

export interface AgentPaymentEvent {
  type: 'subscription_created' | 'subscription_renewed' | 'subscription_cancelled' | 'payment_received'
  timestamp: Date
  userId: Address
  creatorId: Address
  planId?: string
  amount?: number
  currency?: string
  transactionHash?: string
}

export class X402Service {
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string = '/api/x402', apiKey: string = 'dev-key') {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  // Subscription Plans
  async createSubscriptionPlan(plan: Omit<SubscriptionPlan, 'id'>): Promise<SubscriptionPlan> {
    const response = await fetch(`${this.baseUrl}/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(plan)
    })

    if (!response.ok) {
      throw new Error(`Failed to create subscription plan: ${response.statusText}`)
    }

    const result = await response.json()
    return result.plan
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await fetch(`${this.baseUrl}/plans`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get subscription plans: ${response.statusText}`)
    }

    const result = await response.json()
    return result.plans || []
  }

  async getSubscriptionPlansByCreator(creatorId: Address): Promise<SubscriptionPlan[]> {
    const response = await fetch(`${this.baseUrl}/plans?creatorId=${creatorId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get creator plans: ${response.statusText}`)
    }

    const result = await response.json()
    return result.plans || []
  }

  // Subscriptions
  async createSubscription(planId: string, subscriberId: Address): Promise<SubscriptionState> {
    const response = await fetch(`${this.baseUrl}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ planId, subscriberId })
    })

    if (!response.ok) {
      throw new Error(`Failed to create subscription: ${response.statusText}`)
    }

    const result = await response.json()
    return result.subscription
  }

  async getSubscriptions(userId?: Address): Promise<SubscriptionState[]> {
    const url = userId 
      ? `${this.baseUrl}/subscriptions?userId=${userId}`
      : `${this.baseUrl}/subscriptions`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get subscriptions: ${response.statusText}`)
    }

    const result = await response.json()
    return result.subscriptions || []
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })

    return response.ok
  }

  // Payment Processing
  async processPayment(
    amount: number,
    currency: string,
    recipientAddress: Address,
    paymentTokenAddress: Address
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        amount,
        currency,
        recipientAddress,
        paymentTokenAddress
      })
    })

    if (!response.ok) {
      throw new Error(`Payment failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.transactionHash
  }

  // Events
  async getPaymentEvents(userId?: Address): Promise<AgentPaymentEvent[]> {
    const url = userId 
      ? `${this.baseUrl}/events?userId=${userId}`
      : `${this.baseUrl}/events`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })

    if (!response.ok) {
      return [] // Return empty array if events endpoint fails
    }

    const result = await response.json()
    return result.events || []
  }

  // Utility Methods
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      return response.ok
    } catch {
      return false
    }
  }

  async getServiceStatus(): Promise<{
    status: string
    uptime: number
    version: string
  }> {
    const response = await fetch(`${this.baseUrl}/status`)
    
    if (!response.ok) {
      return {
        status: 'unavailable',
        uptime: 0,
        version: 'unknown'
      }
    }

    return await response.json()
  }
}

// Export singleton instance
export const x402Service = new X402Service()
export default x402Service