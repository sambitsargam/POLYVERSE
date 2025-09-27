'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/wallet';
import { SubscriptionPlan, SubscriptionState, AgentPaymentEvent } from '@/lib/x402-service';
import { Address } from 'viem';

interface SubscriptionWithPlan extends SubscriptionState {
  plan?: SubscriptionPlan;
}

interface AgentStatus {
  isRunning: boolean;
  config: {
    checkInterval: number;
    maxRetries: number;
    isEnabled: boolean;
  };
  nextCheck: Date | null;
  totalProcessed: number;
  stats: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    pendingPayments: number;
    failedPayments24h: number;
    successfulPayments24h: number;
  };
}

export default function X402DemoPage() {
  const { address: walletAddress, connectWallet, isConnected } = useWallet();
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<SubscriptionWithPlan[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New subscription plan form
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    priceUSD: '',
    interval: 'monthly' as 'daily' | 'weekly' | 'monthly',
    intervalCount: 1,
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [walletAddress]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load subscription plans
      const plansResponse = await fetch('/api/x402/plans');
      const plansData = await plansResponse.json();
      if (plansData.success) {
        setSubscriptionPlans(plansData.plans);
      }

      // Load user subscriptions if wallet connected
      if (walletAddress) {
        const subsResponse = await fetch(`/api/x402/subscriptions?subscriberId=${walletAddress}`);
        const subsData = await subsResponse.json();
        if (subsData.success) {
          setUserSubscriptions(subsData.subscriptions);
        }
      }

      // Load agent status
      const agentResponse = await fetch('/api/x402/agent');
      const agentData = await agentResponse.json();
      if (agentData.success) {
        setAgentStatus(agentData.agent);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const createSubscriptionPlan = async () => {
    if (!newPlan.name || !newPlan.priceUSD) {
      setError('Name and price are required');
      return;
    }

    try {
      const response = await fetch('/api/x402/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: `creator_${walletAddress?.slice(-8)}`, // Demo creator ID
          name: newPlan.name,
          description: newPlan.description,
          priceUSD: parseFloat(newPlan.priceUSD),
          interval: newPlan.interval,
          intervalCount: newPlan.intervalCount,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewPlan({
          name: '',
          description: '',
          priceUSD: '',
          interval: 'monthly',
          intervalCount: 1,
        });
        loadData(); // Reload data
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plan');
    }
  };

  const subscribeToPlan = async (planId: string) => {
    if (!walletAddress) {
      await connectWallet();
      return;
    }

    try {
      const response = await fetch('/api/x402/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          subscriberId: walletAddress,
          creatorId: subscriptionPlans.find(p => p.id === planId)?.creatorId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        loadData(); // Reload data
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
    }
  };

  const controlAgent = async (action: string, config?: any) => {
    try {
      const response = await fetch('/api/x402/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, config }),
      });

      const data = await response.json();
      if (data.success) {
        loadData(); // Reload agent status
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to control agent');
    }
  };

  const forceProcessSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch('/api/x402/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'force-process',
          subscriptionId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        loadData(); // Reload data
      } else {
        setError(data.message || 'Failed to process payment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  const formatInterval = (interval: string, count: number = 1) => {
    const unit = count === 1 ? interval.slice(0, -2) : interval;
    return count === 1 ? unit : `${count} ${unit}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading x402 Subscription System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">x402 Agentic Subscriptions</h1>
          <p className="mt-2 text-gray-600">
            Decentralized recurring payments powered by x402 protocol on Polygon Amoy
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Wallet Connection */}
        {!isConnected ? (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
            <p className="text-gray-600 mb-4">
              Connect your MetaMask wallet to interact with x402 subscriptions on Polygon Amoy.
            </p>
            <button
              onClick={connectWallet}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Connect MetaMask
            </button>
          </div>
        ) : (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Connected Wallet</h2>
            <p className="text-gray-600">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {walletAddress}
              </span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Plans & Subscriptions */}
          <div className="space-y-8">
            {/* Create New Plan */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Create Subscription Plan</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Premium Monthly"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Access to premium content..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newPlan.priceUSD}
                      onChange={(e) => setNewPlan({...newPlan, priceUSD: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="9.99"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interval
                    </label>
                    <select
                      value={newPlan.interval}
                      onChange={(e) => setNewPlan({...newPlan, interval: e.target.value as any})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={createSubscriptionPlan}
                  className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
                >
                  Create Plan
                </button>
              </div>
            </div>

            {/* Available Plans */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Available Subscription Plans</h2>
              {subscriptionPlans.length === 0 ? (
                <p className="text-gray-500">No subscription plans available</p>
              ) : (
                <div className="space-y-4">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        <span className="text-xl font-bold text-green-600">
                          ${plan.priceUSD}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{plan.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Every {formatInterval(plan.interval, plan.intervalCount)}
                        </span>
                        <button
                          onClick={() => subscribeToPlan(plan.id)}
                          disabled={!walletAddress}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                        >
                          Subscribe
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Subscriptions */}
            {walletAddress && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">My Subscriptions</h2>
                {userSubscriptions.length === 0 ? (
                  <p className="text-gray-500">No active subscriptions</p>
                ) : (
                  <div className="space-y-4">
                    {userSubscriptions.map((subscription) => (
                      <div key={subscription.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{subscription.plan?.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                            subscription.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {subscription.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Next Payment: {formatDate(subscription.nextPaymentDate)}</p>
                          {subscription.lastPaymentDate && (
                            <p>Last Payment: {formatDate(subscription.lastPaymentDate)}</p>
                          )}
                          <p>Total Paid: ${(parseFloat(subscription.totalPaid) / 1e6).toFixed(2)}</p>
                          {subscription.failedPayments > 0 && (
                            <p className="text-red-600">
                              Failed Payments: {subscription.failedPayments}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => forceProcessSubscription(subscription.id)}
                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Force Payment
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Agent Status & Controls */}
          <div className="space-y-8">
            {/* Agent Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">x402 Agent Status</h2>
              {agentStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      agentStatus.isRunning ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {agentStatus.isRunning ? 'Running' : 'Stopped'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Check Interval:</span>
                      <p className="font-semibold">{(agentStatus.config.checkInterval / 1000)}s</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Retries:</span>
                      <p className="font-semibold">{agentStatus.config.maxRetries}</p>
                    </div>
                  </div>
                  {agentStatus.nextCheck && (
                    <div className="text-sm">
                      <span className="text-gray-600">Next Check:</span>
                      <p className="font-semibold">{formatDate(agentStatus.nextCheck)}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Loading agent status...</p>
              )}
            </div>

            {/* Agent Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Agent Controls</h2>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => controlAgent('start')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                  >
                    Start Agent
                  </button>
                  <button
                    onClick={() => controlAgent('stop')}
                    className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
                  >
                    Stop Agent
                  </button>
                </div>
                <button
                  onClick={() => loadData()}
                  className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                >
                  Refresh Status
                </button>
              </div>
            </div>

            {/* Payment Statistics */}
            {agentStatus?.stats && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Statistics</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-blue-600 font-semibold text-lg">
                      {agentStatus.stats.totalSubscriptions}
                    </p>
                    <p className="text-blue-800">Total Subscriptions</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-green-600 font-semibold text-lg">
                      {agentStatus.stats.activeSubscriptions}
                    </p>
                    <p className="text-green-800">Active</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-yellow-600 font-semibold text-lg">
                      {agentStatus.stats.pendingPayments}
                    </p>
                    <p className="text-yellow-800">Pending Payments</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-red-600 font-semibold text-lg">
                      {agentStatus.stats.failedPayments24h}
                    </p>
                    <p className="text-red-800">Failed (24h)</p>
                  </div>
                </div>
              </div>
            )}

            {/* x402 Protocol Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">x402 Protocol Info</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Network:</strong> Polygon Amoy (Testnet)</p>
                <p><strong>Payment Asset:</strong> USDC</p>
                <p><strong>Facilitator:</strong> x402.org (Demo)</p>
                <p><strong>Chain ID:</strong> 80002</p>
              </div>
              <div className="mt-4">
                <a
                  href="https://x402.gitbook.io/x402"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 underline"
                >
                  Learn more about x402 →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}