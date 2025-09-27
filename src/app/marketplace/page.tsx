'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { contractService } from '@/lib/contract-service';
import { ConnectButton } from '@rainbow-me/rainbowkit';

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
}

export default function Marketplace() {
  const { address, isConnected } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // For now, we'll show a message that products need to be fetched
      // In a real implementation, you'd need to:
      // 1. Get all product IDs from the contract
      // 2. Fetch each product's details
      // 3. Filter active products
      
      // This is a placeholder - the contract would need an additional function
      // to get all products or we'd need to implement an indexing solution
      setProducts([]);
      
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError('Failed to load products from blockchain');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product: Product) => {
    if (!isConnected) {
      alert('Please connect your wallet to purchase');
      return;
    }

    try {
      // Implement purchase logic using contractService.purchaseProduct
      console.log('Purchasing product:', product);
      alert('Purchase functionality will be implemented with payment tokens');
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed');
    }
  };

  const formatProductType = (type: string) => {
    return type.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.productType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Marketplace</h1>
          <p className="text-xl text-gray-600">
            Discover amazing NFTs and digital content created by talented artists
          </p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search NFTs, creators, collections..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <p className="text-gray-600">{filteredNFTs.length} items found</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNFTs.map((nft) => (
            <div key={nft.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg"></div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{nft.title}</h3>
                <p className="text-sm text-gray-500 mb-2">by {nft.creator}</p>
                <p className="text-sm text-gray-600 mb-3">{nft.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-purple-600">{nft.price}</span>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNFTs.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}
