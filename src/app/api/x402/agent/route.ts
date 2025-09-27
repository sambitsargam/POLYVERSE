import { NextRequest, NextResponse } from 'next/server';
import { x402Agent } from '@/lib/x402-agent';

// GET /api/x402/agent/status - Get agent status
export async function GET() {
  try {
    const status = x402Agent.getStatus();
    const stats = await x402Agent.getPaymentStats();

    return NextResponse.json({
      success: true,
      agent: {
        ...status,
        stats,
      },
    });

  } catch (error) {
    console.error('Get agent status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get agent status',
    }, { status: 500 });
  }
}

// POST /api/x402/agent/control - Control agent (start/stop/configure)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config } = body;

    switch (action) {
      case 'start':
        x402Agent.start();
        return NextResponse.json({
          success: true,
          message: 'Agent started successfully',
        });

      case 'stop':
        x402Agent.stop();
        return NextResponse.json({
          success: true,
          message: 'Agent stopped successfully',
        });

      case 'configure':
        if (!config) {
          return NextResponse.json({
            success: false,
            error: 'config is required for configure action',
          }, { status: 400 });
        }
        x402Agent.updateConfig(config);
        return NextResponse.json({
          success: true,
          message: 'Agent configuration updated',
        });

      case 'force-process':
        const { subscriptionId } = body;
        if (!subscriptionId) {
          return NextResponse.json({
            success: false,
            error: 'subscriptionId is required for force-process action',
          }, { status: 400 });
        }
        
        const result = await x402Agent.forceProcessSubscription(subscriptionId);
        return NextResponse.json(result);

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: start, stop, configure, force-process',
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Agent control error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to control agent',
    }, { status: 500 });
  }
}