import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CheckoutModal } from '@/components/CheckoutModal';
import { showToast } from '@/components/Toast';
import { MockDataStore } from '@/lib/mockData';

// Mock dependencies
jest.mock('@/components/Toast');
jest.mock('@/lib/mockData');

const mockSubscriptionTier = {
  id: 'premium',
  name: 'Premium Tier',
  priceUSD: 29.99,
  interval: 'month' as const,
  features: ['Feature 1', 'Feature 2'],
};

const mockRates = {
  USD_TO_MATIC: 0.65,
  USD_TO_ETH: 0.0004,
  USD_TO_USDC: 1.0,
  lastUpdated: '2024-09-27T10:00:00Z',
};

describe('CheckoutModal', () => {
  const mockOnClose = jest.fn();
  const mockShowToast = showToast as jest.MockedFunction<typeof showToast>;
  const mockGetMockRates = MockDataStore.getMockRates as jest.MockedFunction<typeof MockDataStore.getMockRates>;
  const mockSimulatePayment = MockDataStore.simulatePayment as jest.MockedFunction<typeof MockDataStore.simulatePayment>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMockRates.mockResolvedValue(mockRates);
  });

  it('does not render when closed', () => {
    render(
      <CheckoutModal
        isOpen={false}
        onClose={mockOnClose}
        item={mockSubscriptionTier}
        itemType="subscription"
        creatorId="test-creator"
      />
    );

    expect(screen.queryByText('Complete Purchase')).not.toBeInTheDocument();
  });

  it('renders modal content when open', () => {
    render(
      <CheckoutModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockSubscriptionTier}
        itemType="subscription"
        creatorId="test-creator"
      />
    );

    expect(screen.getByText('Complete Purchase')).toBeInTheDocument();
    expect(screen.getByText('Premium Tier')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('displays token selection options', () => {
    render(
      <CheckoutModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockSubscriptionTier}
        itemType="subscription"
        creatorId="test-creator"
      />
    );

    expect(screen.getByText('USDC')).toBeInTheDocument();
    expect(screen.getByText('MATIC')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <CheckoutModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockSubscriptionTier}
        itemType="subscription"
        creatorId="test-creator"
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('processes payment successfully', async () => {
    const mockPurchase = {
      id: 'purchase_123',
      userId: 'user_123',
      creatorId: 'test-creator',
      itemId: 'premium',
      itemType: 'subscription' as const,
      amountUSD: 29.99,
      token: 'USDC' as const,
      tokenAmount: 29.99,
      transactionHash: '0x123...',
      createdAt: '2024-09-27T10:00:00Z',
      status: 'completed' as const,
    };

    mockSimulatePayment.mockResolvedValue(mockPurchase);

    render(
      <CheckoutModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockSubscriptionTier}
        itemType="subscription"
        creatorId="test-creator"
      />
    );

    const payButton = screen.getByRole('button', { name: /pay.*simulate/i });
    fireEvent.click(payButton);

    // Should show processing state
    expect(screen.getByText('Processing Payment...')).toBeInTheDocument();

    // Wait for payment to complete
    await waitFor(() => {
      expect(mockSimulatePayment).toHaveBeenCalledWith(
        'mock_user_123',
        'test-creator',
        'premium',
        'subscription',
        29.99,
        'USDC'
      );
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Payment successful! Transaction confirmed.',
        'success'
      );
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles payment failure', async () => {
    mockSimulatePayment.mockRejectedValue(new Error('Payment failed'));

    render(
      <CheckoutModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockSubscriptionTier}
        itemType="subscription"
        creatorId="test-creator"
      />
    );

    const payButton = screen.getByRole('button', { name: /pay.*simulate/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Payment failed. Please try again.',
        'error'
      );
    });
  });

  it('calculates token amounts correctly', async () => {
    render(
      <CheckoutModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockSubscriptionTier}
        itemType="subscription"
        creatorId="test-creator"
      />
    );

    // Wait for rates to load
    await waitFor(() => {
      expect(screen.getByText(/29\.99.*USDC/)).toBeInTheDocument();
    });

    // Click MATIC option
    fireEvent.click(screen.getByText('MATIC'));

    await waitFor(() => {
      // 29.99 * 0.65 = 19.4935 MATIC
      expect(screen.getByText(/19\.49.*MATIC/)).toBeInTheDocument();
    });
  });
});