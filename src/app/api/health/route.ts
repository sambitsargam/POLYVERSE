import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ 
      message: 'API health check OK',
      timestamp: new Date().toISOString(),
      x402Config: {
        facilitatorUrl: process.env.X402_FACILITATOR_URL || 'https://x402.polygon.technology',
        usdcAmoy: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
        recipientAddress: process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS
      }
    });
  } catch (error: any) {
    console.error('API Health check error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}