'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SubscriptionTier, Product, MockRates } from '@/lib/types';
import { formatCurrency, formatTokenAmount } from '@/lib/utils';
import { MockDataStore } from '@/lib/mockData';
import { showToast } from './Toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SubscriptionTier | Product | null;
  itemType: 'subscription' | 'product' | 'tip';
  creatorId: string;
  tipAmount?: number;
}

export const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  item, 
  itemType, 
  creatorId,
  tipAmount = 0 
}: CheckoutModalProps) => {
  const [selectedToken, setSelectedToken] = useState<'MATIC' | 'ETH' | 'USDC'>('USDC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mockRates, setMockRates] = useState<MockRates | null>(null);

  useEffect(() => {
    if (isOpen) {
      MockDataStore.getMockRates().then(setMockRates);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const getItemPrice = (): number => {
    if (itemType === 'tip') return tipAmount;
    if ('priceUSD' in item) return item.priceUSD;
    return 0;
  };

  const getItemName = (): string => {
    if (itemType === 'tip') return 'Tip';
    if ('name' in item) return item.name;
    if ('title' in item) return item.title;
    return 'Unknown Item';
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // TODO: integrate 1inch Fusion+ here
      const purchase = await MockDataStore.simulatePayment(
        'mock_user_123', // TODO: Get from wallet connection
        creatorId,
        item.id,
        itemType,
        getItemPrice(),
        selectedToken
      );

      showToast('Payment successful! Transaction confirmed.', 'success');
      onClose();
    } catch (error) {
      showToast('Payment failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const tokenAmount = mockRates ? 
    getItemPrice() * (selectedToken === 'MATIC' ? mockRates.USD_TO_MATIC : 
                     selectedToken === 'ETH' ? mockRates.USD_TO_ETH : 
                     mockRates.USD_TO_USDC) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Complete Purchase</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Item Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">{getItemName()}</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Price:</span>
              <span className="text-xl font-semibold text-primary">
                {formatCurrency(getItemPrice())}
              </span>
            </div>
          </div>

          {/* Token Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pay with:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['USDC', 'MATIC', 'ETH'] as const).map((token) => (
                <button
                  key={token}
                  onClick={() => setSelectedToken(token)}
                  className={`
                    p-3 rounded-lg border text-center transition-all
                    ${selectedToken === token
                      ? 'border-primary bg-primary bg-opacity-10 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="font-medium">{token}</div>
                  {mockRates && (
                    <div className="text-sm text-gray-500 mt-1">
                      {formatTokenAmount(tokenAmount, token)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount (USD):</span>
              <span>{formatCurrency(getItemPrice())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Network fees:</span>
              <span className="text-green-600">~$0.01 {selectedToken}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{mockRates && formatTokenAmount(tokenAmount, selectedToken)}</span>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="btn-primary w-full"
          >
            {isProcessing ? 'Processing Payment...' : `Pay ${formatTokenAmount(tokenAmount, selectedToken)} (Simulate)`}
          </button>

          <p className="text-xs text-gray-500 text-center">
            This is a mock payment for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
};