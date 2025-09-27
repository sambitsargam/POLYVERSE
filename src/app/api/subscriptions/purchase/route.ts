import { NextRequest, NextResponse } from 'next/server';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';
import { parseUnits } from 'viem';

// x402 Facilitator Configuration for Polygon Amoy (Official)
const X402_FACILITATOR_CONFIG = {
  url: process.env.X402_FACILITATOR_URL || 'https://x402.polygon.technology',
  // Official Polygon Amoy facilitator - handles all gas fees and settlement
};

// x402 Configuration
const X402_CONFIG = {
  USDC_AMOY: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // USDC on Polygon Amoy testnet
  RECIPIENT_ADDRESS: process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS || '0x90D9CD66FAdFF1C2Ba32C99A47C76532d08A704B',
};

/**
 * Create x402 payment requirements following the official specification
 */
function createPaymentRequirements(plan: any) {
  const network = plan.network === 'polygon' ? 'polygon' : 'polygon-amoy';
  const usdcAddress = X402_CONFIG.USDC_AMOY;
  
  // Convert USD to USDC atomic units (6 decimals for USDC)
  const amountUsdc = parseUnits(plan.price.toString(), 6);

  return {
    scheme: 'exact' as const,
    network,
    maxAmountRequired: amountUsdc.toString(),
    asset: usdcAddress,
    payTo: X402_CONFIG.RECIPIENT_ADDRESS,
    resource: `/api/subscriptions/activate/${plan.id}`,
    description: `Subscription: ${plan.name} - ${plan.description}`,
    mimeType: 'application/json',
    maxTimeoutSeconds: 300, // 5 minutes
    extra: {
      name: 'USDC',
      version: '2',
      subscriptionPlan: plan.id,
      duration: plan.duration,
    }
  };
}

/**
 * x402 Subscription Purchase Endpoint
 * Implements the x402 protocol for micropayments on Polygon Amoy
 */
export async function POST(req: NextRequest) {
  try {
    console.log('x402 API: Processing subscription purchase request...');
    console.log('x402 Facilitator URL:', X402_FACILITATOR_CONFIG.url);
    
    const body = await req.json();
    const { planId, paymentRequirements } = body;

    console.log('x402 API: Request data:', { planId, hasPaymentRequirements: !!paymentRequirements });

    // Find the subscription plan
    const plan = SUBSCRIPTION_PLANS.find((p: any) => p.id === planId);
    if (!plan) {
      console.log('x402 API: Invalid plan ID:', planId);
      return NextResponse.json({ error: 'Invalid subscription plan' }, { status: 400 });
    }

    console.log('x402 API: Found plan:', plan.name);

    // Check for X-PAYMENT header (x402 standard)
    const paymentHeader = req.headers.get('X-PAYMENT');
    console.log('x402 API: Payment header present:', !!paymentHeader);
    
    if (!paymentHeader) {
      // Return 402 Payment Required with x402-compliant payment requirements
      const requirements = paymentRequirements || createPaymentRequirements(plan);
      
      console.log('x402 Payment Required (Polygon Amoy):', requirements);
      
      return NextResponse.json({
        x402Version: 1,
        error: 'X-PAYMENT header is required for subscription purchase',
        accepts: [requirements],
      }, { 
        status: 402,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Process payment with facilitator (in real implementation)
    console.log('x402 Payment received for plan:', plan.name);
    console.log('Payment Header:', paymentHeader);
    
    // TODO: Implement real facilitator verification
    // This should:
    // 1. Send payment payload to facilitator /verify endpoint
    // 2. If valid, call facilitator /settle endpoint
    // 3. Wait for on-chain transaction confirmation
    // 4. Return transaction hash in X-PAYMENT-RESPONSE header
    
    const verificationResult = await verifyPaymentWithFacilitator(paymentHeader, paymentRequirements);
    
    if (!verificationResult.isValid) {
      return NextResponse.json({
        x402Version: 1,
        error: 'Payment verification failed',
        accepts: [paymentRequirements],
      }, { status: 402 });
    }

    // Simulate settlement for demo
    const settlementResult = await settlePaymentWithFacilitator(paymentHeader, paymentRequirements);
    
    if (!settlementResult.success) {
      return NextResponse.json({
        error: 'Payment settlement failed on Polygon Amoy',
      }, { status: 500 });
    }

    const subscriptionData = {
      planId: plan.id,
      name: plan.name,
      startTime: Math.floor(Date.now() / 1000),
      endTime: Math.floor(Date.now() / 1000) + plan.duration,
      isActive: true,
      network: plan.network,
    };

    const response = NextResponse.json({
      success: true,
      message: `Subscription "${plan.name}" activated with x402 on ${plan.network}!`,
      subscription: subscriptionData,
      txHash: settlementResult.txHash,
    });

    // Add X-PAYMENT-RESPONSE header (x402 standard)
    response.headers.set('X-PAYMENT-RESPONSE', 
      Buffer.from(JSON.stringify({
        success: true,
        transaction: settlementResult.txHash,
        network: plan.network,
        payer: settlementResult.payer || '0x0000000000000000000000000000000000000000'
      })).toString('base64')
    );

    return response;

  } catch (error: any) {
    console.error('x402 Subscription purchase error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process x402 subscription' },
      { status: 500 }
    );
  }
}

/**
 * Verify payment with x402 facilitator
 * In production, this would call the real facilitator API
 */
async function verifyPaymentWithFacilitator(paymentHeader: string, paymentRequirements: any) {
  try {
    console.log('Calling REAL x402 facilitator for verification...');
    console.log('Facilitator URL:', X402_FACILITATOR_CONFIG.url);
    
    const response = await fetch(`${X402_FACILITATOR_CONFIG.url}/verify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        x402Version: 1,
        paymentPayload: paymentHeader, // base64 encoded payload
        paymentRequirements,
      }),
    });

    if (!response.ok) {
      console.error('Facilitator verification failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return { isValid: false, error: `Facilitator returned ${response.status}` };
    }

    const result = await response.json();
    console.log('Facilitator verification result:', result);
    
    return {
      isValid: result.valid === true,
      payer: result.payer || result.from,
      error: result.error
    };
  } catch (error: any) {
    console.error('Facilitator verification error:', error);
    return { isValid: false, error: error?.message || 'Unknown error' };
  }
}

/**
 * Settle payment with x402 facilitator
 * In production, this would trigger the on-chain transaction
 */
async function settlePaymentWithFacilitator(paymentHeader: string, paymentRequirements: any) {
  try {
    console.log('Calling REAL x402 facilitator for settlement...');
    
    const response = await fetch(`${X402_FACILITATOR_CONFIG.url}/settle`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        x402Version: 1,
        paymentPayload: paymentHeader,
        paymentRequirements,
      }),
    });

    if (!response.ok) {
      console.error('Facilitator settlement failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Settlement error details:', errorText);
      return { success: false, error: `Settlement failed: ${response.status}` };
    }

    const result = await response.json();
    console.log('Facilitator settlement result:', result);
    
    return {
      success: true,
      txHash: result.transactionHash || result.txHash || result.transaction,
      payer: result.payer || result.from,
      blockNumber: result.blockNumber,
      network: 'polygon-amoy'
    };
  } catch (error: any) {
    console.error('Facilitator settlement error:', error);
    return { success: false, error: error?.message || 'Settlement failed' };
  }
}