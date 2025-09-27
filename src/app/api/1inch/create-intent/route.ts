// API Route: POST /api/1inch/create-intent
// Create Fusion+ intent (maker order) for cross-chain swap

import { NextRequest, NextResponse } from 'next/server';
import { oneInchFusion, QuoteResponse } from '@/lib/oneinch-fusion';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      quoteData,
      makerAddress,
      privateKey // Only for demo/testing - never use in production
    }: {
      quoteData: QuoteResponse;
      makerAddress: string;
      privateKey?: string;
    } = body;

    // Validate required parameters
    if (!quoteData || !makerAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: quoteData and makerAddress' },
        { status: 400 }
      );
    }

    console.log('Creating 1inch Fusion+ intent:', {
      maker: makerAddress,
      srcChain: quoteData.srcChainId,
      dstChain: quoteData.dstChainId,
      srcAmount: quoteData.srcAmount,
      dstAmount: quoteData.dstAmount
    });

    // TODO: replace mock with 1inch Fusion+ intent creation
    // Real implementation would:
    // 1. Validate quote data is still valid
    // 2. Create intent structure per Fusion+ specification
    // 3. Sign the intent with maker's private key (wallet integration)
    // 4. Submit signed intent to 1inch Fusion+ API
    // 5. Return intent ID and tracking info

    const intent = await oneInchFusion.createIntent(
      quoteData,
      makerAddress,
      privateKey
    );

    return NextResponse.json({
      success: true,
      data: {
        intentId: intent.id,
        maker: intent.maker,
        srcChainId: intent.srcChainId,
        dstChainId: intent.dstChainId,
        srcToken: intent.srcToken,
        dstToken: intent.dstToken,
        srcAmount: intent.srcAmount,
        dstAmount: intent.dstAmount,
        status: intent.status,
        deadline: intent.deadline,
        signature: intent.signature,
        // Include tracking URLs for testnet
        explorerUrls: {
          srcChain: getExplorerUrl(intent.srcChainId),
          dstChain: getExplorerUrl(intent.dstChainId)
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Intent creation error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create intent',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

function getExplorerUrl(chainId: number): string {
  const explorers: Record<number, string> = {
    11155111: 'https://sepolia.etherscan.io',
    84532: 'https://sepolia-explorer.base.org',
    80002: 'https://www.oklink.com/amoy',
    421614: 'https://sepolia.arbiscan.io'
  };
  
  return explorers[chainId] || 'https://etherscan.io';
}