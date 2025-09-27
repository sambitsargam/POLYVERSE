'use client';

import React, { useState } from 'react';
import { 
  useCreators, 
  useFans, 
  useFollows, 
  usePolyverseHypergraph 
} from '../../hypergraph/service';

const DEMO_SPACE_ID = 'polyverse-demo';

export default function HypergraphDemo() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<any>(null);
  
  // Query data from service
  const { data: creators, isPending: creatorsLoading } = useCreators(DEMO_SPACE_ID, 10);
  const { data: fans, isPending: fansLoading } = useFans(DEMO_SPACE_ID, 10);
  const { data: follows, isPending: followsLoading } = useFollows(DEMO_SPACE_ID, 20);
  
  // Get publishing utilities
  const { publishRealDemoData } = usePolyverseHypergraph();

  const handlePublishDemo = async () => {
    setIsPublishing(true);
    setPublishResult(null);
    
    try {
      const result = await publishRealDemoData(DEMO_SPACE_ID);
      setPublishResult(result);
    } catch (error) {
      console.error('Failed to publish demo data:', error);
      setPublishResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Interactive Demo
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Explore the POLYVERSE creator ecosystem with data integration and publishing capabilities.
        </p>
      </div>

      {/* Publishing Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Publish Demo Data
            </h3>
            <p className="text-gray-300">
              Create sample creators, fans, and relationships
            </p>
          </div>
          <button
            onClick={handlePublishDemo}
            disabled={isPublishing}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isPublishing
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {isPublishing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Publishing...</span>
              </div>
            ) : (
              'Publish Data'
            )}
          </button>
        </div>
        
        {publishResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            publishResult.success 
              ? 'bg-green-500/20 border border-green-400/30' 
              : 'bg-red-500/20 border border-red-400/30'
          }`}>
            <h4 className={`font-semibold mb-2 ${
              publishResult.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {publishResult.success ? '✅ Published Successfully!' : '❌ Publishing Failed'}
            </h4>
            {publishResult.summary && (
              <div className="text-sm text-white space-y-1">
                <div>Total entities: {publishResult.summary.total}</div>
                <div>Successful: {publishResult.summary.successful}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Creators */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-violet-500 p-4">
            <h3 className="text-lg font-semibold text-white flex items-center justify-between">
              Creators
              <span className="px-2 py-1 bg-black/20 rounded-full text-sm">
                {creators?.length || 0}
              </span>
            </h3>
          </div>
          
          <div className="p-4 h-64 overflow-y-auto">
            {creatorsLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full" />
              </div>
            ) : creators && creators.length > 0 ? (
              <div className="space-y-3">
                {creators.map((creator: any) => (
                  <div key={creator.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={creator.avatar} 
                        alt={creator.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">
                          {creator.name}
                        </div>
                        <div className="text-sm text-gray-300">
                          @{creator.handle}
                        </div>
                        <div className="text-xs text-gray-400">
                          {creator.category}
                        </div>
                      </div>
                      {creator.isVerified && (
                        <div className="text-blue-400">✓</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 h-full flex items-center justify-center">
                <div>
                  <div className="mb-2">👑</div>
                  <div>No creators yet</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fans */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
            <h3 className="text-lg font-semibold text-white flex items-center justify-between">
              Community
              <span className="px-2 py-1 bg-black/20 rounded-full text-sm">
                {fans?.length || 0}
              </span>
            </h3>
          </div>
          
          <div className="p-4 h-64 overflow-y-auto">
            {fansLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
              </div>
            ) : fans && fans.length > 0 ? (
              <div className="space-y-3">
                {fans.map((fan: any) => (
                  <div key={fan.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={fan.avatar} 
                        alt={fan.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">
                          {fan.name}
                        </div>
                        <div className="text-sm text-gray-300">
                          @{(fan as any).handle}
                        </div>
                        <div className="text-xs text-gray-400">
                          Following {(fan as any).followingCount || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 h-full flex items-center justify-center">
                <div>
                  <div className="mb-2">👥</div>
                  <div>No community members yet</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Connections */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
            <h3 className="text-lg font-semibold text-white flex items-center justify-between">
              Connections
              <span className="px-2 py-1 bg-black/20 rounded-full text-sm">
                {follows?.length || 0}
              </span>
            </h3>
          </div>
          
          <div className="p-4 h-64 overflow-y-auto">
            {followsLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full" />
              </div>
            ) : follows && follows.length > 0 ? (
              <div className="space-y-3">
                {follows.map((follow: any) => (
                  <div key={follow.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-white text-sm">
                      <div className="font-medium">New Connection</div>
                      <div className="text-gray-300">
                        {(follow as any).supportLevel || 'Basic'} supporter
                      </div>
                      <div className="text-xs text-gray-400">
                        September 27, 2025
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 h-full flex items-center justify-center">
                <div>
                  <div className="mb-2">🔗</div>
                  <div>No connections yet</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}