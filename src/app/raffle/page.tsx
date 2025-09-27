'use client';

import { useState, useEffect } from 'react';
import { GiftIcon, SparklesIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { showToast } from '@/components/Toast';

interface RaffleEntry {
  id: string;
  walletAddress: string;
  timestamp: string;
}

export default function RafflePage() {
  const [entries, setEntries] = useState<RaffleEntry[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userWallet] = useState('0x1234...5678'); // Mock wallet address

  useEffect(() => {
    // Load existing entries from localStorage
    const savedEntries = localStorage.getItem('raffle_entries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }

    const savedWinner = localStorage.getItem('raffle_winner');
    if (savedWinner) {
      setWinner(savedWinner);
    }
  }, []);

  const saveEntries = (newEntries: RaffleEntry[]) => {
    localStorage.setItem('raffle_entries', JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const handleJoinRaffle = () => {
    if (entries.some(entry => entry.walletAddress === userWallet)) {
      showToast('You have already joined this raffle!', 'info');
      return;
    }

    const newEntry: RaffleEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      walletAddress: userWallet,
      timestamp: new Date().toISOString(),
    };

    const updatedEntries = [...entries, newEntry];
    saveEntries(updatedEntries);
    showToast('Successfully joined the raffle!', 'success');
  };

  const handleDrawWinner = async () => {
    if (entries.length === 0) {
      showToast('No entries to draw from!', 'error');
      return;
    }

    if (winner) {
      showToast('Winner has already been drawn!', 'info');
      return;
    }

    setIsDrawing(true);
    
    // Simulate random drawing with delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const randomIndex = Math.floor(Math.random() * entries.length);
    const selectedWinner = entries[randomIndex].walletAddress;
    
    setWinner(selectedWinner);
    localStorage.setItem('raffle_winner', selectedWinner);
    setIsDrawing(false);
    
    showToast('Winner has been drawn!', 'success');
  };

  const handleResetRaffle = () => {
    setEntries([]);
    setWinner(null);
    localStorage.removeItem('raffle_entries');
    localStorage.removeItem('raffle_winner');
    showToast('Raffle has been reset!', 'info');
  };

  const formatAddress = (address: string): string => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center">
              <GiftIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Creator Raffle
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our community raffle for a chance to win exclusive creator content and prizes!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Raffle Info */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <SparklesIcon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Weekly Raffle</h2>
              <p className="text-gray-600">
                Enter for free and win amazing prizes from our top creators!
              </p>
            </div>

            {/* Prize Information */}
            <div className="bg-gradient-to-r from-primary to-primary-light rounded-lg p-6 text-white mb-8">
              <h3 className="text-xl font-semibold mb-3">This Week's Prizes:</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Exclusive NFT Collection (Worth $500)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Premium Course Bundle (Worth $200)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  1-Month All-Access Pass (Worth $100)
                </li>
              </ul>
            </div>

            {/* Raffle Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-primary">{entries.length}</div>
                <div className="text-sm text-gray-600">Total Entries</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-primary">
                  {entries.length > 0 ? Math.round((1/entries.length) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Your Odds</div>
              </div>
            </div>

            {/* Action Button */}
            {!winner && (
              <button
                onClick={handleJoinRaffle}
                disabled={entries.some(entry => entry.walletAddress === userWallet)}
                className="w-full btn-primary text-lg py-4 mb-4"
              >
                {entries.some(entry => entry.walletAddress === userWallet)
                  ? '✓ Already Joined'
                  : 'Join Raffle (Free)'}
              </button>
            )}

            <p className="text-sm text-gray-500 text-center">
              {/* TODO: integrate Polygon x402 for on-chain raffle verification */}
              Raffle results will be verified on-chain using Polygon x402
            </p>
          </div>

          {/* Admin Panel & Results */}
          <div className="space-y-6">
            {/* Winner Display */}
            {winner && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <TrophyIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  🎉 We Have a Winner! 🎉
                </h2>
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-6">
                  <p className="text-lg font-semibold text-gray-900 mb-2">Winner:</p>
                  <p className="text-2xl font-mono font-bold text-primary">
                    {formatAddress(winner)}
                  </p>
                </div>
                <p className="text-gray-600 mt-4">
                  Congratulations! The winner will be contacted via their connected wallet.
                </p>
              </div>
            )}

            {/* Admin Controls */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Admin Controls</h3>
              
              <div className="space-y-4">
                <button
                  onClick={handleDrawWinner}
                  disabled={isDrawing || winner !== null}
                  className="w-full btn-primary"
                >
                  {isDrawing ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Drawing Winner...
                    </div>
                  ) : winner ? (
                    '✓ Winner Already Drawn'
                  ) : (
                    'Draw Winner'
                  )}
                </button>
                
                <button
                  onClick={handleResetRaffle}
                  className="w-full btn-secondary"
                >
                  Reset Raffle
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Recent Entries:</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {entries.length === 0 ? (
                    <p className="text-sm text-gray-500">No entries yet</p>
                  ) : (
                    entries.slice(-5).reverse().map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between text-sm">
                        <span className="font-mono">{formatAddress(entry.walletAddress)}</span>
                        <span className="text-gray-500">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect Wallet</h3>
              <p className="text-gray-600 text-sm">
                Connect your wallet to participate in the raffle
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Join for Free</h3>
              <p className="text-gray-600 text-sm">
                Enter the raffle completely free, no gas fees required
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Win Prizes</h3>
              <p className="text-gray-600 text-sm">
                Winners are drawn randomly and verified on-chain
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}