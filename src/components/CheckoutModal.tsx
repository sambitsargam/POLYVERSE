'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SubscriptionTier, Product, MockRates } from '@/lib/types';
import { formatCurrency, formatTokenAmount } from '@/lib/utils';
import { MockDataStore } from '@/lib/mockData';
import { showToast } from './Toast';
import { useWallet } from '@/lib/wallet';
import { SUPPORTED_CHAINS, TOKENS, QuoteResponse, FusionIntent } from '@/lib/oneinch-fusion';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SubscriptionTier | Product | null;
  itemType: 'subscription' | 'product' | 'tip';
  creatorId: string;
  tipAmount?: number;
}

interface SwapState {
  step: 'select' | 'quote' | 'confirm' | 'processing' | 'completed' | 'error';
  quote: QuoteResponse | null;
  intent: FusionIntent | null;
  error: string | null;
  srcTxHash?: string;
  dstTxHash?: string;
}

export const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  item, 
  itemType, 
  creatorId,
  tipAmount = 0 
}: CheckoutModalProps) => {
  const { isConnected, address, chainId } = useWallet();
  const [selectedToken, setSelectedToken] = useState<'MATIC' | 'ETH' | 'USDC'>('USDC');
  const [selectedSourceChain, setSelectedSourceChain] = useState<number>(80002); // Polygon Amoy
  const [selectedDestChain, setSelectedDestChain] = useState<number>(11155111); // Sepolia
  const [isProcessing, setIsProcessing] = useState(false);
  const [mockRates, setMockRates] = useState<MockRates | null>(null);
  const [enable1InchFusion, setEnable1InchFusion] = useState(false);
  const [swapState, setSwapState] = useState<SwapState>({
    step: 'select',
    quote: null,
    intent: null,
    error: null
  });

  useEffect(() => {
    if (isOpen) {
      MockDataStore.getMockRates().then(setMockRates);
      setEnable1InchFusion(process.env.NEXT_PUBLIC_ENABLE_1INCH_FUSION === 'true');
      setSwapState({ step: 'select', quote: null, intent: null, error: null });
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

  // 1inch Fusion+ Integration Functions
  const getSourceToken = () => {
    if (selectedToken === 'MATIC') return TOKENS.WMATIC_AMOY;
    if (selectedToken === 'ETH') return TOKENS.WETH_SEPOLIA;
    return TOKENS.USDC_POLYGON_AMOY;
  };

  const getDestToken = () => {
    // Always use USDC on destination chain for creator payment
    return TOKENS.USDC_SEPOLIA;
  };

  const handleGetQuote = async () => {
    if (!isConnected || !address) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    setSwapState(prev => ({ ...prev, step: 'quote', error: null }));

    try {
      const sourceToken = getSourceToken();
      const destToken = getDestToken();
      const amountUSD = getItemPrice();
      
      // Convert USD to source token amount (mock conversion)
      const sourceAmount = (amountUSD * 1000000).toString(); // Mock: $1 = 1 token with 6 decimals

      const response = await fetch('/api/1inch/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          srcChainId: selectedSourceChain,
          dstChainId: selectedDestChain,
          srcTokenAddress: sourceToken.address,
          dstTokenAddress: destToken.address,
          amount: sourceAmount,
          walletAddress: address
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get quote');
      }

      setSwapState(prev => ({
        ...prev,
        step: 'confirm',
        quote: result.data
      }));

    } catch (error) {
      setSwapState(prev => ({
        ...prev,
        step: 'error',
        error: error instanceof Error ? error.message : 'Failed to get quote'
      }));
    }
  };

  const handleCreateIntent = async () => {
    if (!swapState.quote || !address) return;

    setSwapState(prev => ({ ...prev, step: 'processing' }));

    try {
      // TODO: replace mock with 1inch Fusion+ intent creation
      const response = await fetch('/api/1inch/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteData: swapState.quote,
          makerAddress: address,
          // privateKey: 'demo_key' // Only for testing - remove in production
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create intent');
      }

      const intentData = result.data;
      setSwapState(prev => ({
        ...prev,
        intent: intentData
      }));

      // Start monitoring the intent
      monitorIntent(intentData.intentId);

    } catch (error) {
      setSwapState(prev => ({
        ...prev,
        step: 'error',
        error: error instanceof Error ? error.message : 'Failed to create intent'
      }));
    }
  };

  const monitorIntent = async (intentId: string) => {
    try {
      const response = await fetch(`/api/1inch/monitor?intentId=${intentId}`);
      const result = await response.json();

      if (result.success) {
        const status = result.data;
        
        setSwapState(prev => ({
          ...prev,
          srcTxHash: status.srcTxHash,
          dstTxHash: status.dstTxHash
        }));

        if (status.status === 'completed') {
          setSwapState(prev => ({ ...prev, step: 'completed' }));
          showToast('Cross-chain swap completed successfully!', 'success');
        } else if (status.status === 'failed') {
          setSwapState(prev => ({
            ...prev,
            step: 'error',
            error: status.failureReason || 'Intent execution failed'
          }));
        } else {
          // Continue monitoring
          setTimeout(() => monitorIntent(intentId), 5000);
        }
      }
    } catch (error) {
      console.error('Error monitoring intent:', error);
      // Continue monitoring despite errors
      setTimeout(() => monitorIntent(intentId), 10000);
    }
  };

  const handlePayment = async () => {
    if (enable1InchFusion) {
      await handleGetQuote();
    } else {
      // Original mock payment flow
      setIsProcessing(true);
      
      try {
        // TODO: replace mock with 1inch Fusion+ intent creation
        const purchase = await MockDataStore.simulatePayment(
          address || 'mock_user_123',
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
    }
  };

  const tokenAmount = mockRates ? 
    getItemPrice() * (selectedToken === 'MATIC' ? mockRates.USD_TO_MATIC : 
                     selectedToken === 'ETH' ? mockRates.USD_TO_ETH : 
                     mockRates.USD_TO_USDC) : 0;

  const renderContent = () => {
    if (enable1InchFusion) {
      return renderFusionContent();
    }
    return renderTraditionalContent();
  };

  const renderFusionContent = () => {
    switch (swapState.step) {
      case 'select':
        return (
          <div className="space-y-6">
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

            {/* 1inch Fusion+ Badge */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center mr-2">1</div>
                <span className="font-medium text-blue-900">Powered by 1inch Fusion+</span>
              </div>
              <p className="text-sm text-blue-700">
                Cross-chain swaps with competitive rates and MEV protection
              </p>
            </div>

            {/* Chain Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pay from chain:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(SUPPORTED_CHAINS).map((chain) => (
                  <button
                    key={chain.chainId}
                    onClick={() => setSelectedSourceChain(chain.chainId)}
                    className={`
                      p-3 rounded-lg border text-left transition-all
                      ${selectedSourceChain === chain.chainId
                        ? 'border-primary bg-primary bg-opacity-10 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="font-medium">{chain.name}</div>
                    <div className="text-sm text-gray-500">{chain.nativeCurrency.symbol}</div>
                  </button>
                ))}
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
                    <div className="text-xs text-gray-500 mt-1">Cross-chain</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={!isConnected}
              className="btn-primary w-full"
            >
              {!isConnected ? 'Connect Wallet' : 'Get Quote'}
            </button>
          </div>
        );

      case 'quote':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900">Getting Best Quote...</h3>
              <p className="text-gray-600">Searching across chains for optimal rates</p>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6">
            {swapState.quote && (
              <>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Swap Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">From:</span>
                      <span>{swapState.quote.srcAmount} {swapState.quote.srcToken.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">To:</span>
                      <span>{swapState.quote.dstAmount} {swapState.quote.dstToken.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Source Chain:</span>
                      <span>{SUPPORTED_CHAINS[Object.keys(SUPPORTED_CHAINS)[0] as keyof typeof SUPPORTED_CHAINS].name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Destination Chain:</span>
                      <span>{SUPPORTED_CHAINS[Object.keys(SUPPORTED_CHAINS)[0] as keyof typeof SUPPORTED_CHAINS].name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Slippage:</span>
                      <span>{swapState.quote.slippage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Gas:</span>
                      <span>~{formatCurrency(0.05)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSwapState(prev => ({ ...prev, step: 'select' }))}
                    className="btn-secondary flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateIntent}
                    className="btn-primary flex-1"
                  >
                    Confirm Swap
                  </button>
                </div>
              </>
            )}
          </div>
        );

      case 'processing':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900">Swap in Progress</h3>
              <p className="text-gray-600 mb-4">Your cross-chain swap is being processed</p>
              
              {swapState.intent && (
                <div className="bg-blue-50 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-blue-900 mb-2">Intent Created</h4>
                  <p className="text-sm text-blue-700 break-all">
                    Intent ID: {swapState.intent.id}
                  </p>
                  {swapState.srcTxHash && (
                    <p className="text-sm text-green-700 mt-2">
                      ✓ Source transaction: {swapState.srcTxHash.substring(0, 10)}...
                    </p>
                  )}
                  {swapState.dstTxHash && (
                    <p className="text-sm text-green-700">
                      ✓ Destination transaction: {swapState.dstTxHash.substring(0, 10)}...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Swap Completed!</h3>
              <p className="text-gray-600">Your payment has been settled on destination chain</p>
              
              {(swapState.srcTxHash || swapState.dstTxHash) && (
                <div className="bg-green-50 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-green-900 mb-2">Transaction Details</h4>
                  {swapState.srcTxHash && (
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${swapState.srcTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      View source transaction
                    </a>
                  )}
                  {swapState.dstTxHash && (
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${swapState.dstTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      View destination transaction
                    </a>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="btn-primary w-full"
            >
              Close
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Swap Failed</h3>
              <p className="text-gray-600">{swapState.error}</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSwapState({ step: 'select', quote: null, intent: null, error: null })}
                className="btn-secondary flex-1"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="btn-primary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderTraditionalContent = () => (
    <div className="space-y-6">
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
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {enable1InchFusion ? 'Cross-Chain Payment' : 'Complete Purchase'}
            </h2>
            {enable1InchFusion && (
              <p className="text-sm text-gray-600">Powered by 1inch Fusion+</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};