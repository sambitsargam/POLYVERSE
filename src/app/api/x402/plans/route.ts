import { NextRequest, NextResponse } from 'next/server';
import { subscriptionDb } from '@/lib/subscription-db';
import { Address } from 'viem';

// GET /api/x402/plans - Get subscription plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');

    if (creatorId) {
      // Get plans for a specific creator
      const plans = await subscriptionDb.getCreatorSubscriptionPlans(creatorId);
      return NextResponse.json({
        success: true,
        plans,
      });
    }

    // Get all plans
    const plans = await subscriptionDb.getAllSubscriptionPlans();
    return NextResponse.json({
      success: true,
      plans,
    });

  } catch (error) {
    console.error('Get plans error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch subscription plans',
    }, { status: 500 });
  }
}

// POST /api/x402/plans - Create new subscription plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      creatorId,
      name,
      description,
      priceUSD,
      interval,
      intervalCount = 1,
      paymentAsset,
    } = body;

    // Validation
    if (!creatorId || !name || !priceUSD || !interval) {
      return NextResponse.json({
        success: false,
        error: 'creatorId, name, priceUSD, and interval are required',
      }, { status: 400 });
    }

    if (!['daily', 'weekly', 'monthly'].includes(interval)) {
      return NextResponse.json({
        success: false,
        error: 'interval must be daily, weekly, or monthly',
      }, { status: 400 });
    }

    if (priceUSD <= 0) {
      return NextResponse.json({
        success: false,
        error: 'priceUSD must be greater than 0',
      }, { status: 400 });
    }

    // Create subscription plan
    const plan = await subscriptionDb.createSubscriptionPlan({
      creatorId,
      name,
      description: description || '',
      priceUSD: parseFloat(priceUSD),
      interval,
      intervalCount: parseInt(intervalCount) || 1,
      paymentAsset: (paymentAsset as Address) || '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582', // Default to USDC on Polygon Amoy
      isActive: true,
    });

    console.log('✅ Created subscription plan:', plan);

    return NextResponse.json({
      success: true,
      plan,
    });

  } catch (error) {
    console.error('Create plan error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create subscription plan',
    }, { status: 500 });
  }
}