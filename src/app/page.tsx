'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, PlayIcon, SparklesIcon, RocketLaunchIcon, ShieldCheckIcon, CurrencyDollarIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { Creator, Product } from '@/lib/types';
import { CreatorCard } from '@/components/CreatorCard';
import { ProductCard } from '@/components/ProductCard';
import { CheckoutModal } from '@/components/CheckoutModal';

export default function HomePage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  
  // Checkout modal state
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    item: Product | null;
    creatorId: string;
  }>({
    isOpen: false,
    item: null,
    creatorId: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Mock data for demo - replace with Synapse SDK data fetching
        const creatorsData: Creator[] = [
          {
            id: '1',
            handle: 'creator1',
            name: 'Demo Creator',
            avatar: '/api/placeholder/40/40',
            banner: '/api/placeholder/800/200',
            bio: 'Digital content creator using Filecoin storage',
            category: 'Technology',
            followers: 1250,
            isVerified: true,
            createdAt: new Date().toISOString(),
            socialLinks: {},
            subscriptionTiers: []
          }
        ];
        
        const productsData: Product[] = [
          {
            id: '1',
            creatorId: '1',
            title: 'Premium Content Pack',
            description: 'High-quality digital content stored on Filecoin',
            priceUSD: 25.99,
            type: 'digital_art',
            image: '/api/placeholder/300/200',
            downloadUrl: '',
            createdAt: new Date().toISOString()
          }
        ];
        
        setCreators(creatorsData);
        setProducts(productsData);
        setFilteredCreators(creatorsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = creators;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((creator: Creator) => creator.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((creator: Creator) =>
        creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCreators(filtered);
  }, [creators, selectedCategory, searchQuery]);

  const categories = ['All', ...Array.from(new Set(creators.map((c: Creator) => c.category)))];

  const handleProductPurchase = (product: Product) => {
    setCheckoutModal({
      isOpen: true,
      item: product,
      creatorId: product.creatorId,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading the future of creators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Enhanced with Animation */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-32 -right-4 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                POLYVERSE
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed">
              The next-generation decentralized creator economy platform. Support your favorite creators, 
              access exclusive content, and be part of the future of digital ownership powered by blockchain technology.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                <span className="relative z-10 flex items-center">
                  <RocketLaunchIcon className="w-6 h-6 mr-2 group-hover:animate-bounce" />
                  Explore Creators
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button className="group flex items-center px-8 py-4 bg-white bg-opacity-10 backdrop-blur-sm text-white font-semibold rounded-full text-lg border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
                <PlayIcon className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>
            
            {/* Search Bar - Enhanced */}
            <div className="max-w-md mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search creators, products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white border-opacity-50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Revolutionizing Creator Economy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on cutting-edge blockchain technology for transparency, security, and true digital ownership.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Blockchain Secured</h3>
              <p className="text-gray-600 leading-relaxed">
                All transactions are secured and verified on-chain using Polygon, ensuring transparency and trust in every interaction.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-50 transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CurrencyDollarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Multi-Token Payments</h3>
              <p className="text-gray-600 leading-relaxed">
                Support creators with USDC, MATIC, or ETH. Real-time exchange rates powered by Pyth Network oracles.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-cyan-50 hover:to-sky-50 transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Decentralized Storage</h3>
              <p className="text-gray-600 leading-relaxed">
                Content stored on IPFS and Filecoin for permanence, with Akave integration for creator sovereignty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-900 to-teal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                1000+
              </div>
              <p className="text-gray-300">Active Creators</p>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                $2.4M
              </div>
              <p className="text-gray-300">Creator Earnings</p>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                50K+
              </div>
              <p className="text-gray-300">Supporters</p>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                99.9%
              </div>
              <p className="text-gray-300">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filecoin Integration Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by 
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Filecoin</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience truly decentralized content storage with Filecoin's IPFS network. 
              Upload, store, and share your digital assets permanently.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Features */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CloudArrowUpIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Real IPFS Uploads</h3>
                  <p className="text-gray-600">
                    Files uploaded through POLYVERSE are stored permanently on the InterPlanetary File System, 
                    accessible globally via content-addressed storage.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Wallet-Based Security</h3>
                  <p className="text-gray-600">
                    Connect your MetaMask wallet to securely sign uploads and manage access control. 
                    No private keys required - your security stays in your hands.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <RocketLaunchIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Deal Monitoring</h3>
                  <p className="text-gray-600">
                    Track your content's storage deals on the Filecoin network in real-time. 
                    View proof-of-storage and replication status across storage providers.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/store" className="btn-primary inline-flex items-center space-x-2">
                  <span>Explore Filecoin Store</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">Upload to Filecoin</h4>
                      <p className="text-emerald-100 text-sm">Permanent decentralized storage</p>
                    </div>
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white bg-opacity-10 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">my-digital-art.jpg</span>
                        <span className="text-xs bg-green-500 px-2 py-1 rounded">✓ Stored</span>
                      </div>
                      <div className="text-xs text-emerald-200 font-mono">
                        bafybeie...3r5q7m
                      </div>
                    </div>
                    
                    <div className="bg-white bg-opacity-10 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">course-materials.pdf</span>
                        <span className="text-xs bg-yellow-500 px-2 py-1 rounded">⏳ Processing</span>
                      </div>
                      <div className="text-xs text-emerald-200 font-mono">
                        bafybeia...8k2n1x
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="text-xs text-emerald-200">
                      🌐 Globally distributed • 🔒 Cryptographically secured • ♾️ Permanently stored
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white border-b border-gray-100 sticky top-16 z-40 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105
                  ${selectedCategory === category
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Creators Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Creators
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''} ready to share their passion
            </p>
          </div>

          {filteredCreators.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 opacity-50">
                <SparklesIcon className="w-full h-full text-gray-400" />
              </div>
              <p className="text-gray-500 text-xl mb-6">No creators found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="btn-primary"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCreators.map(creator => (
                <div key={creator.id} className="transform hover:scale-105 transition-transform duration-300">
                  <CreatorCard creator={creator} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Digital Products
            </h2>
            <p className="text-xl text-gray-600">
              Discover exclusive digital content from top creators worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 6).map(product => (
              <div key={product.id} className="transform hover:scale-105 transition-transform duration-300">
                <ProductCard
                  product={product}
                  onPurchase={handleProductPurchase}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Transform Your Creator Journey?
          </h2>
          <p className="text-xl text-gray-200 mb-10 leading-relaxed">
            Join thousands of creators who have already embraced the future of decentralized content creation.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-full text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              Start Creating Today
            </button>
            <button className="px-10 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full text-lg hover:bg-white hover:text-gray-900 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal(prev => ({ ...prev, isOpen: false }))}
        item={checkoutModal.item}
        itemType="product"
        creatorId={checkoutModal.creatorId}
      />
    </div>
  );
}