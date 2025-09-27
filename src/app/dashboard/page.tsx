'use client';

import { useState, useEffect } from 'react';
import { BanknotesIcon, UsersIcon, ChartBarIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Creator, Purchase, Product, DashboardStats } from '@/lib/types';
import { MockDataStore } from '@/lib/mockData';
import { formatCurrency, formatNumber, calculateMRR, getActiveSubscribers, getTotalEarnings } from '@/lib/utils';
import { SmallLineChart } from '@/components/SmallLineChart';
import { FileUploader } from '@/components/FileUploader';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    mrr: 0,
    totalEarnings: 0,
    activeSubscribers: 0,
    recentTransactions: [],
  });
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const creatorsData = await MockDataStore.getCreators();
        const purchases = MockDataStore.getPurchases();
        
        setCreators(creatorsData);
        
        // Calculate dashboard stats
        const mrr = calculateMRR(creatorsData, purchases);
        const totalEarnings = getTotalEarnings(purchases);
        const activeSubscribers = getActiveSubscribers(purchases);
        const recentTransactions = purchases
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);

        setStats({
          mrr,
          totalEarnings,
          activeSubscribers,
          recentTransactions,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mock data for charts
  const mrrData = [2100, 2300, 2150, 2400, 2600, 2800, stats.mrr];
  const subscriberData = [45, 52, 48, 61, 67, 73, stats.activeSubscribers];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your content and track your earnings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* MRR Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</h3>
              <BanknotesIcon className="w-5 h-5 text-green-500" />
            </div>
            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.mrr)}</div>
              <div className="text-sm text-green-600 mt-1">+12.5% from last month</div>
            </div>
            <SmallLineChart data={mrrData} color="#10B981" />
          </div>

          {/* Total Earnings Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Earnings</h3>
              <ChartBarIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</div>
              <div className="text-sm text-green-600 mt-1">All-time earnings</div>
            </div>
            <div className="text-sm text-gray-500">
              Across {stats.recentTransactions.length} transactions
            </div>
          </div>

          {/* Active Subscribers Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Active Subscribers</h3>
              <UsersIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900">{formatNumber(stats.activeSubscribers)}</div>
              <div className="text-sm text-blue-600 mt-1">+8 new this week</div>
            </div>
            <SmallLineChart data={subscriberData} color="#3B82F6" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {stats.recentTransactions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No transactions yet. Start sharing your content to see earnings here!
                  </div>
                ) : (
                  stats.recentTransactions.map((transaction) => {
                    const creator = creators.find(c => c.id === transaction.creatorId);
                    return (
                      <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-3">
                              <div className={`
                                w-2 h-2 rounded-full
                                ${transaction.status === 'completed' ? 'bg-green-500' : 
                                  transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}
                              `} />
                              <span className="font-medium text-gray-900 capitalize">
                                {transaction.itemType}
                              </span>
                              <span className="text-sm text-gray-500">
                                {transaction.itemId}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {new Date(transaction.createdAt).toLocaleDateString()} • 
                              {transaction.tokenAmount.toFixed(4)} {transaction.token}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(transaction.amountUSD)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Upload New Product */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Product</h3>
              
              {!showUploadForm ? (
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Product
                </button>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Product title"
                    className="input-field"
                  />
                  <textarea
                    placeholder="Product description"
                    rows={3}
                    className="input-field resize-none"
                  />
                  <select className="input-field">
                    <option value="">Select type</option>
                    <option value="course">Course</option>
                    <option value="ebook">eBook</option>
                    <option value="digital_art">Digital Art</option>
                    <option value="program">Program</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price in USD"
                    className="input-field"
                    min="0"
                    step="0.01"
                  />
                  
                  <FileUploader />
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowUploadForm(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button className="btn-primary flex-1">
                      Upload
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">Manage Tiers</div>
                  <div className="text-sm text-gray-500">Update subscription offerings</div>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">Analytics</div>
                  <div className="text-sm text-gray-500">View detailed insights</div>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">Withdraw Earnings</div>
                  <div className="text-sm text-gray-500">Transfer to wallet</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}