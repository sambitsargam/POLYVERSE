import { NextRequest, NextResponse } from 'next/server';
import { paymentMiddleware } from 'x402-next';

// X402 middleware configuration for subscription routes
const x402Middleware = paymentMiddleware(
  (process.env.X402_RECIPIENT_ADDRESS || '0xF846d2747D1cb33635Cc66dD6D513d85Cb830f13') as `0x${string}`,
  {
    '/api/subscriptions/*': {
      price: '$5.00', // Base price, will be dynamic
      network: 'polygon-amoy',
      config: {
        description: 'Subscription service payment',
        maxTimeoutSeconds: 300,
      }
    }
  },
  {
    url: (process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator') as `${string}://${string}`,
  }
);

export async function middleware(request: NextRequest) {
  // Apply x402 payment middleware to subscription API routes
  if (request.nextUrl.pathname.startsWith('/api/subscriptions/')) {
    try {
      const response = await x402Middleware(request);
      return response;
    } catch (error) {
      console.error('X402 middleware error:', error);
      return NextResponse.json(
        { error: 'Payment processing failed' },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/subscriptions/:path*']
};