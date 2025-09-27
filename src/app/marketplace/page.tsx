'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { contractService } from '@/lib/contract-service';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { createPaymentLink } from '@/lib/kirapay-api';
import { showToast } from '@/components/Toast';

// Marketplace Fee Configuration
const MARKETPLACE_CONFIG = {
  REGISTRATION_FEE: 5.0, // $5 to register a product
  FEATURING_FEE: 15.0,   // $15 to feature a product at the top
  CONTRACT_CREATOR: '0xF846d2747D1cb33635Cc66dD6D513d85Cb830f13', // Receives all fees
};

interface Product {
  id: number;
  creator: string;
  title: string;
  description: string;
  priceUSD: number;
  contentHash: string;
  productType: string;
  isActive: boolean;
  purchaseCount: number;
  createdAt: number;
  isUserCreated?: boolean;
  isFeatured?: boolean;
  registrationFeePaid?: number;
  featuringFeePaid?: number;
}

export default function Marketplace() {
  const { address, isConnected } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'price_low' | 'price_high'>('newest');
  const [paymentModal, setPaymentModal] = useState<{isOpen: boolean, url: string, productTitle: string}>({
    isOpen: false,
    url: '',
    productTitle: ''
  });
  const [feePaymentModal, setFeePaymentModal] = useState<{
    isOpen: boolean, 
    url: string, 
    type: 'registration' | 'featuring',
    productId?: number,
    amount: number
  }>({
    isOpen: false,
    url: '',
    type: 'registration',
    amount: 0
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock data for demonstration - replace with real contract calls later
      const mockProducts: Product[] = [
        {
          id: 1,
          creator: '0xF846d2747D1cb33635Cc66dD6D513d85Cb830f13',
          title: 'Neon Dreamscapes - AI Art Collection',
          description: 'A stunning collection of 10 futuristic cityscape artworks created with AI and enhanced by hand. Each piece captures the essence of cyberpunk aesthetics with vibrant neon colors.',
          priceUSD: 29.99,
          contentHash: 'QmX1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S',
          productType: 'digital_art',
          isActive: true,
          purchaseCount: 1,
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 1,
          isFeatured: true,
          registrationFeePaid: 5.0,
          featuringFeePaid: 15.0
        },
        {
          id: 2,
          creator: '0xF846d2747D1cb33635Cc66dD6D513d85Cb830f13',
          title: 'Web3 Development Essentials',
          description: 'A comprehensive 200-page guide covering Web3 development fundamentals. Learn Solidity, smart contracts, DApp development, and blockchain integration.',
          priceUSD: 49.99,
          contentHash: 'QmA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V',
          productType: 'ebook',
          isActive: true,
          purchaseCount: 2,
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 0
        },
        {
          id: 3,
          creator: '0xF846d2747D1cb33635Cc66dD6D513d85Cb830f13',
          title: 'UI/UX Design for Decentralized Apps',
          description: 'Master the art of designing user-friendly decentralized applications. This 8-module course covers Web3 UX patterns, wallet integration design, and accessibility in DeFi.',
          priceUSD: 199.99,
          contentHash: 'QmB2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W',
          productType: 'course',
          isActive: true,
          purchaseCount: 0,
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 1
        },
        {
          id: 4,
          creator: '0xF846d2747D1cb33635Cc66dD6D513d85Cb830f13',
          title: 'Crypto Waves - Electronic Music Album',
          description: 'An 8-track electronic music album inspired by the crypto revolution. Featuring synthwave, ambient, and techno tracks perfect for coding, trading, or relaxing.',
          priceUSD: 24.99,
          contentHash: 'QmC3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X',
          productType: 'music',
          isActive: true,
          purchaseCount: 4,
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 0
        },
        {
          id: 5,
          creator: '0xF846d2747D1cb33635Cc66dD6D513d85Cb830f13',
          title: 'DeFi Portfolio Tracker & Analytics Tool',
          description: 'A Python-based tool for tracking DeFi portfolios across multiple blockchains. Features yield farming calculator, impermanent loss tracker, and automated rebalancing.',
          priceUSD: 149.99,
          contentHash: 'QmD4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y',
          productType: 'program',
          isActive: true,
          purchaseCount: 0,
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 1
        },
        {
          id: 6,
          creator: '0xF846d2747D1cb33635Cc66dD6D513d85Cb830f13',
          title: 'Smart Contract Security Audit Tutorials',
          description: 'A 12-part video series teaching smart contract security auditing. Learn common vulnerabilities, audit methodologies, and tools like Slither and Mythril.',
          priceUSD: 89.99,
          contentHash: 'QmE5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z',
          productType: 'video',
          isActive: true,
          purchaseCount: 0,
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 0
        },
        {
          id: 7,
          creator: '0xF846d2747D1cb33635Cc66dD6D513d85Cb830f13',
          title: 'Web3 Startup Pitch Deck Templates',
          description: 'Professional pitch deck templates designed specifically for Web3 startups. Includes 15 different themes covering tokenomics, roadmaps, team intros, and financial projections.',
          priceUSD: 39.99,
          contentHash: 'QmF6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A',
          productType: 'other',
          isActive: true,
          purchaseCount: 1,
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 1
        }
      ];
      
      // Load user-created products from localStorage
      const userProductsStr = localStorage.getItem('user_created_products');
      let userProducts: Product[] = [];
      
      if (userProductsStr) {
        try {
          const storedProducts = JSON.parse(userProductsStr);
          userProducts = storedProducts.map((product: any, index: number) => ({
            id: 1000 + index, // Start user products from id 1000
            creator: product.creator || address || 'Unknown',
            title: product.title || product.productTitle || 'Untitled Product',
            description: product.description || product.productDescription || 'No description available',
            priceUSD: parseFloat(product.price || product.priceUSD || '0'),
            contentHash: product.contentHash || product.ipfsHash || 'QmDefaultHash',
            productType: product.category || product.productType || 'digital_art',
            isActive: true,
            purchaseCount: product.purchaseCount || 0,
            createdAt: product.createdAt || Math.floor(Date.now() / 1000),
            isUserCreated: true // Flag to identify user-created products
          }));
        } catch (e) {
          // Silent error handling
        }
      }

      // Combine mock products with user products
      const allProducts = [...mockProducts, ...userProducts];
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(allProducts);
      
    } catch (err: any) {
      // Silent error handling
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

    const handlePurchase = async (product: any) => {
    // Check if wallet is connected
    if (!isConnected || !address) {
      showToast('Please connect your wallet to make purchases', 'error')
      return
    }

    try {
      // Store purchase data temporarily
      localStorage.setItem('pending_purchase', JSON.stringify({
        productId: product.id,
        productTitle: product.title,
        amount: product.priceUSD,
        creator: product.creator,
        contentHash: product.contentHash
      }))

      // Create KiraPay payment link
      const paymentData = {
        currency: 'USDC',
        receiver: product.creator, // The creator's wallet address
        price: product.priceUSD, // Use priceUSD as numeric value
        name: product.title,
        redirectUrl: `${window.location.origin}/purchase/success?productId=${product.id}`
      }

      const paymentLink = await createPaymentLink(paymentData)
      
      if (paymentLink?.data?.url) {
        // Open payment in modal instead of popup
        setPaymentModal({
          isOpen: true,
          url: paymentLink.data.url,
          productTitle: product.title
        })
        showToast('Payment modal opened! Complete your purchase below.', 'success')
      } else {
        showToast('Failed to create payment link. Please try again.', 'error')
      }
    } catch (error) {
      // Silent error handling
      showToast('Failed to initiate purchase. Please try again.', 'error')
    }
  }

  const handleRegistrationFee = async (product: any) => {
    if (!isConnected || !address) {
      showToast('Please connect your wallet to pay registration fee', 'error')
      return
    }

    try {
      const paymentData = {
        currency: 'USDC',
        receiver: MARKETPLACE_CONFIG.CONTRACT_CREATOR,
        price: MARKETPLACE_CONFIG.REGISTRATION_FEE,
        name: `Registration Fee - ${product.title}`,
        redirectUrl: `${window.location.origin}/marketplace?fee_paid=registration&product_id=${product.id}`
      }

      const paymentLink = await createPaymentLink(paymentData)
      
      if (paymentLink?.data?.url) {
        setFeePaymentModal({
          isOpen: true,
          url: paymentLink.data.url,
          type: 'registration',
          productId: product.id,
          amount: MARKETPLACE_CONFIG.REGISTRATION_FEE
        })
        showToast('Registration fee payment opened!', 'success')
      } else {
        showToast('Failed to create payment link. Please try again.', 'error')
      }
    } catch (error) {
      showToast('Failed to initiate registration fee payment.', 'error')
    }
  }

  const handleFeaturingFee = async (product: any) => {
    if (!isConnected || !address) {
      showToast('Please connect your wallet to pay featuring fee', 'error')
      return
    }

    try {
      const paymentData = {
        currency: 'USDC',
        receiver: MARKETPLACE_CONFIG.CONTRACT_CREATOR,
        price: MARKETPLACE_CONFIG.FEATURING_FEE,
        name: `Featuring Fee - ${product.title}`,
        redirectUrl: `${window.location.origin}/marketplace?fee_paid=featuring&product_id=${product.id}`
      }

      const paymentLink = await createPaymentLink(paymentData)
      
      if (paymentLink?.data?.url) {
        setFeePaymentModal({
          isOpen: true,
          url: paymentLink.data.url,
          type: 'featuring',
          productId: product.id,
          amount: MARKETPLACE_CONFIG.FEATURING_FEE
        })
        showToast('Featuring fee payment opened!', 'success')
      } else {
        showToast('Failed to create payment link. Please try again.', 'error')
      }
    } catch (error) {
      showToast('Failed to initiate featuring fee payment.', 'error')
    }
  }

  const formatProductType = (type: string) => {
    return type.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'digital_art':
        return '🎨';
      case 'ebook':
        return '📚';
      case 'course':
        return '🎓';
      case 'music':
        return '🎵';
      case 'program':
        return '💻';
      case 'video':
        return '🎬';
      case 'other':
        return '📋';
      default:
        return '📄';
    }
  };

  const getProductColor = (type: string) => {
    switch (type) {
      case 'digital_art':
        return 'from-purple-500 to-pink-500';
      case 'ebook':
        return 'from-blue-500 to-indigo-500';
      case 'course':
        return 'from-green-500 to-teal-500';
      case 'music':
        return 'from-orange-500 to-red-500';
      case 'program':
        return 'from-gray-500 to-slate-500';
      case 'video':
        return 'from-yellow-500 to-orange-500';
      case 'other':
        return 'from-cyan-500 to-blue-500';
      default:
        return 'from-purple-500 to-blue-500';
    }
  };

  const timeAgo = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    const days = Math.floor(diff / 86400);
    
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.productType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Always prioritize featured products first
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    
    // Then sort by selected criteria
    switch (sortBy) {
      case 'newest':
        return b.createdAt - a.createdAt;
      case 'popular':
        return b.purchaseCount - a.purchaseCount;
      case 'price_low':
        return a.priceUSD - b.priceUSD;
      case 'price_high':
        return b.priceUSD - a.priceUSD;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Marketplace</h1>
          <p className="text-xl text-gray-600 mb-6">
            Discover amazing digital content created by talented creators
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{products.length}</div>
              <div className="text-sm text-gray-500">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                8
              </div>
              <div className="text-sm text-gray-500">Sales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(products.map(p => p.creator)).size}
              </div>
              <div className="text-sm text-gray-500">Creators</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                $269.92
              </div>
              <div className="text-sm text-gray-500">Volume</div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search products, creators, types..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">{sortedProducts.length} products found</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Sort by:</span>
                <span className="font-medium text-purple-600">
                  {sortBy === 'newest' && 'Newest'}
                  {sortBy === 'popular' && 'Most Popular'}
                  {sortBy === 'price_low' && 'Price ↑'}
                  {sortBy === 'price_high' && 'Price ↓'}
                </span>
              </div>
            </div>
            
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                      <div className="text-center p-6">
                        <div className={`w-20 h-20 bg-gradient-to-br ${getProductColor(product.productType)} rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg`}>
                          <span className="text-3xl">
                            {getProductIcon(product.productType)}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          <span className="bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-gray-600 font-medium">
                            {formatProductType(product.productType)}
                          </span>
                          {product.isFeatured && (
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-md">
                              ⭐ FEATURED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2 flex items-center">
                        <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        {product.creator.slice(0, 6)}...{product.creator.slice(-4)}
                      </p>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[4rem]">
                        {product.description}
                      </p>
                      
                      {/* Fee Payment Options for User-Created Products */}
                      {product.isUserCreated && product.creator === address && !product.registrationFeePaid && (
                        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800 mb-2">📋 Product not yet registered</p>
                          <button
                            onClick={() => handleRegistrationFee(product)}
                            className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded"
                          >
                            Pay Registration Fee (${MARKETPLACE_CONFIG.REGISTRATION_FEE})
                          </button>
                        </div>
                      )}
                      
                      {product.isUserCreated && product.creator === address && product.registrationFeePaid && !product.isFeatured && (
                        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-800 mb-2">⭐ Feature your product at the top</p>
                          <button
                            onClick={() => handleFeaturingFee(product)}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                          >
                            Pay Featuring Fee (${MARKETPLACE_CONFIG.FEATURING_FEE})
                          </button>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-purple-600">
                          ${product.priceUSD.toFixed(2)}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handlePurchase(product)
                          }}
                          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                          title="Opens secure payment modal"
                        >
                          Buy Now �
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          {product.purchaseCount} sales
                        </span>
                        <span>{timeAgo(product.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-4">
                  There are currently no products in the marketplace.
                </p>
                {!isConnected ? (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-4">Connect your wallet to see personalized content</p>
                    <ConnectButton />
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-4">
                      Be the first to create content on the platform!
                    </p>
                    <a 
                      href="/create" 
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Create Content
                    </a>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <h3 className="text-lg font-semibold">Secure Payment</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-90">{paymentModal.productTitle}</span>
                <button
                  onClick={() => setPaymentModal({isOpen: false, url: '', productTitle: ''})}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-2">
              <iframe
                src={paymentModal.url}
                className="w-full h-[600px] border-0 rounded"
                title="KiraPay Payment"
                allow="payment; encrypted-media"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
              />
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secured by KiraPay
                </div>
                <button
                  onClick={() => setPaymentModal({isOpen: false, url: '', productTitle: ''})}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Fee Payment Modal */}
      {feePaymentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                <h3 className="text-lg font-semibold">
                  {feePaymentModal.type === 'registration' ? 'Registration Fee' : 'Featuring Fee'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-90">${feePaymentModal.amount}</span>
                <button
                  onClick={() => setFeePaymentModal({isOpen: false, url: '', type: 'registration', amount: 0})}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-2">
              <iframe
                src={feePaymentModal.url}
                className="w-full h-[600px] border-0 rounded"
                title="Fee Payment"
                allow="payment; encrypted-media"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
              />
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Fee payment to marketplace contract
                </div>
                <button
                  onClick={() => setFeePaymentModal({isOpen: false, url: '', type: 'registration', amount: 0})}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
