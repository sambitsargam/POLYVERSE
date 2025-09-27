'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SubscriptionTier, Product } from '@/lib/types';
import { showToast } from './Toast';
import { useWallet } from '@/lib/wallet';

// TODO: Implement KiraPay integration
interface KiraPayConfig {
  apiKey: string;
  baseUrl: string;
  supportedTokens: string[];
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SubscriptionTier | Product | null;
  itemType: 'subscription' | 'product' | 'tip';
  creatorId: string;
  tipAmount?: number;
}

export function CheckoutModal({ isOpen, onClose, item, itemType, creatorId, tipAmount }: CheckoutModalProps) {
  const { isConnected, address, connectWallet } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'processing' | 'completed' | 'error'>('select');

  // TODO: Initialize KiraPay SDK
  const [kiraPayConfig, setKiraPayConfig] = useState<KiraPayConfig | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      // TODO: Load KiraPay configuration
      setKiraPayConfig({
        apiKey: process.env.NEXT_PUBLIC_KIRAPAY_API_KEY || '',
        baseUrl: process.env.NEXT_PUBLIC_KIRAPAY_BASE_URL || '',
        supportedTokens: ['USDC', 'USDT', 'ETH', 'MATIC']
      });
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (!isConnected || !address) {
      await connectWallet();
      return;
    }

    if (!item) return;

    setIsProcessing(true);
    setStep('processing');

    try {
      // TODO: Implement KiraPay payment processing
      const paymentAmount = itemType === 'tip' ? tipAmount : item.priceUSD;
      
      console.log('TODO: KiraPay payment processing:', {
        amount: paymentAmount,
        recipient: creatorId,
        payer: address,
        itemType,
        itemName: 'title' in item ? item.title : 'name' in item ? item.name : 'Tip'
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStep('completed');
      showToast('Payment successful!', 'success');
      
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Payment failed:', error);
      setStep('error');
      showToast('Payment failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const getDisplayPrice = () => {
    return itemType === 'tip' ? tipAmount || 0 : item?.priceUSD || 0;
  };

  const getDisplayName = () => {
    if (itemType === 'tip') return 'Tip to Creator';
    if (item && 'title' in item) return item.title;
    if (item && 'name' in item) return item.name;
    return 'Item';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Checkout</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {step === 'select' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-lg">{getDisplayName()}</h3>
                <p className="text-gray-600 mt-1">
                  {itemType === 'subscription' && item && 'interval' in item 
                    ? `$${getDisplayPrice()}/month` 
                    : `$${getDisplayPrice()}`}
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-gray-500 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">KiraPay Integration</h3>
                  <p className="text-sm">
                    TODO: Implement KiraPay payment processing
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-blue-900 mb-2">Integration Features:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Multi-token payment support</li>
                    <li>• Cross-chain transactions</li>
                    <li>• Real-time payment processing</li>
                    <li>• Automatic token conversion</li>
                    <li>• Creator payout management</li>
                  </ul>
                </div>
              </div>

              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Connect Wallet to Continue
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                  
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  >
                    {isProcessing ? 'Processing...' : `Pay $${getDisplayPrice()} with KiraPay`}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we process your payment through KiraPay...</p>
            </div>
          )}

          {step === 'completed' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your payment has been processed successfully.</p>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❌</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
              <p className="text-gray-600 mb-4">There was an error processing your payment.</p>
              <button
                onClick={() => setStep('select')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
