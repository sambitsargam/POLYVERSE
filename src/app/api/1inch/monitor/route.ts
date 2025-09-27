// API Route: GET /api/1inch/monitor
// Monitor Fusion+ intent execution status

import { NextRequest, NextResponse } from 'next/server';
import { oneInchFusion } from '@/lib/oneinch-fusion';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const intentId = searchParams.get('intentId');

    if (!intentId) {
      return NextResponse.json(
        { error: 'Missing intentId parameter' },
        { status: 400 }
      );
    }

    console.log('Monitoring intent status:', intentId);

    // TODO: replace mock with 1inch Fusion+ status monitoring
    // Real implementation would:
    // 1. Query 1inch Fusion+ API for intent status
    // 2. Check if intent has been matched with a resolver
    // 3. Monitor execution progress on both chains
    // 4. Return transaction hashes and final settlement proof
    
    const status = await oneInchFusion.getIntentStatus(intentId);

    return NextResponse.json({
      success: true,
      data: {
        intentId,
        status: status.status,
        srcTxHash: status.srcTxHash,
        dstTxHash: status.dstTxHash,
        executedAt: status.executedAt,
        failureReason: status.failureReason,
        // Include explorer links for transaction verification
        explorerLinks: generateExplorerLinks(status, intentId)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Monitor API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get intent status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intentId } = body;

    if (!intentId) {
      return NextResponse.json(
        { error: 'Missing intentId in request body' },
        { status: 400 }
      );
    }

    console.log('Monitoring intent status (POST):', intentId);

    // TODO: replace mock with 1inch Fusion+ status monitoring
    const status = await oneInchFusion.getIntentStatus(intentId);

    return NextResponse.json({
      success: true,
      data: {
        intentId,
        status: status.status,
        srcTxHash: status.srcTxHash,
        dstTxHash: status.dstTxHash,
        executedAt: status.executedAt,
        failureReason: status.failureReason,
        explorerLinks: generateExplorerLinks(status, intentId)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Monitor API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get intent status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

function generateExplorerLinks(status: any, intentId: string) {
  const links: any = {};
  
  if (status.srcTxHash) {
    // These would be determined by the actual source chain
    links.srcTransaction = `https://sepolia.etherscan.io/tx/${status.srcTxHash}`;
  }
  
  if (status.dstTxHash) {
    // These would be determined by the actual destination chain  
    links.dstTransaction = `https://sepolia.etherscan.io/tx/${status.dstTxHash}`;
  }
  
  return links;
}