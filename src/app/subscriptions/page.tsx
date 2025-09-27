'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CheckIcon, ClockIcon, StarIcon } from '@heroicons/react/24/solid';
import { x402SubscriptionService, SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/x402-subscription-service';
import { showToast } from '@/components/Toast';

interface ActiveSubscription {
  planId: string;
  startTime: number;
  endTime: number;
  txHash: string;
  network: string;
  isActive: boolean;
}

export default function SubscriptionsPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [loading, setLoading] = useState<string | null>(null);
  const [activeSubscriptions, setActiveSubscriptions] = useState<ActiveSubscription[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize x402 service with wallet
  useEffect(() => {
    if (walletClient && !initialized) {
      x402SubscriptionService.initializeClientWallet(walletClient);
      setInitialized(true);
    }
  }, [walletClient, initialized]);

  // Load active subscriptions
  useEffect(() => {
    if (isConnected) {
      setActiveSubscriptions(x402SubscriptionService.getActiveSubscriptions());
    }
  }, [isConnected]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!isConnected || !walletClient) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    if (!initialized) {
      showToast('Wallet not initialized. Please try again.', 'error');
      return;
    }

    // Check if already subscribed
    if (x402SubscriptionService.hasActiveSubscription(plan.id)) {
      showToast('You already have an active subscription to this plan', 'info');
      return;
    }

    setLoading(plan.id);
    
    try {
      showToast('Initiating subscription payment...', 'info');
      
      const result = await x402SubscriptionService.purchaseSubscription(plan);
      
      if (result.success) {
        showToast(`Successfully subscribed to ${plan.name}!`, 'success');
        setActiveSubscriptions(x402SubscriptionService.getActiveSubscriptions());
        
        if (result.txHash) {
          showToast(`Transaction: ${result.txHash}`, 'info');
        }
      } else {
        showToast(result.error || 'Subscription failed', 'error');
      }
      
    } catch (error: any) {
      console.error('Subscription error:', error);
      showToast(error.message || 'Failed to process subscription', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async (planId: string) => {
    const success = x402SubscriptionService.cancelSubscription(planId);
    
    if (success) {
      showToast('Subscription cancelled successfully', 'success');
      setActiveSubscriptions(x402SubscriptionService.getActiveSubscriptions());
    } else {
      showToast('Failed to cancel subscription', 'error');
    }
  };

  const formatTimeRemaining = (endTime: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    
    if (days > 0) return `${days} days remaining`;
    if (hours > 0) return `${hours} hours remaining`;
    return 'Less than 1 hour remaining';
  };

  const getSubscriptionStatus = (planId: string) => {
    return x402SubscriptionService.getSubscriptionStatus(planId);
  };

  const renderPricingCard = (plan: SubscriptionPlan) => {
    const status = getSubscriptionStatus(plan.id);
    const isLoading = loading === plan.id;
    const isActive = status === 'active';
    const activeSubscription = activeSubscriptions.find(sub => sub.planId === plan.id);

    return (
      <div key={plan.id} className={`relative bg-white rounded-lg shadow-lg p-8 ${plan.isPopular ? 'ring-2 ring-primary' : ''}`}>
        {plan.isPopular && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
              <StarIcon className="w-4 h-4 mr-1" />
              Most Popular
            </span>
          </div>
        )}

        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <p className="text-gray-600 mb-4">{plan.description}</p>
          <div className="mb-4">
            <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
            <span className="text-gray-600 ml-2">
              /{plan.duration >= 365 * 24 * 60 * 60 ? 'year' : 
                plan.duration >= 30 * 24 * 60 * 60 ? 'month' : 'week'}
            </span>
          </div>
          <div className="text-sm text-gray-500 mb-6">
            Network: {plan.network === 'polygon' ? 'Polygon Mainnet' : 'Polygon Amoy Testnet'}
          </div>
        </div>

        <div className="mb-8">
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {isActive && activeSubscription ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center text-green-600 mb-2">
                <CheckIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">Active Subscription</span>
              </div>
              <p className="text-sm text-green-700">
                {formatTimeRemaining(activeSubscription.endTime)}
              </p>
              {activeSubscription.txHash && (
                <p className="text-xs text-green-600 mt-2 truncate">
                  TX: {activeSubscription.txHash}
                </p>
              )}
            </div>
            <button
              onClick={() => handleCancel(plan.id)}
              className="w-full py-3 px-4 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleSubscribe(plan)}
            disabled={isLoading || !isConnected}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              plan.isPopular
                ? 'bg-primary text-white hover:bg-primary-dark disabled:opacity-50'
                : 'border-2 border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-50'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Subscribe Now'
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Premium Subscriptions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock exclusive content and features with our subscription plans. 
            Powered by x402 protocol on Polygon for instant, gasless payments.
          </p>
        </div>

        {/* x402 Protocol Information */}
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">x402 Protocol Integration</h3>
              <p className="text-blue-800 mb-2">
                This subscription system uses the <strong>x402 micropayment protocol</strong> with <strong>Polygon Amoy testnet</strong> 
                for secure, decentralized payments following the official specification.
              </p>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• <strong>Network:</strong> Polygon Amoy (chainId: 80002)</p>
                <p>• <strong>Payment Token:</strong> USDC (0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582)</p>
                <p>• <strong>Protocol:</strong> EIP-3009 TransferWithAuthorization</p>
                <p>• <strong>Security:</strong> EIP-712 signature verification</p>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                <strong>Note:</strong> Payment verification requires a proper x402 facilitator and user wallet connection. 
                Demo mode currently simulates the complete flow for demonstration purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 text-center">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-yellow-700 mb-4">
              Connect your wallet to manage subscriptions and make payments
            </p>
            <ConnectButton />
          </div>
        )}

        {/* Active Subscriptions Summary */}
        {isConnected && activeSubscriptions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-blue-800 mb-3">
              Active Subscriptions ({activeSubscriptions.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSubscriptions.map(sub => {
                const plan = SUBSCRIPTION_PLANS.find(p => p.id === sub.planId);
                return (
                  <div key={sub.planId} className="bg-white rounded-lg p-4 shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{plan?.name}</span>
                      <ClockIcon className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatTimeRemaining(sub.endTime)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map(renderPricingCard)}
        </div>

        {/* X402 Protocol Info */}
        <div className="mt-16 bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Powered by x402 Protocol
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Our subscription system uses the x402 protocol for seamless, gasless payments on Polygon. 
              Experience instant subscription activation with minimal fees and maximum security.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Instant Activation</h3>
                <p className="text-sm text-gray-600">Subscriptions activate immediately after payment</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <StarIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Low Fees</h3>
                <p className="text-sm text-gray-600">Minimal transaction costs on Polygon network</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ClockIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Flexible Plans</h3>
                <p className="text-sm text-gray-600">Choose from weekly, monthly, or yearly options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}