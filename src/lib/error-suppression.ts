/**
 * Global Error Handler for Coinbase Wallet Analytics Issues
 * This suppresses the non-critical analytics errors that don't affect functionality
 */

// Suppress console errors for Coinbase analytics endpoints
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  // Suppress Coinbase analytics/telemetry errors
  if (
    message.includes('cca-lite.coinbase.com/metrics') ||
    message.includes('net::ERR_ABORTED 502') ||
    message.includes('net::ERR_ABORTED 401') ||
    message.includes('analyticsTracker') ||
    message.includes('initCCA')
  ) {
    // These are non-critical analytics errors, suppress them
    return;
  }
  
  // Allow other errors to be logged normally
  originalConsoleError.apply(console, args);
};

// Suppress unhandled promise rejections for analytics
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  
  if (
    reason?.message?.includes('cca-lite.coinbase.com') ||
    reason?.message?.includes('analytics') ||
    reason?.message?.includes('telemetry')
  ) {
    // Suppress analytics-related promise rejections
    event.preventDefault();
    return;
  }
});

// Suppress network errors for analytics endpoints
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const url = args[0];
  
  try {
    return await originalFetch.apply(window, args);
  } catch (error) {
    // Suppress errors for Coinbase analytics endpoints
    if (
      typeof url === 'string' && 
      (url.includes('cca-lite.coinbase.com') || url.includes('metrics'))
    ) {
      // Return a fake successful response for analytics to prevent errors
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
};

export {};