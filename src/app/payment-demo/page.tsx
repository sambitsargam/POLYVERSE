'use client';

import { useState } from 'react';
import { showToast } from '@/components/Toast';
import { createPaymentLink, getPaymentLinks, getLinkByCode, getAllTransactions } from '@/lib/kirapay-api';
import { CreateLinkRequest, PaymentLink, Transaction } from '@/types/kirapay';

export default function KiraPayDemo() {
  const [activeTab, setActiveTab] = useState<'create' | 'links' | 'lookup' | 'transactions'>('create');
  
  // Create Link State
  const [createFormData, setCreateFormData] = useState<CreateLinkRequest>({
    currency: 'USDC',
    receiver: '',
    price: 0,
    name: '',
    redirectUrl: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  
  // Links State
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksPage, setLinksPage] = useState(1);
  
  // Lookup State
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState<PaymentLink | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  
  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const handleCreateLink = async () => {
    if (!createFormData.receiver || !createFormData.price || !createFormData.name) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setCreateLoading(true);
    try {
      const response = await createPaymentLink(createFormData);
      setCreatedLink(response.data.url);
      showToast('Payment link created successfully!', 'success');
      
      // Reset form
      setCreateFormData({
        currency: 'USDC',
        receiver: '',
        price: 0,
        name: '',
        redirectUrl: ''
      });
    } catch (error) {
      console.error('Create link error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to create payment link', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLoadLinks = async (page = 1) => {
    setLinksLoading(true);
    try {
      const response = await getPaymentLinks(page, 10);
      setPaymentLinks(response.data.links);
      setLinksPage(page);
      showToast(`Loaded ${response.data.links.length} payment links`, 'success');
    } catch (error) {
      console.error('Load links error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to load payment links', 'error');
    } finally {
      setLinksLoading(false);
    }
  };

  const handleLookupLink = async () => {
    if (!lookupCode.trim()) {
      showToast('Please enter a link code', 'error');
      return;
    }

    setLookupLoading(true);
    try {
      const response = await getLinkByCode(lookupCode.trim());
      setLookupResult(response.data);
      showToast('Link found successfully!', 'success');
    } catch (error) {
      console.error('Lookup error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to find link', 'error');
      setLookupResult(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleLoadTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const response = await getAllTransactions();
      setTransactions(response.data.transactions);
      showToast(`Loaded ${response.data.transactions.length} transactions`, 'success');
    } catch (error) {
      console.error('Load transactions error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to load transactions', 'error');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          KiraPay API Demo
        </h1>
        <p className="text-gray-600">
          Create payment links, manage transactions, and explore the KiraPay API
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'create', label: 'Create Link' },
              { id: 'links', label: 'My Links' },
              { id: 'lookup', label: 'Link Lookup' },
              { id: 'transactions', label: 'Transactions' }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Create Link Tab */}
            {activeTab === 'create' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Create Payment Link
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency *
                    </label>
                    <select
                      value={createFormData.currency}
                      onChange={(e) => setCreateFormData({ ...createFormData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USDC">USDC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={createFormData.price}
                      onChange={(e) => setCreateFormData({ ...createFormData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Receiver Address *
                    </label>
                    <input
                      type="text"
                      value={createFormData.receiver}
                      onChange={(e) => setCreateFormData({ ...createFormData, receiver: e.target.value })}
                      placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Name *
                    </label>
                    <input
                      type="text"
                      value={createFormData.name}
                      onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                      placeholder="Order #A1209"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Redirect URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={createFormData.redirectUrl}
                      onChange={(e) => setCreateFormData({ ...createFormData, redirectUrl: e.target.value })}
                      placeholder="https://merchant.example.com/thank-you"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreateLink}
                  disabled={createLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {createLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating Link...
                    </>
                  ) : (
                    <>
                      Create Payment Link
                    </>
                  )}
                </button>

                {createdLink && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-green-800 mb-2">
                      Payment Link Created!
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-green-700 font-mono text-sm flex-1 break-all">
                        {createdLink}
                      </p>
                      <button
                        onClick={() => copyToClipboard(createdLink)}
                        className="p-2 text-green-600 hover:text-green-800 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Links Tab */}
            {activeTab === 'links' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    My Payment Links
                  </h2>
                  <button
                    onClick={() => handleLoadLinks(1)}
                    disabled={linksLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {linksLoading ? 'Loading...' : 'Load Links'}
                  </button>
                </div>

                {paymentLinks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-12 w-12 text-gray-400 mx-auto mb-4">📎</div>
                    <p className="text-gray-500">No payment links found. Click "Load Links" to fetch your links.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentLinks.map((link) => (
                      <div key={link._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {link.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {link.price} {link.tokenOut.symbol}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Created: {new Date(link.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              Code: {link.code}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => copyToClipboard(link.url)}
                              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                              title="Copy link"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => window.open(link.url, '_blank')}
                              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                              title="Open link"
                            >
                              Open
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Lookup Tab */}
            {activeTab === 'lookup' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Link Lookup
                </h2>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value)}
                    placeholder="Enter link code (e.g., abc123def4)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleLookupLink()}
                  />
                  <button
                    onClick={handleLookupLink}
                    disabled={lookupLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {lookupLoading ? 'Looking up...' : 'Lookup'}
                  </button>
                </div>

                {lookupResult && (
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Link Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="text-gray-900">{lookupResult.name}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                        <p className="text-gray-900">
                          {lookupResult.price} {lookupResult.tokenOut.symbol}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Receiver</label>
                        <p className="text-gray-900 font-mono text-sm break-all">
                          {lookupResult.receiver}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Payment URL</label>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900 font-mono text-sm flex-1 break-all">
                            {lookupResult.url}
                          </p>
                          <button
                            onClick={() => copyToClipboard(lookupResult.url)}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Created</label>
                        <p className="text-gray-900 text-sm">
                          {new Date(lookupResult.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Wallet Transactions
                  </h2>
                  <button
                    onClick={handleLoadTransactions}
                    disabled={transactionsLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {transactionsLoading ? 'Loading...' : 'Load Transactions'}
                  </button>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-12 w-12 text-gray-400 mx-auto mb-4">📋</div>
                    <p className="text-gray-500">No transactions found. Click "Load Transactions" to fetch your transactions.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {transaction.amount} {transaction.token}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(transaction.createdAt).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              Hash: {transaction.transaction_hash.slice(0, 10)}...
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(transaction.transaction_hash)}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Copy transaction hash"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}