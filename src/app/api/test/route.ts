import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'x402 API is working',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || '3000',
    origin: process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:3000'
  });
}