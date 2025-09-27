'use client';

import { useState } from 'react';

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');

  const mockNFTs = [
    {
      id: 1,
      title: "Digital Art #001",
      creator: "ArtistWallet",
      price: "0.5 FIL",
      description: "Beautiful digital artwork on Filecoin network"
    },
    {
      id: 2,
      title: "Music NFT Collection", 
      creator: "MusicCreator",
      price: "1.2 FIL",
      description: "Exclusive music collection with utility"
    },
    {
      id: 3,
      title: "Photography Series",
      creator: "PhotoPro", 
      price: "0.8 FIL",
      description: "Limited edition photography series"
    }
  ];

  const filteredNFTs = mockNFTs.filter(nft =>
    nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nft.creator.toLowerCase().includes(searchQuery.toLowerCase())
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
