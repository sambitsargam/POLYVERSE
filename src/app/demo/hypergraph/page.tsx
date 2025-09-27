import dynamic from 'next/dynamic'

// Dynamically import to avoid SSR issues with Hypergraph
const HypergraphDemo = dynamic(
  () => import('@/components/demo/HypergraphDemo'),
  { ssr: false }
)

export default function HypergraphDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
            POLYVERSE Hypergraph Demo
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the power of decentralized data with The Graph Hypergraph integration. 
            Create and query real blockchain data for the creator economy.
          </p>
        </div>
        
        <HypergraphDemo />
      </div>
    </div>
  );
}