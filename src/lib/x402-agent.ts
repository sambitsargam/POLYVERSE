import { x402Service, X402Service, SubscriptionPlan, SubscriptionState, AgentPaymentEvent } from './x402-service';
import { subscriptionDb } from './subscription-db';
import { Address } from 'viem';

export interface AgentConfig {
  checkInterval: number; // milliseconds between payment checks
  maxRetries: number; // max retry attempts for failed payments
  isEnabled: boolean; // whether agent is actively running
}

export class X402Agent {
  private config: AgentConfig;
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;
  private x402Service: X402Service;

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = {
      checkInterval: 60000, // Check every minute
      maxRetries: 3,
      isEnabled: true,
      ...config,
    };
    this.x402Service = x402Service;
  }

  /**
   * Start the agent to monitor and process recurring payments
   */
  start(): void {
    if (this.isRunning) {
      console.log('🤖 x402 Agent is already running');
      return;
    }

    this.isRunning = true;
    console.log('🤖 Starting x402 Agent with config:', this.config);

    // Start the periodic payment check
    this.intervalId = setInterval(() => {
      this.processScheduledPayments().catch(error => {
        console.error('❌ Agent payment processing error:', error);
      });
    }, this.config.checkInterval);

    // Process any immediately due payments
    this.processScheduledPayments().catch(error => {
      console.error('❌ Initial agent payment processing error:', error);
    });
  }

  /**
   * Stop the agent
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('🤖 x402 Agent is not running');
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    console.log('🛑 x402 Agent stopped');
  }

  /**
   * Get agent status
   */
  getStatus(): {
    isRunning: boolean;
    config: AgentConfig;
    nextCheck: Date | null;
    totalProcessed: number;
  } {
    return {
      isRunning: this.isRunning,
      config: this.config,
      nextCheck: this.intervalId ? new Date(Date.now() + this.config.checkInterval) : null,
      totalProcessed: 0, // Could track this in a real implementation
    };
  }

  /**
   * Process all subscriptions that are due for payment
   */
  private async processScheduledPayments(): Promise<void> {
    if (!this.config.isEnabled) {
      console.log('🤖 Agent is disabled, skipping payment processing');
      return;
    }

    try {
      console.log('🤖 Agent checking for due payments...');
      
      // Get subscriptions due for payment
      const dueSubscriptions = await subscriptionDb.getSubscriptionsDueForPayment();
      
      if (dueSubscriptions.length === 0) {
        console.log('✅ No payments due at this time');
        return;
      }

      console.log(`🤖 Found ${dueSubscriptions.length} subscriptions due for payment`);

      // Process each due subscription
      for (const subscription of dueSubscriptions) {
        await this.processSubscriptionPayment(subscription);
      }
    } catch (error) {
      console.error('❌ Error in agent payment processing:', error);
    }
  }

  /**
   * Process payment for a single subscription
   */
  private async processSubscriptionPayment(subscription: SubscriptionState): Promise<void> {
    try {
      console.log(`🤖 Processing payment for subscription: ${subscription.id}`);

      // Get the subscription plan
      const plan = await subscriptionDb.getSubscriptionPlan(subscription.planId);
      if (!plan) {
        console.error(`❌ Plan not found: ${subscription.planId}`);
        return;
      }

      // Create payment event
      const paymentEvent = await subscriptionDb.createPaymentEvent({
        subscriptionId: subscription.id,
        amount: (plan.priceUSD * 1e6).toString(), // Convert to USDC wei
        status: 'pending',
        scheduledFor: new Date(),
      });

      // Simulate x402 payment through agent
      const creatorAddress = this.getCreatorAddress(subscription.creatorId);
      const paymentResult = await this.x402Service.simulateAgentPayment(
        subscription,
        plan,
        creatorAddress
      );

      if (paymentResult.success) {
        console.log(`✅ Payment successful for subscription ${subscription.id}:`, paymentResult.txHash);

        // Update payment event
        await subscriptionDb.updatePaymentEvent(paymentEvent.id, {
          status: 'completed',
          txHash: paymentResult.txHash,
          processedAt: new Date(),
        });

        // Update subscription
        const nextPaymentDate = this.x402Service.calculateNextPaymentDate(
          new Date(),
          plan.interval,
          plan.intervalCount
        );

        const totalPaidWei = BigInt(subscription.totalPaid) + BigInt(plan.priceUSD * 1e6);

        await subscriptionDb.updateSubscription(subscription.id, {
          lastPaymentDate: new Date(),
          lastPaymentTxHash: paymentResult.txHash,
          nextPaymentDate,
          totalPaid: totalPaidWei.toString(),
          failedPayments: 0, // Reset failed payments on success
        });

        console.log(`🎉 Subscription ${subscription.id} payment completed successfully`);
      } else {
        console.error(`❌ Payment failed for subscription ${subscription.id}:`, paymentResult.error);

        // Update payment event
        await subscriptionDb.updatePaymentEvent(paymentEvent.id, {
          status: 'failed',
          failureReason: paymentResult.error,
          processedAt: new Date(),
        });

        // Update subscription with failure info
        const failedCount = subscription.failedPayments + 1;
        const updates: Partial<SubscriptionState> = {
          failedPayments: failedCount,
        };

        // If too many failures, pause the subscription
        if (failedCount >= this.config.maxRetries) {
          console.warn(`⚠️ Subscription ${subscription.id} paused due to ${failedCount} failed payments`);
          updates.status = 'paused';
        } else {
          // Retry in a shorter interval (e.g., next hour)
          updates.nextPaymentDate = new Date(Date.now() + 60 * 60 * 1000);
          console.log(`⏰ Retrying subscription ${subscription.id} payment in 1 hour`);
        }

        await subscriptionDb.updateSubscription(subscription.id, updates);
      }
    } catch (error) {
      console.error(`❌ Error processing subscription ${subscription.id}:`, error);
    }
  }

  /**
   * Get creator wallet address (in real implementation, this would query the database)
   */
  private getCreatorAddress(creatorId: string): Address {
    // Mock creator addresses for demo
    const creatorAddresses: Record<string, Address> = {
      'creator_alice': '0x2345678901234567890123456789012345678901' as Address,
      'creator_bob': '0x3456789012345678901234567890123456789012' as Address,
      'creator_charlie': '0x4567890123456789012345678901234567890123' as Address,
    };

    return creatorAddresses[creatorId] || '0x1111111111111111111111111111111111111111' as Address;
  }

  /**
   * Force process a specific subscription (for testing)
   */
  async forceProcessSubscription(subscriptionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const subscription = await subscriptionDb.getSubscription(subscriptionId);
      if (!subscription) {
        return { success: false, message: 'Subscription not found' };
      }

      if (subscription.status !== 'active') {
        return { success: false, message: 'Subscription is not active' };
      }

      console.log(`🔧 Force processing subscription: ${subscriptionId}`);
      await this.processSubscriptionPayment(subscription);

      return { success: true, message: 'Payment processed successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message };
    }
  }

  /**
   * Update agent configuration
   */
  updateConfig(updates: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('🔧 Updated agent config:', this.config);

    // Restart if running to apply new interval
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Get payment statistics for monitoring
   */
  async getPaymentStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    pendingPayments: number;
    failedPayments24h: number;
    successfulPayments24h: number;
  }> {
    try {
      const exportedData = await subscriptionDb.exportData();
      const allSubscriptions = Object.entries(exportedData.subscriptionStates);
      const activeSubscriptions = allSubscriptions.filter(([_, sub]) => sub.status === 'active');
      const dueSubscriptions = await subscriptionDb.getSubscriptionsDueForPayment();

      // Get recent payment events (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      let failedPayments24h = 0;
      let successfulPayments24h = 0;

      const eventsData = exportedData.agentPaymentEvents;
      Object.values(eventsData).forEach((events: AgentPaymentEvent[]) => {
        events.forEach(event => {
          if (event.processedAt && event.processedAt > oneDayAgo) {
            if (event.status === 'failed') {
              failedPayments24h++;
            } else if (event.status === 'completed') {
              successfulPayments24h++;
            }
          }
        });
      });

      return {
        totalSubscriptions: allSubscriptions.length,
        activeSubscriptions: activeSubscriptions.length,
        pendingPayments: dueSubscriptions.length,
        failedPayments24h,
        successfulPayments24h,
      };
    } catch (error) {
      console.error('Error calculating payment stats:', error);
      return {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        pendingPayments: 0,
        failedPayments24h: 0,
        successfulPayments24h: 0,
      };
    }
  }
}

// Export singleton agent instance
export const x402Agent = new X402Agent({
  checkInterval: process.env.NODE_ENV === 'development' ? 30000 : 300000, // 30s in dev, 5min in prod
  maxRetries: 3,
  isEnabled: process.env.X402_AGENT_ENABLED !== 'false',
});