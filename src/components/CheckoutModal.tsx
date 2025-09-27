'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SubscriptionTier, Product } from '@/lib/types';
import { showToast } from './Toast';
import { createPaymentLink } from '@/lib/kirapay-api';
import { CreateLinkRequest } from '@/types/kirapay';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SubscriptionTier | Product | null;
  itemType: 'subscription' | 'product' | 'tip';
  creatorId: string;
  tipAmount?: number;
}

export function CheckoutModal({ isOpen, onClose, item, itemType, creatorId, tipAmount }: CheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'processing' | 'completed' | 'error'>('input');
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [receiverAddress, setReceiverAddress] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setPaymentLink(null);
      setReceiverAddress('');
    }
  }, [isOpen, item, tipAmount]);

  const getDisplayPrice = () => {
    return itemType === 'tip' ? tipAmount || 0 : item?.priceUSD || 0;
  };

  const getDisplayName = () => {
    if (itemType === 'tip') return 'Tip to Creator';
    if (item && 'title' in item) return item.title;
    if (item && 'name' in item) return item.name;
    return 'Item';
  };

  const handleCreatePaymentLink = async () => {
    if (!receiverAddress.trim()) {
      showToast('Please enter a receiver wallet address', 'error');
      return;
    }

    setIsProcessing(true);
    setStep('processing');

    try {
      const amount = getDisplayPrice();
      const linkRequest: CreateLinkRequest = {
        currency: 'USDC',
        receiver: receiverAddress,
        price: amount,
        name: `${getDisplayName()} - ${itemType}`,
        redirectUrl: window.location.origin + '/payment-success'
      };

      const response = await createPaymentLink(linkRequest);
      setPaymentLink(response.data.url);
      setStep('completed');
      showToast('Payment link created successfully!', 'success');
    } catch (error) {
      console.error('Payment link creation failed:', error);
      setStep('error');
      showToast(error instanceof Error ? error.message : 'Failed to create payment link', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Payment link copied to clipboard!', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Create Payment Link
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content based on step */}
                {step === 'input' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item
                      </label>
                      <p className="text-gray-900 font-semibold">{getDisplayName()}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount
                      </label>
                      <p className="text-gray-900 font-semibold">${getDisplayPrice().toFixed(2)} USD</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Receiver Wallet Address *
                      </label>
                      <input
                        type="text"
                        value={receiverAddress}
                        onChange={(e) => setReceiverAddress(e.target.value)}
                        placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter the wallet address that will receive the payment
                      </p>
                    </div>
                  </div>
                )}

                {step === 'processing' && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Creating payment link...</p>
                  </div>
                )}

                {step === 'completed' && paymentLink && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Payment Link Created!
                      </h4>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Link
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={paymentLink}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(paymentLink)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Share this link with the payer to complete the transaction
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(paymentLink, '_blank')}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Open Payment Link
                      </button>
                      <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {step === 'error' && (
                  <div className="text-center py-8">
                    <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Payment Link Creation Failed
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Please check your inputs and try again.
                    </p>
                    <button
                      onClick={() => setStep('input')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          {step === 'input' && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                onClick={handleCreatePaymentLink}
                disabled={isProcessing}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-blue-400"
              >
                {isProcessing ? 'Creating...' : 'Create Payment Link'}
              </button>
              <button
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}