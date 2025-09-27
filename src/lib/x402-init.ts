// x402 Agent initialization
// This file initializes the x402 agent for recurring payment processing

import { x402Agent } from '@/lib/x402-agent';

// Initialize the agent when the module is loaded (server-side only)
if (typeof window === 'undefined') {
  console.log('🚀 Initializing x402 Agent...');
  
  // Start the agent after a short delay to allow server startup
  setTimeout(() => {
    try {
      x402Agent.start();
      console.log('✅ x402 Agent started successfully');
    } catch (error) {
      console.error('❌ Failed to start x402 Agent:', error);
    }
  }, 5000); // Start after 5 seconds
}

export { x402Agent };