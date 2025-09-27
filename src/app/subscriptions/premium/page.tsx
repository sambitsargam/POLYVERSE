'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { LockClosedIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { x402SubscriptionService } from '@/lib/x402-subscription-service';
import Link from 'next/link';

interface PremiumContent {
  title: string;
  content: string;
  publishedAt: string;
  category: string;
  readTime: string;
  exclusive: boolean;
}

export default function PremiumContentPage() {
  const { address, isConnected } = useAccount();
  const [content, setContent] = useState<PremiumContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check subscription status
  useEffect(() => {
    if (isConnected) {
      const active = x402SubscriptionService.hasActiveSubscription();
      setHasSubscription(active);
    }
  }, [isConnected]);

  // Fetch premium content
  const fetchPremiumContent = async () => {
    if (!isConnected || !hasSubscription) {
      setError('Subscription required to access this content');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscriptions/premium-content', {
        method: 'GET',
        headers: {
          'x-subscription-token': 'active',
          'x-user-address': address || '',
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 402) {
        const data = await response.json();
        setError(data.message || 'Subscription required');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      setContent(data.data);

    } catch (err: any) {
      console.error('Content fetch error:', err);
      setError(err.message || 'Failed to load premium content');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch content when subscription is available
  useEffect(() => {
    if (hasSubscription && isConnected) {
      fetchPremiumContent();
    }
  }, [hasSubscription, isConnected]);

  const activeSubscriptions = hasSubscription ? x402SubscriptionService.getActiveSubscriptions() : [];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <LockClosedIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Premium Content</h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect your wallet to access exclusive subscriber content
            </p>
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <LockClosedIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Subscription Required</h1>
            <p className="text-lg text-gray-600 mb-8">
              This content is exclusive to POLYVERSE subscribers. Subscribe now to unlock premium market analysis, 
              exclusive tutorials, and expert insights.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">What you'll get:</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                  Weekly market analysis and insights
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                  Exclusive trading recommendations
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                  Early access to new features
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                  Priority customer support
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <Link
                href="/subscriptions"
                className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                View Subscription Plans
              </Link>
              <p className="text-sm text-gray-500">
                Powered by x402 protocol • Instant activation • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subscription Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-green-800">Active Subscription</h3>
                <p className="text-sm text-green-700">
                  {activeSubscriptions.length} active subscription(s)
                </p>
              </div>
            </div>
            <Link
              href="/subscriptions"
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Manage →
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading premium content...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <LockClosedIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Access Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchPremiumContent}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : content ? (
            <article className="p-8">
              <header className="mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {content.category}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {content.readTime}
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Published: {new Date(content.publishedAt).toLocaleDateString()}</span>
                  {content.exclusive && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Subscribers Only
                    </span>
                  )}
                </div>
              </header>

              <div className="prose prose-lg max-w-none">
                <div
                  className="whitespace-pre-wrap text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: content.content.replace(/\n/g, '<br />').replace(/# (.*?)<br \/>/g, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>').replace(/## (.*?)<br \/>/g, '<h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">$1</h3>')
                  }}
                />
              </div>

              <footer className="mt-12 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    💎 <strong>Exclusive Content:</strong> This analysis is only available to POLYVERSE subscribers. 
                    Thank you for supporting quality crypto content!
                  </p>
                </div>
              </footer>
            </article>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600">No content available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}