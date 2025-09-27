// API Route: GET /api/1inch/quote
// Get cross-chain swap quote using 1inch Fusion+

import { NextRequest, NextResponse } from 'next/server';
import { oneInchFusion, QuoteParams } from '@/lib/oneinch-fusion';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const quoteParams: QuoteParams = {
      srcChainId: parseInt(searchParams.get('srcChainId') || '0'),
      dstChainId: parseInt(searchParams.get('dstChainId') || '0'),
      srcTokenAddress: searchParams.get('srcTokenAddress') || '',
      dstTokenAddress: searchParams.get('dstTokenAddress') || '',
      amount: searchParams.get('amount') || '0',
      walletAddress: searchParams.get('walletAddress') || ''
    };

    // Validate required parameters
    if (!quoteParams.srcChainId || !quoteParams.dstChainId || 
        !quoteParams.srcTokenAddress || !quoteParams.dstTokenAddress || 
        !quoteParams.amount || !quoteParams.walletAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Processing 1inch quote request:', quoteParams);

    // TODO: replace mock with 1inch Fusion+ quote API
    const quote = await oneInchFusion.getQuote(quoteParams);

    return NextResponse.json({
      success: true,
      data: quote,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quote API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get quote',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const quoteParams: QuoteParams = {
      srcChainId: body.srcChainId,
      dstChainId: body.dstChainId,
      srcTokenAddress: body.srcTokenAddress,
      dstTokenAddress: body.dstTokenAddress,
      amount: body.amount,
      walletAddress: body.walletAddress
    };

    // Validate required parameters
    if (!quoteParams.srcChainId || !quoteParams.dstChainId || 
        !quoteParams.srcTokenAddress || !quoteParams.dstTokenAddress || 
        !quoteParams.amount || !quoteParams.walletAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Processing 1inch quote request (POST):', quoteParams);

    // TODO: replace mock with 1inch Fusion+ quote API
    const quote = await oneInchFusion.getQuote(quoteParams);

    return NextResponse.json({
      success: true,
      data: quote,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quote API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get quote',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}