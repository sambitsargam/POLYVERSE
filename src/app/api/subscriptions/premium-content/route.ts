import { NextRequest, NextResponse } from 'next/server';
import { x402SubscriptionService } from '@/lib/x402-subscription-service';

export async function GET(req: NextRequest) {
  try {
    // In a real application, you would verify the user's wallet address
    // and check their subscription status against blockchain data
    // For this demo, we'll use localStorage data
    
    const subscriptionHeader = req.headers.get('x-subscription-token');
    const userAddress = req.headers.get('x-user-address');
    
    if (!subscriptionHeader || !userAddress) {
      return NextResponse.json(
        {
          error: 'Subscription required',
          message: 'Please subscribe to access premium content',
          subscriptionRequired: true,
        },
        { status: 402 }
      );
    }

    // Check if user has any active subscription
    // In production, this would check against blockchain/database
    const hasActiveSubscription = x402SubscriptionService.hasActiveSubscription();
    
    if (!hasActiveSubscription) {
      return NextResponse.json(
        {
          error: 'No active subscription',
          message: 'Your subscription has expired. Please renew to continue accessing premium content.',
          subscriptionRequired: true,
        },
        { status: 402 }
      );
    }

    // Return premium content
    const premiumContent = {
      title: 'Premium Market Analysis',
      content: `
        # Exclusive Market Insights - ${new Date().toLocaleDateString()}
        
        ## Weekly Analysis
        
        This week's market analysis shows significant movement in the cryptocurrency sector...
        
        ## Key Takeaways:
        - Bitcoin maintains strong support levels above $65,000
        - Ethereum's upcoming upgrades continue to drive institutional interest
        - Polygon ecosystem growth accelerates with new DeFi protocols
        - Layer 2 solutions see increased adoption rates
        
        ## Premium Recommendations:
        1. **Long-term Hold**: Consider accumulating Ethereum during any dips below $3,000
        2. **DeFi Opportunities**: Polygon-based yield farming showing 12-15% APY
        3. **NFT Sector**: Blue-chip collections maintaining floor prices despite market volatility
        
        ## Next Week Outlook:
        Federal Reserve meeting scheduled for next Thursday may impact crypto markets...
        
        *This premium analysis is only available to POLYVERSE subscribers.*
      `,
      publishedAt: new Date().toISOString(),
      category: 'Market Analysis',
      readTime: '5 min read',
      exclusive: true,
    };

    return NextResponse.json({
      success: true,
      data: premiumContent,
      subscription: {
        active: true,
        tier: 'premium',
        accessLevel: 'full'
      }
    });

  } catch (error: any) {
    console.error('Premium content access error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch premium content' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function HEAD(req: NextRequest) {
  return new NextResponse(null, { status: 200 });
}