// Subscription Database Service
// This is a mock implementation for development - replace with real database in production

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
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  planId: string
  subscriberId: Address
  creatorId: Address
  status: 'active' | 'inactive' | 'cancelled'
  startDate: Date
  endDate: Date
  nextBillingDate: Date
  createdAt: Date
  updatedAt: Date
}

class SubscriptionDatabase {
  private plans: Map<string, SubscriptionPlan> = new Map()
  private subscriptions: Map<string, Subscription> = new Map()

  // Subscription Plans
  async createSubscriptionPlan(data: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionPlan> {
    const plan: SubscriptionPlan = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    this.plans.set(plan.id, plan)
    return plan
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | null> {
    return this.plans.get(id) || null
  }

  async getSubscriptionPlansByCreator(creatorId: Address): Promise<SubscriptionPlan[]> {
    return Array.from(this.plans.values()).filter(plan => 
      plan.creatorId.toLowerCase() === creatorId.toLowerCase()
    )
  }

  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.plans.values())
  }

  // Subscriptions
  async createSubscription(
    planId: string,
    subscriberId: Address,
    creatorId: Address
  ): Promise<Subscription | null> {
    const plan = await this.getSubscriptionPlan(planId)
    if (!plan) return null

    const startDate = new Date()
    const endDate = new Date(startDate)
    if (plan.interval === 'month') {
      endDate.setMonth(endDate.getMonth() + plan.intervalCount)
    } else {
      endDate.setFullYear(endDate.getFullYear() + plan.intervalCount)
    }

    const subscription: Subscription = {
      id: this.generateId(),
      planId,
      subscriberId,
      creatorId,
      status: 'active',
      startDate,
      endDate,
      nextBillingDate: endDate,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.subscriptions.set(subscription.id, subscription)
    return subscription
  }

  async getSubscription(id: string): Promise<Subscription | null> {
    return this.subscriptions.get(id) || null
  }

  async getSubscriptionsBySubscriber(subscriberId: Address): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(sub => 
      sub.subscriberId.toLowerCase() === subscriberId.toLowerCase()
    )
  }

  async getSubscriptionsByCreator(creatorId: Address): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(sub => 
      sub.creatorId.toLowerCase() === creatorId.toLowerCase()
    )
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values())
  }

  async updateSubscriptionStatus(id: string, status: Subscription['status']): Promise<Subscription | null> {
    const subscription = this.subscriptions.get(id)
    if (!subscription) return null

    subscription.status = status
    subscription.updatedAt = new Date()
    this.subscriptions.set(id, subscription)
    return subscription
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

export const subscriptionDb = new SubscriptionDatabase()
export default subscriptionDb