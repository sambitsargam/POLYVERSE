'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { contractService } from '@/lib/contract-service'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useUser } from '@/contexts/UserContext'

export default function RegisterPage() {
  const { address, isConnected } = useAccount()
  const { profile, setProfile, isRegistered } = useUser()
  const [formData, setFormData] = useState({
    handle: '',
    name: '',
    bio: '',
    avatar: '',
    coverImage: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // If user is already registered, show different content
  if (isRegistered && profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Registered!</h2>
            <p className="text-gray-600 mb-4">
              Welcome back, <strong>{profile.name}</strong> (@{profile.handle})
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You're all set up as a creator on POLYVERSE. Start creating amazing content!
            </p>
            <div className="space-y-3">
              <a
                href="/create"
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-block"
              >
                Create Content
              </a>
              <a
                href="/dashboard"
                className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors inline-block"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !address) {
      setError('Please connect your wallet first')
      return
    }

    if (!formData.handle || !formData.name) {
      setError('Handle and name are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Register with smart contract
      const receipt = await contractService.registerCreator(formData.handle, formData.name)
      console.log('Registration successful:', receipt)
      
      // Save profile to context and localStorage
      const userProfile = {
        handle: formData.handle,
        name: formData.name,
        bio: formData.bio,
        avatar: formData.avatar,
        coverImage: formData.coverImage,
        isRegistered: true,
        walletAddress: address!
      }
      
      setProfile(userProfile)
      
      // Also explicitly save to localStorage as backup
      localStorage.setItem('polyverse_user_profile', JSON.stringify(userProfile))
      
      setSuccess(true)
      setFormData({ handle: '', name: '', bio: '', avatar: '', coverImage: '' })
    } catch (error) {
      console.error('Registration failed:', error)
      setError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-600 p-8 rounded-xl mb-8">
              <h1 className="text-4xl font-bold mb-4">🎉 Registration Successful!</h1>
              <p className="text-xl">Welcome to the Polyverse creator community, @{profile?.handle}!</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6">What's Next?</h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h3 className="font-semibold">Create Your First Product</h3>
                    <p className="text-gray-300">Upload content and set your pricing</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <h3 className="font-semibold">Customize Your Profile</h3>
                    <p className="text-gray-300">Add bio, avatar, and cover images</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <h3 className="font-semibold">Start Earning</h3>
                    <p className="text-gray-300">Share your creator page and earn from sales</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors flex-1"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => window.location.href = `/creator/${formData.handle}`}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors flex-1"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">🚀 Become a Creator</h1>
            <p className="text-xl text-gray-300">
              Join the decentralized creator economy on Filecoin
            </p>
          </div>

          {!isConnected ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-300 mb-6">
                Connect your wallet to register as a creator on the blockchain
              </p>
              <ConnectButton />
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Creator Handle *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
                    <input
                      type="text"
                      value={formData.handle}
                      onChange={(e) => setFormData({...formData, handle: e.target.value})}
                      placeholder="your-handle"
                      className="w-full pl-8 pr-4 py-3 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    This will be your unique identifier (e.g., polyverse.io/@your-handle)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Your Display Name"
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Bio (Optional)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell people about yourself and your content..."
                    rows={4}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-blue-600/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Connected Wallet</h3>
                  <p className="text-sm text-gray-300 font-mono break-all">{address}</p>
                </div>

                {error && (
                  <div className="bg-red-600/20 border border-red-600 p-4 rounded-lg">
                    <p className="text-red-300">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Registering...' : 'Register as Creator'}
                </button>
              </form>

              <div className="mt-8 p-4 bg-yellow-600/20 border border-yellow-600 rounded-lg">
                <h3 className="font-semibold mb-2">⚠️ Important Notes:</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Registration requires a small gas fee on Filecoin</li>
                  <li>• Your handle cannot be changed after registration</li>
                  <li>• All creator data is stored on the blockchain</li>
                  <li>• Make sure you have FIL in your wallet for gas fees</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}