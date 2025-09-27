'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, LinkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
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

// Default admin/platform address for receiving payments
const ADMIN_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

export function CheckoutModal({ isOpen, onClose, item, itemType, creatorId, tipAmount }: CheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'processing' | 'payment' | 'completed' | 'error'>('processing');
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Auto-generate payment link when modal opens
      handleCreatePaymentLink();
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
    setIsProcessing(true);
    setStep('processing');
    setError(null);

    try {
      const amount = getDisplayPrice();
      const linkRequest: CreateLinkRequest = {
        currency: 'USDC',
        receiver: ADMIN_ADDRESS, // Auto-populated admin address
        price: amount,
        name: `${getDisplayName()} - ${itemType}`,
        redirectUrl: window.location.origin + '/payment-success'
      };

      const response = await createPaymentLink(linkRequest);
      setPaymentLink(response.data.url);
      setStep('payment');
      showToast('Payment link ready!', 'success');
    } catch (error) {
      console.error('Payment link creation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to create payment link');
      setStep('error');
      showToast('Failed to create payment link', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const openPaymentLink = () => {
    if (paymentLink) {
      window.open(paymentLink, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Complete Payment
                  </h3>
                  <button
                    onClick={onClose}
                    className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Item:</span>
                      <span className="font-medium">{getDisplayName()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">${getDisplayPrice().toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Recipient:</span>
                      <span className="text-xs font-mono">
                        {ADMIN_ADDRESS.slice(0, 8)}...{ADMIN_ADDRESS.slice(-6)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Content */}
                <div className="text-center">
                  {step === 'processing' && (
                    <div>
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Generating Payment Link...
                      </h4>
                      <p className="text-sm text-gray-600">
                        Please wait while we prepare your secure payment link.
                      </p>
                    </div>
                  )}

                  {step === 'payment' && paymentLink && (
                    <div>
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <LinkIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Payment Link Ready!
                      </h4>
                      <p className="text-sm text-gray-600 mb-6">
                        Your payment link has been generated. Click below to open the secure payment popup.
                      </p>
                      
                      <div className="space-y-3">
                        <button
                          onClick={openPaymentLink}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                        >
                          Open Payment Window
                        </button>
                        
                        <button
                          onClick={() => copyToClipboard(paymentLink)}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Copy Payment Link
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 'completed' && (
                    <div>
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Payment Completed!
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Thank you for your purchase. You should receive a confirmation shortly.
                      </p>
                      <button
                        onClick={onClose}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {step === 'error' && (
                    <div>
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Payment Error
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        {error || 'Something went wrong while processing your payment.'}
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={handleCreatePaymentLink}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={onClose}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}