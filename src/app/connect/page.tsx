'use client';

import { useState } from 'react';
import { WalletIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { showToast } from '@/components/Toast';
import { MockDataStore } from '@/lib/mockData';

const MOCK_WALLETS = [
  {
    address: '0x1234567890123456789012345678901234567890',
    name: 'MetaMask',
    icon: '🦊',
    balance: '2.4 ETH',
  },
  {
    address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    name: 'WalletConnect',
    icon: '🔗',
    balance: '156.8 MATIC',
  },
  {
    address: '0x9876543210987654321098765432109876543210',
    name: 'Coinbase Wallet',
    icon: '🔵',
    balance: '1,234.5 USDC',
  },
];

export default function ConnectPage() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = async (wallet: typeof MOCK_WALLETS[0]) => {
    setIsConnecting(true);
    setSelectedWallet(wallet.address);

    try {
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save mock user
      const mockUser = {
        id: `user_${Date.now()}`,
        walletAddress: wallet.address,
        name: `User ${wallet.address.slice(-4)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${wallet.address}`,
        subscriptions: [],
        createdAt: new Date().toISOString(),
      };

      MockDataStore.saveUser(mockUser);
      
      showToast(`Successfully connected to ${wallet.name}!`, 'success');
      
      // Redirect to dashboard after connection
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);

    } catch (error) {
      showToast('Failed to connect wallet. Please try again.', 'error');
    } finally {
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  };

  const currentUser = MockDataStore.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
            <WalletIcon className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h1>
          
          <p className="text-gray-600">
            Choose a wallet to connect to POLYVERSE and start supporting creators
          </p>
        </div>

        {/* Current Connection Status */}
        {currentUser && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircleIcon className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-green-900">Wallet Connected</h3>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Connected Address:</p>
              <p className="font-mono text-lg font-semibold text-gray-900">
                {formatAddress(currentUser.walletAddress)}
              </p>
            </div>
            <p className="text-sm text-green-700 mt-3">
              You're ready to explore POLYVERSE! Visit the marketplace or dashboard.
            </p>
          </div>
        )}

        {/* Wallet Options */}
        <div className="space-y-4">
          {MOCK_WALLETS.map((wallet) => {
            const isSelected = selectedWallet === wallet.address;
            const isCurrentWallet = currentUser?.walletAddress === wallet.address;
            
            return (
              <button
                key={wallet.address}
                onClick={() => handleConnect(wallet)}
                disabled={isConnecting || isCurrentWallet}
                className={`
                  w-full p-6 rounded-xl border-2 transition-all duration-200 text-left
                  ${isCurrentWallet 
                    ? 'border-green-300 bg-green-50 cursor-not-allowed' 
                    : isSelected 
                    ? 'border-primary bg-primary bg-opacity-5' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{wallet.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {wallet.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatAddress(wallet.address)}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {wallet.balance}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isCurrentWallet && (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    )}
                    {isConnecting && isSelected && (
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>
                
                {isCurrentWallet && (
                  <div className="mt-3 text-sm text-green-700">
                    ✓ Currently connected
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Why Connect a Wallet?</h3>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>Support creators with crypto payments</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>Access exclusive subscription content</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>Participate in community raffles</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>Own digital content as NFTs</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              {/* TODO: integrate multiple wallet providers (MetaMask, WalletConnect, etc.) */}
              <strong>Note:</strong> This is a demo environment. Real wallet integration 
              will support MetaMask, WalletConnect, Coinbase Wallet, and more.
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            🔒 Your wallet connection is secure and encrypted.<br />
            We never store your private keys or seed phrase.
          </p>
        </div>
      </div>
    </div>
  );
}