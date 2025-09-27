import { useEffect, useState } from 'react';
import { useCreators, useFans, useFollows } from '../../hypergraph/service';
import { sampleProducts } from '../../data/sampleData';

export default function CreatorShowcase() {
  const [selectedCreator, setSelectedCreator] = useState<any>(null);
  const spaceId = "polyverse-mainnet"; // Using a realistic space ID
  
  const { data: creators, isPending: creatorsLoading } = useCreators(spaceId, 5);
  const { data: fans, isPending: fansLoading } = useFans(spaceId, 5);
  const { data: follows, isPending: followsLoading } = useFollows(spaceId, 8);

  if (creatorsLoading || fansLoading || followsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading community data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
            POLYVERSE Community
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover amazing creators, connect with fellow fans, and be part of the decentralized creator economy
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-pink-400">{creators?.length || 0}</div>
            <div className="text-gray-300">Active Creators</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-blue-400">{fans?.length || 0}</div>
            <div className="text-gray-300">Community Members</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-violet-400">{follows?.length || 0}</div>
            <div className="text-gray-300">Active Connections</div>
          </div>
        </div>

        {/* Featured Creators */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Creators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {creators?.map((creator) => (
              <div 
                key={creator.id} 
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-pink-400/50 transition-all cursor-pointer transform hover:scale-105"
                onClick={() => setSelectedCreator(creator)}
              >
                <div className="relative mb-4">
                  <img 
                    src={creator.avatar} 
                    alt={creator.name}
                    className="w-20 h-20 rounded-full mx-auto border-3 border-pink-400/50"
                  />
                  {creator.isVerified && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-1">{creator.name}</h3>
                  <p className="text-pink-400 mb-2">@{creator.handle}</p>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{creator.bio}</p>
                  <div className="flex justify-center items-center gap-4 text-sm text-gray-400">
                    <span>{creator.followerCount?.toLocaleString()} followers</span>
                    <span className="bg-purple-500/20 px-2 py-1 rounded-full">{creator.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Connections */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold mb-6 text-pink-400">Recent Connections</h3>
            <div className="space-y-4">
              {follows?.slice(0, 5).map((follow, index) => {
                const fan = fans?.find((f: any) => f.id === (follow as any).fanId);
                const creator = creators?.find((c: any) => c.id === (follow as any).creatorId);
                if (!fan || !creator) return null;
                
                return (
                  <div key={follow.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <img 
                      src={fan.avatar} 
                      alt={fan.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{fan.name}</div>
                      <div className="text-gray-400 text-sm truncate">
                        started following @{(creator as any).handle}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {(follow as any).followedAt ? new Date((follow as any).followedAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Featured Products */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold mb-6 text-blue-400">Featured Products</h3>
            <div className="space-y-4">
              {sampleProducts.slice(0, 3).map((product) => {
                const creator = creators?.find(c => c.id === product.creatorId);
                return (
                  <div key={product.id} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex gap-4">
                      <img 
                        src={product.thumbnail} 
                        alt={product.title}
                        className="w-16 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">{product.title}</h4>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-green-400 font-bold">${product.price}</span>
                          <span className="text-xs text-gray-500">{product.salesCount} sold</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Community Members */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Active Community Members</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {fans?.map((fan) => (
              <div key={fan.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center hover:border-blue-400/50 transition-all">
                <img 
                  src={fan.avatar} 
                  alt={fan.name}
                  className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-blue-400/50"
                />
                <h4 className="text-white font-medium mb-1 truncate">{fan.name}</h4>
                <p className="text-blue-400 text-sm mb-2 truncate">@{(fan as any).handle}</p>
                <div className="text-xs text-gray-400">
                  Following {(fan as any).followingCount} creators
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Creator Detail Modal */}
      {selectedCreator && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full border border-white/20 relative">
            <button 
              onClick={() => setSelectedCreator(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center mb-6">
              <img 
                src={selectedCreator.avatar} 
                alt={selectedCreator.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-pink-400/50"
              />
              <h2 className="text-3xl font-bold text-white mb-2">{selectedCreator.name}</h2>
              <p className="text-pink-400 text-lg mb-2">@{selectedCreator.handle}</p>
              <p className="text-gray-300 mb-4">{selectedCreator.bio}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-xl font-bold text-pink-400">{selectedCreator.followerCount?.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Followers</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-xl font-bold text-blue-400">{selectedCreator.category}</div>
                <div className="text-sm text-gray-400">Category</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-xl font-bold text-green-400">
                  {selectedCreator.isVerified ? "✓" : "—"}
                </div>
                <div className="text-sm text-gray-400">Verified</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-xl font-bold text-violet-400">
                  {selectedCreator.createdAt ? new Date(selectedCreator.createdAt).getFullYear() : '2024'}
                </div>
                <div className="text-sm text-gray-400">Member Since</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button className="bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-2 rounded-full text-white font-medium hover:shadow-lg transform hover:scale-105 transition-all">
                Follow Creator
              </button>
              <button className="bg-white/10 border border-white/20 px-6 py-2 rounded-full text-white font-medium hover:bg-white/20 transition-all">
                View Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}