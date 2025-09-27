'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { CheckBadgeIcon, UserGroupIcon, HeartIcon, GiftIcon } from '@heroicons/react/24/solid';
import { Creator, Product, SubscriptionTier } from '@/lib/types';
import { MockDataStore } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';
import { TierCard } from '@/components/TierCard';
import { ProductCard } from '@/components/ProductCard';
import { CheckoutModal } from '@/components/CheckoutModal';

export default function CreatorPage() {
  const params = useParams();
  const handle = params?.handle as string;
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tipAmount, setTipAmount] = useState('');
  
  // Checkout modal state
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    item: SubscriptionTier | Product | null;
    itemType: 'subscription' | 'product' | 'tip';
    tipAmount?: number;
  }>({
    isOpen: false,
    item: null,
    itemType: 'subscription',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [creatorsData, productsData] = await Promise.all([
          MockDataStore.getCreators(),
          MockDataStore.getProducts()
        ]);
        
        const foundCreator = creatorsData.find(c => c.handle === handle);
        setCreator(foundCreator || null);
        
        const creatorProducts = productsData.filter(p => p.creatorId === foundCreator?.id);
        setProducts(creatorProducts);
      } catch (error) {
        console.error('Error fetching creator data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (handle) {
      fetchData();
    }
  }, [handle]);

  const handleSubscribe = (tier: SubscriptionTier) => {
    setCheckoutModal({
      isOpen: true,
      item: tier,
      itemType: 'subscription',
    });
  };

  const handleProductPurchase = (product: Product) => {
    setCheckoutModal({
      isOpen: true,
      item: product,
      itemType: 'product',
    });
  };

  const handleTip = () => {
    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid tip amount');
      return;
    }

    // Create a mock tip item as SubscriptionTier for checkout compatibility
    const tipItem: SubscriptionTier = {
      id: 'tip',
      name: 'Tip',
      priceUSD: amount,
      interval: 'month', // This won't be used for tips
      features: ['Support creator'],
    };

    setCheckoutModal({
      isOpen: true,
      item: tipItem,
      itemType: 'tip',
      tipAmount: amount,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Creator Not Found</h1>
          <p className="text-gray-600">The creator you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <section className="relative h-80 bg-gradient-to-r from-primary to-primary-light">
        <Image
          src={creator.banner}
          alt={`${creator.name} banner`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </section>

      {/* Profile Section */}
      <section className="relative -mt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
              {/* Avatar and Basic Info */}
              <div className="flex-shrink-0 text-center lg:text-left">
                <div className="relative w-32 h-32 mx-auto lg:mx-0 rounded-full overflow-hidden border-6 border-white shadow-lg">
                  <Image
                    src={creator.avatar}
                    alt={creator.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-center lg:justify-start space-x-2">
                    <h1 className="text-3xl font-bold text-gray-900">{creator.name}</h1>
                    {creator.isVerified && (
                      <CheckBadgeIcon className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-lg mt-2">@{creator.handle}</p>
                  
                  <div className="flex items-center justify-center lg:justify-start space-x-6 mt-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{formatNumber(creator.followers)} followers</span>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {creator.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio and Actions */}
              <div className="flex-1 mt-8 lg:mt-0">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {creator.bio}
                </p>

                {/* Social Links */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {Object.entries(creator.socialLinks).map(([platform, handle]) => (
                    <a
                      key={platform}
                      href="#"
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <span className="capitalize">{platform}</span>
                      <span className="text-gray-600">{handle}</span>
                    </a>
                  ))}
                </div>

                {/* Tip Section */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <HeartIcon className="w-5 h-5 text-pink-500 mr-2" />
                    Send a Tip
                  </h3>
                  <div className="flex space-x-3">
                    <input
                      type="number"
                      placeholder="Amount in USD"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="1"
                      step="0.01"
                    />
                    <button
                      onClick={handleTip}
                      disabled={!tipAmount || parseFloat(tipAmount) <= 0}
                      className="btn-primary px-6"
                    >
                      <GiftIcon className="w-4 h-4 mr-2" />
                      Tip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Tiers */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Subscription Tiers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {creator.subscriptionTiers.map((tier, index) => (
              <TierCard
                key={tier.id}
                tier={tier}
                onSubscribe={handleSubscribe}
                isPopular={index === 1} // Make the middle tier popular
              />
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      {products.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Digital Products
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPurchase={handleProductPurchase}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal(prev => ({ ...prev, isOpen: false }))}
        item={checkoutModal.item}
        itemType={checkoutModal.itemType}
        creatorId={creator.id}
        tipAmount={checkoutModal.tipAmount}
      />
    </div>
  );
}