import { NextRequest, NextResponse } from 'next/server';

// X402 middleware disabled - using custom implementation in API routes
// The x402-next package was causing conflicts with our custom x402 implementation

export async function middleware(request: NextRequest) {
  // For now, just pass through all requests to our custom API handlers
  // Our custom x402 implementation is in /api/subscriptions/purchase/route.ts
  
  console.log('Middleware: Passing through request to custom x402 API handler');
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/subscriptions/:path*']
};