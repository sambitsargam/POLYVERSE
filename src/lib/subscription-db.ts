import { SubscriptionPlan, SubscriptionState, AgentPaymentEvent } from './x402-service';
import { Address } from 'viem';

// In-memory storage for demo purposes
// In production, this would be replaced with a proper database
export class SubscriptionDatabase {
  private subscriptionPlans: Map<string, SubscriptionPlan> = new Map();
  private subscriptionStates: Map<string, SubscriptionState> = new Map();
  private agentPaymentEvents: Map<string, AgentPaymentEvent[]> = new Map();

  // Initialize with some sample data
  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample subscription plans
    const plan1: SubscriptionPlan = {
      id: 'plan_premium_monthly',
      creatorId: 'creator_alice',
      name: 'Premium Monthly',
      description: 'Access to premium content and exclusive updates',
      priceUSD: 9.99,
      interval: 'monthly',
      intervalCount: 1,
      paymentAsset: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582' as Address, // USDC on Polygon Amoy
      createdAt: new Date('2024-01-01'),
      isActive: true,
    };

    const plan2: SubscriptionPlan = {
      id: 'plan_basic_weekly',
      creatorId: 'creator_bob',
      name: 'Basic Weekly',
      description: 'Weekly updates and community access',
      priceUSD: 2.99,
      interval: 'weekly',
      intervalCount: 1,
      paymentAsset: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582' as Address, // USDC on Polygon Amoy
      createdAt: new Date('2024-01-15'),
      isActive: true,
    };

    this.subscriptionPlans.set(plan1.id, plan1);
    this.subscriptionPlans.set(plan2.id, plan2);

