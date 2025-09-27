'use client';

import { useState, useEffect } from 'react';
import { BanknotesIcon, UsersIcon, ChartBarIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Creator, Purchase, Product, DashboardStats } from '@/lib/types';
import { formatCurrency, formatNumber, calculateMRR, getActiveSubscribers, getTotalEarnings } from '@/lib/utils';
import { SmallLineChart } from '@/components/SmallLineChart';
import { FileUploader } from '@/components/FileUploader';
import { useWallet } from '@/lib/wallet';

interface UploadedFile {
  cid: string
  name: string
  size: string
  uploadedAt: number
  price: string
  description: string
}

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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadFormData, setUploadFormData] = useState({
    price: '',
    description: '',
    name: ''
  });
  
  // Get wallet context
  const { isConnected, address } = useWallet();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const creatorsRes = await fetch('/data/creators.json');
        const creatorsData = await creatorsRes.json();
        const purchases = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
        
        setCreators(creatorsData);
        
        // Calculate dashboard stats
        const mrr = calculateMRR(creatorsData, purchases);
        const totalEarnings = getTotalEarnings(purchases);
        const activeSubscribers = getActiveSubscribers(purchases);
        const recentTransactions = purchases
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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

  const handleFileUpload = (result: { cid: string; size: string; name: string }) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first')
      return
    }

    const uploadedFile: UploadedFile = {
      ...result,
      uploadedAt: Date.now(),
      price: uploadFormData.price,
      description: uploadFormData.description
    }

    setUploadedFiles(prev => [...prev, uploadedFile])
    
    // Reset form
    setUploadFormData({ price: '', description: '', name: '' })
    setShowUploadForm(false)
    
    console.log('File uploaded to Filecoin:', uploadedFile)
    // TODO: Save to creator's inventory with CID
  }

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
                    value={uploadFormData.name}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <textarea
                    placeholder="Product description"
                    rows={3}
                    className="input-field resize-none"
                    value={uploadFormData.description}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <input
                    type="number"
                    placeholder="Price in USD"
                    className="input-field"
                    min="0"
                    step="0.01"
                    value={uploadFormData.price}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, price: e.target.value }))}
                  />
                  
                  <FileUploader
                    onUpload={handleFileUpload}
                  />
                  
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-sm font-medium text-emerald-800">Powered by Filecoin</span>
                    </div>
                    <p className="text-xs text-emerald-700">
                      Your content will be stored on Filecoin's decentralized network with automatic 
                      encryption and token-gated access control.
                    </p>
                  </div>
                  
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

        {/* Uploaded Files Section */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Your Filecoin Content</h3>
                <p className="text-sm text-gray-600 mt-1">Files uploaded to decentralized storage</p>
              </div>
              <div className="divide-y divide-gray-100">
                {uploadedFiles.map((file) => (
                  <div key={file.cid} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <h4 className="font-medium text-gray-900">{file.name}</h4>
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                            ${file.price}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Size: {(parseInt(file.size) / 1024).toFixed(1)} KB</span>
                          <span>Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}</span>
                          <span>Wallet: {address?.substring(0, 6)}...{address?.substring(-4)}</span>
                        </div>
                        <div className="mt-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                            CID: {file.cid}
                          </code>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="text-emerald-600 hover:text-emerald-700 text-sm">
                          Share
                        </button>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}