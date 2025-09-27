'use client';

import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { 
  SparklesIcon, 
  RocketLaunchIcon, 
  ShieldCheckIcon, 
  CurrencyDollarIcon, 
  CloudArrowUpIcon,
  PlayCircleIcon,
  UserGroupIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const { isRegistered, profile } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              {isRegistered && profile ? (
                <>
                  <span className="block text-3xl md:text-4xl lg:text-5xl mb-2">Welcome back,</span>
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {profile.name}
                  </span>
                </>
              ) : (
                <>
                  <span className="block">Welcome to</span>
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    POLYVERSE
                  </span>
                </>
              )}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {isRegistered && profile ? (
                <>Ready to create and share your next masterpiece? Your creator journey continues here on the decentralized web.</>
              ) : (
                <>The decentralized creator economy platform powered by Filecoin. Create, share, and monetize your content on the blockchain.</>
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/marketplace"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Explore Marketplace
              </Link>
              {isRegistered ? (
                <Link 
                  href="/create"
                  className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300"
                >
                  Create Content
                </Link>
              ) : (
                <Link 
                  href="/register"
                  className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300"
                >
                  Become a Creator
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-300 to-blue-300 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-300 to-yellow-300 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-green-300 to-teal-300 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose POLYVERSE?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built on cutting-edge blockchain technology to empower creators worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CloudArrowUpIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Decentralized Storage</h3>
              <p className="text-gray-600">
                Your content is stored securely on Filecoin's decentralized network, ensuring permanence and censorship resistance.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Secure & Transparent</h3>
              <p className="text-gray-600">
                All transactions are recorded on the blockchain, providing full transparency and security for creators and buyers.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CurrencyDollarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Direct Monetization</h3>
              <p className="text-gray-600">
                Sell your content directly to your audience without intermediaries taking large cuts of your revenue.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Global Reach</h3>
              <p className="text-gray-600">
                Connect with audiences worldwide through our decentralized platform, breaking down geographical barriers.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <RocketLaunchIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Easy to Use</h3>
              <p className="text-gray-600">
                Simple and intuitive interface makes it easy for creators to upload, manage, and monetize their content.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <GlobeAltIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Web3 Native</h3>
              <p className="text-gray-600">
                Built from the ground up for Web3, supporting wallet connections and cryptocurrency payments natively.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Connect Your Wallet</h3>
              <p className="text-gray-600">
                Connect your Web3 wallet to get started. We support MetaMask, WalletConnect, and other popular wallets.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Create & Upload</h3>
              <p className="text-gray-600">
                Upload your content and set your pricing. Your files are automatically stored on Filecoin's decentralized network.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Start Earning</h3>
              <p className="text-gray-600">
                Share your content with the world and start earning directly from your audience without intermediaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join the Creator Economy?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already building their decentralized businesses on POLYVERSE.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 shadow-lg"
            >
              Start Creating Today
            </Link>
            <Link 
              href="/marketplace"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}