    // Sample subscription states
    const subscription1: SubscriptionState = {
      id: 'sub_001',
      planId: 'plan_premium_monthly',
      subscriberId: '0x1234567890123456789012345678901234567890' as Address,
      creatorId: 'creator_alice',
      status: 'active',
      nextPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      lastPaymentDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000), // 23 days ago
      lastPaymentTxHash: '0xabcdef123456789',
      totalPaid: '29970000', // 29.97 USDC (with 6 decimals)
      failedPayments: 0,
      createdAt: new Date('2024-01-01'),
    };

    this.subscriptionStates.set(subscription1.id, subscription1);

    // Initialize payment events for subscription
    this.agentPaymentEvents.set(subscription1.id, []);
  }

  // Subscription Plan Management
  async createSubscriptionPlan(plan: Omit<SubscriptionPlan, 'id' | 'createdAt'>): Promise<SubscriptionPlan> {
    const id = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newPlan: SubscriptionPlan = {
      ...plan,
      id,
      createdAt: new Date(),
    };

    this.subscriptionPlans.set(id, newPlan);
    console.log('📝 Created subscription plan:', newPlan);
    return newPlan;
  }

  async getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
    return this.subscriptionPlans.get(planId) || null;
  }

  async getCreatorSubscriptionPlans(creatorId: string): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values())
      .filter(plan => plan.creatorId === creatorId);
  }

  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values());
  }

  async updateSubscriptionPlan(planId: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
    const existing = this.subscriptionPlans.get(planId);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.subscriptionPlans.set(planId, updated);
    console.log('📝 Updated subscription plan:', updated);
    return updated;
  }

  // Subscription State Management
  async createSubscription(
    planId: string,
    subscriberId: Address,
    creatorId: string
  ): Promise<SubscriptionState | null> {
    const plan = this.subscriptionPlans.get(planId);
    if (!plan) return null;

    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const subscription: SubscriptionState = {
      id,
      planId,
      subscriberId,
      creatorId,
      status: 'active',
      nextPaymentDate: new Date(Date.now() + this.getIntervalMs(plan.interval, plan.intervalCount)),
      totalPaid: '0',
      failedPayments: 0,
      createdAt: new Date(),
    };

    this.subscriptionStates.set(id, subscription);
    this.agentPaymentEvents.set(id, []);
    
    console.log('🆕 Created subscription:', subscription);
    return subscription;
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionState | null> {
    return this.subscriptionStates.get(subscriptionId) || null;
  }

  async getSubscriberSubscriptions(subscriberId: Address): Promise<SubscriptionState[]> {
    return Array.from(this.subscriptionStates.values())
      .filter(sub => sub.subscriberId.toLowerCase() === subscriberId.toLowerCase());
  }

  async getCreatorSubscriptions(creatorId: string): Promise<SubscriptionState[]> {
    return Array.from(this.subscriptionStates.values())
      .filter(sub => sub.creatorId === creatorId);
  }

  async updateSubscription(subscriptionId: string, updates: Partial<SubscriptionState>): Promise<SubscriptionState | null> {
    const existing = this.subscriptionStates.get(subscriptionId);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.subscriptionStates.set(subscriptionId, updated);
    
    console.log('📝 Updated subscription:', updated);
    return updated;
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    const subscription = this.subscriptionStates.get(subscriptionId);
    if (!subscription) return false;

    subscription.status = 'cancelled';
    this.subscriptionStates.set(subscriptionId, subscription);
    
    console.log('❌ Cancelled subscription:', subscriptionId);
    return true;
  }

  // Payment Event Management
  async createPaymentEvent(event: Omit<AgentPaymentEvent, 'id'>): Promise<AgentPaymentEvent> {
    const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEvent: AgentPaymentEvent = {
      ...event,
      id,
    };

    const events = this.agentPaymentEvents.get(event.subscriptionId) || [];
    events.push(newEvent);
    this.agentPaymentEvents.set(event.subscriptionId, events);
    
    console.log('💰 Created payment event:', newEvent);
    return newEvent;
  }

  async getSubscriptionPaymentEvents(subscriptionId: string): Promise<AgentPaymentEvent[]> {
    return this.agentPaymentEvents.get(subscriptionId) || [];
  }

  async updatePaymentEvent(eventId: string, updates: Partial<AgentPaymentEvent>): Promise<AgentPaymentEvent | null> {
    const subscriptionIds = Array.from(this.agentPaymentEvents.keys());
    for (const subscriptionId of subscriptionIds) {
      const events = this.agentPaymentEvents.get(subscriptionId) || [];
      const eventIndex = events.findIndex((e: AgentPaymentEvent) => e.id === eventId);
      if (eventIndex !== -1) {
        const updated = { ...events[eventIndex], ...updates };
        events[eventIndex] = updated;
        this.agentPaymentEvents.set(subscriptionId, events);
        
        console.log('📝 Updated payment event:', updated);
        return updated;
      }
    }
    return null;
  }

  // Utility functions
  async getSubscriptionsDueForPayment(): Promise<SubscriptionState[]> {
    const now = new Date();
    return Array.from(this.subscriptionStates.values())
      .filter(sub => 
        sub.status === 'active' && 
        sub.nextPaymentDate <= now
      );
  }

  async getSubscriptionStats(creatorId: string): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalRevenue: number;
    monthlyRecurringRevenue: number;
  }> {
    const subscriptions = await this.getCreatorSubscriptions(creatorId);
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    
    const totalRevenue = subscriptions.reduce((sum, sub) => {
      return sum + parseFloat(sub.totalPaid) / 1e6; // Convert from USDC wei to dollars
    }, 0);

    // Calculate MRR (Monthly Recurring Revenue)
    let monthlyRecurringRevenue = 0;
    for (const sub of activeSubscriptions) {
      const plan = this.subscriptionPlans.get(sub.planId);
      if (plan) {
        // Convert to monthly equivalent
        const monthlyAmount = plan.interval === 'monthly' ? plan.priceUSD :
                             plan.interval === 'weekly' ? plan.priceUSD * 4.33 :
                             plan.interval === 'daily' ? plan.priceUSD * 30 :
                             plan.priceUSD;
        monthlyRecurringRevenue += monthlyAmount;
      }
    }

    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      totalRevenue,
      monthlyRecurringRevenue,
    };
  }

  private getIntervalMs(interval: string, count: number = 1): number {
    const day = 24 * 60 * 60 * 1000;
    switch (interval) {
      case 'daily': return day * count;
      case 'weekly': return day * 7 * count;
      case 'monthly': return day * 30 * count; // Approximate
      default: return day * 30; // Default to monthly
    }
  }

  // Export data for debugging
  exportData() {
    return {
      subscriptionPlans: Object.fromEntries(this.subscriptionPlans),
      subscriptionStates: Object.fromEntries(this.subscriptionStates),
      agentPaymentEvents: Object.fromEntries(this.agentPaymentEvents),
    };
  }

  // Import data (for testing/demo)
  importData(data: any) {
    if (data.subscriptionPlans) {
      this.subscriptionPlans = new Map(Object.entries(data.subscriptionPlans));
    }
    if (data.subscriptionStates) {
      this.subscriptionStates = new Map(Object.entries(data.subscriptionStates));
    }
    if (data.agentPaymentEvents) {
      this.agentPaymentEvents = new Map(Object.entries(data.agentPaymentEvents));
    }
  }
}

// Export singleton instance
export const subscriptionDb = new SubscriptionDatabase();