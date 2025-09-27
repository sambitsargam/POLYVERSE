import { NextRequest, NextResponse } from 'next/server';
import { SUBSCRIPTION_PLANS, x402SubscriptionService } from '@/lib/x402-subscription-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId } = body;

    // Find the subscription plan
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid subscription plan' }, { status: 400 });
    }

    // For now, we'll simulate successful payment
    // In production, this would integrate with x402 payment verification
    
    const paymentHeader = req.headers.get('X-PAYMENT');
    if (!paymentHeader) {
      // Return 402 Payment Required with payment requirements
      const paymentRequirements = x402SubscriptionService.createPaymentRequirements(plan);
      
      return NextResponse.json({
        x402Version: 1,
        error: 'X-PAYMENT header is required',
        accepts: [paymentRequirements],
      }, { 
        status: 402,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Mock payment verification - in production, this would verify with facilitator
    console.log('Processing payment for plan:', plan.name);
    
    // Simulate successful payment
    const subscriptionData = {
      planId: plan.id,
      name: plan.name,
      startTime: Math.floor(Date.now() / 1000),
      endTime: Math.floor(Date.now() / 1000) + plan.duration,
      isActive: true,
      network: plan.network,
    };

    // Mock transaction hash
    const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;

    const response = NextResponse.json({
      success: true,
      message: `Subscription "${plan.name}" activated successfully!`,
      subscription: subscriptionData,
      txHash: mockTxHash,
    });

    // Add mock payment response header
    response.headers.set('X-PAYMENT-RESPONSE', 
      Buffer.from(JSON.stringify({
        success: true,
        transaction: mockTxHash,
        network: plan.network,
        payer: '0x0000000000000000000000000000000000000000'
      })).toString('base64')
    );

    return response;

  } catch (error: any) {
    console.error('Subscription purchase error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process subscription' },
      { status: 500 }
    );
  }
}