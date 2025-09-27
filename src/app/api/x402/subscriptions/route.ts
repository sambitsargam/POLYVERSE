import { NextRequest, NextResponse } from 'next/server';
import { subscriptionDb } from '@/lib/subscription-db';
import { Address } from 'viem';

// GET /api/x402/subscriptions - Get user's subscriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriberId = searchParams.get('subscriberId') as Address;
    const creatorId = searchParams.get('creatorId');

    if (subscriberId) {
      // Get subscriptions for a specific subscriber
      const subscriptions = await subscriptionDb.getSubscriberSubscriptions(subscriberId);
      
      // Enrich with plan details
      const enrichedSubscriptions = await Promise.all(
        subscriptions.map(async (sub) => {
          const plan = await subscriptionDb.getSubscriptionPlan(sub.planId);
          return { ...sub, plan };
        })
      );

      return NextResponse.json({
        success: true,
        subscriptions: enrichedSubscriptions,
      });
    }

    if (creatorId) {
      // Get subscriptions for a specific creator
      const subscriptions = await subscriptionDb.getCreatorSubscriptions(creatorId);
      
      // Enrich with plan details
      const enrichedSubscriptions = await Promise.all(
        subscriptions.map(async (sub) => {
          const plan = await subscriptionDb.getSubscriptionPlan(sub.planId);
          return { ...sub, plan };
        })
      );

      return NextResponse.json({
        success: true,
        subscriptions: enrichedSubscriptions,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Either subscriberId or creatorId is required',
    }, { status: 400 });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch subscriptions',
    }, { status: 500 });
  }
}

// POST /api/x402/subscriptions - Create new subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, subscriberId, creatorId } = body;

    if (!planId || !subscriberId || !creatorId) {
      return NextResponse.json({
        success: false,
        error: 'planId, subscriberId, and creatorId are required',
      }, { status: 400 });
    }

    // Check if plan exists
    const plan = await subscriptionDb.getSubscriptionPlan(planId);
    if (!plan) {
      return NextResponse.json({
        success: false,
        error: 'Subscription plan not found',
      }, { status: 404 });
    }

    // Check if subscription already exists
    const existingSubscriptions = await subscriptionDb.getSubscriberSubscriptions(subscriberId as Address);
    const existingSubscription = existingSubscriptions.find(sub => 
      sub.planId === planId && sub.status === 'active'
    );

    if (existingSubscription) {
      return NextResponse.json({
        success: false,
        error: 'Already subscribed to this plan',
      }, { status: 409 });
    }

    // Create new subscription
    const subscription = await subscriptionDb.createSubscription(
      planId,
      subscriberId as Address,
      creatorId
    );

    if (!subscription) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create subscription',
      }, { status: 500 });
    }

    console.log('✅ Created subscription:', subscription);

    return NextResponse.json({
      success: true,
      subscription: { ...subscription, plan },
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create subscription',
    }, { status: 500 });
  }
}