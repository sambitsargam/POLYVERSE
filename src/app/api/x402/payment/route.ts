import { NextRequest, NextResponse } from 'next/server';
import { x402Service } from '@/lib/x402-service';
import { subscriptionDb } from '@/lib/subscription-db';
import { Address } from 'viem';

// POST /api/x402/payment - Process x402 payment intent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, paymentPayload } = body;

    if (!subscriptionId || !paymentPayload) {
      return NextResponse.json({
        success: false,
        error: 'subscriptionId and paymentPayload are required',
      }, { status: 400 });
    }

    // Get subscription and plan
    const subscription = await subscriptionDb.getSubscription(subscriptionId);
    if (!subscription) {
      return NextResponse.json({
        success: false,
        error: 'Subscription not found',
      }, { status: 404 });
    }

    const plan = await subscriptionDb.getSubscriptionPlan(subscription.planId);
    if (!plan) {
      return NextResponse.json({
        success: false,
        error: 'Subscription plan not found',
      }, { status: 404 });
    }

    // Create payment requirements
    const creatorAddress = '0x2345678901234567890123456789012345678901' as Address; // Mock creator address
    const paymentRequirements = x402Service.createPaymentRequirements(
      plan,
      creatorAddress,
      `https://polyverse.app/subscription/${subscriptionId}`
    );

    // Verify payment
    console.log('🔍 Verifying x402 payment:', { subscriptionId, paymentPayload });
    const verifyResponse = await x402Service.verifyPayment(paymentPayload, paymentRequirements);

    if (!verifyResponse.isValid) {
      return NextResponse.json({
        success: false,
        error: verifyResponse.invalidReason || 'Payment verification failed',
      }, { status: 402 });
    }

    // Settle payment
    console.log('💰 Settling x402 payment:', { subscriptionId });
    const settleResponse = await x402Service.settlePayment(paymentPayload, paymentRequirements);

    if (!settleResponse.success) {
      return NextResponse.json({
        success: false,
        error: settleResponse.errorReason || 'Payment settlement failed',
      }, { status: 500 });
    }

    // Update subscription
    const nextPaymentDate = x402Service.calculateNextPaymentDate(
      new Date(),
      plan.interval,
      plan.intervalCount
    );

    const totalPaidWei = BigInt(subscription.totalPaid) + BigInt(plan.priceUSD * 1e6);

    await subscriptionDb.updateSubscription(subscriptionId, {
      lastPaymentDate: new Date(),
      lastPaymentTxHash: settleResponse.transaction,
      nextPaymentDate,
      totalPaid: totalPaidWei.toString(),
      failedPayments: 0,
    });

    console.log('✅ x402 payment processed successfully:', settleResponse.transaction);

    return NextResponse.json({
      success: true,
      transaction: settleResponse.transaction,
      nextPaymentDate,
    });

  } catch (error) {
    console.error('x402 payment error:', error);
    return NextResponse.json({
      success: false,
      error: 'Payment processing failed',
    }, { status: 500 });
  }
}

// GET /api/x402/payment/requirements - Get payment requirements for subscription
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
      return NextResponse.json({
        success: false,
        error: 'subscriptionId is required',
      }, { status: 400 });
    }

    // Get subscription and plan
    const subscription = await subscriptionDb.getSubscription(subscriptionId);
    if (!subscription) {
      return NextResponse.json({
        success: false,
        error: 'Subscription not found',
      }, { status: 404 });
    }

    const plan = await subscriptionDb.getSubscriptionPlan(subscription.planId);
    if (!plan) {
      return NextResponse.json({
        success: false,
        error: 'Subscription plan not found',
      }, { status: 404 });
    }

    // Create payment requirements
    const creatorAddress = '0x2345678901234567890123456789012345678901' as Address; // Mock creator address
    const paymentRequirements = x402Service.createPaymentRequirements(
      plan,
      creatorAddress,
      `https://polyverse.app/subscription/${subscriptionId}`
    );

    // Get facilitator status
    const facilitatorStatus = await x402Service.getFacilitatorStatus();

    return NextResponse.json({
      success: true,
      paymentRequirements,
      facilitator: facilitatorStatus,
      subscription,
      plan,
    });

  } catch (error) {
    console.error('Get payment requirements error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get payment requirements',
    }, { status: 500 });
  }
}