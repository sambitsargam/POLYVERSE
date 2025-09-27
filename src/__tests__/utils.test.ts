import { calculateMRR, getActiveSubscribers, getTotalEarnings } from '@/lib/utils';
import { Creator, Purchase } from '@/lib/types';

const mockCreators: Creator[] = [
  {
    id: 'creator-1',
    handle: 'creator1',
    name: 'Creator One',
    avatar: 'https://example.com/avatar1.jpg',
    banner: 'https://example.com/banner1.jpg',
    bio: 'Creator bio',
    category: 'Technology',
    followers: 1000,
    isVerified: true,
    createdAt: '2023-01-01T00:00:00Z',
    socialLinks: {},
    subscriptionTiers: [
      {
        id: 'basic',
        name: 'Basic Tier',
        priceUSD: 10.00,
        interval: 'month',
        features: ['Feature 1'],
      },
      {
        id: 'premium',
        name: 'Premium Tier',
        priceUSD: 25.00,
        interval: 'month',
        features: ['Feature 1', 'Feature 2'],
      },
    ],
  },
  {
    id: 'creator-2',
    handle: 'creator2',
    name: 'Creator Two',
    avatar: 'https://example.com/avatar2.jpg',
    banner: 'https://example.com/banner2.jpg',
    bio: 'Another creator bio',
    category: 'Art',
    followers: 2000,
    isVerified: false,
    createdAt: '2023-02-01T00:00:00Z',
    socialLinks: {},
    subscriptionTiers: [
      {
        id: 'supporter',
        name: 'Supporter',
        priceUSD: 5.00,
        interval: 'month',
        features: ['Support'],
      },
    ],
  },
];

const mockPurchases: Purchase[] = [
  {
    id: 'purchase-1',
    userId: 'user-1',
    creatorId: 'creator-1',
    itemId: 'basic',
    itemType: 'subscription',
    amountUSD: 10.00,
    token: 'USDC',
    tokenAmount: 10.00,
    transactionHash: '0x123...',
    createdAt: '2024-01-15T00:00:00Z',
    status: 'completed',
  },
  {
    id: 'purchase-2',
    userId: 'user-2',
    creatorId: 'creator-1',
    itemId: 'premium',
    itemType: 'subscription',
    amountUSD: 25.00,
    token: 'USDC',
    tokenAmount: 25.00,
    transactionHash: '0x456...',
    createdAt: '2024-01-20T00:00:00Z',
    status: 'completed',
  },
  {
    id: 'purchase-3',
    userId: 'user-3',
    creatorId: 'creator-2',
    itemId: 'supporter',
    itemType: 'subscription',
    amountUSD: 5.00,
    token: 'MATIC',
    tokenAmount: 7.69,
    transactionHash: '0x789...',
    createdAt: '2024-01-25T00:00:00Z',
    status: 'completed',
  },
  {
    id: 'purchase-4',
    userId: 'user-1',
    creatorId: 'creator-1',
    itemId: 'product-1',
    itemType: 'product',
    amountUSD: 49.99,
    token: 'USDC',
    tokenAmount: 49.99,
    transactionHash: '0xabc...',
    createdAt: '2024-02-01T00:00:00Z',
    status: 'completed',
  },
  {
    id: 'purchase-5',
    userId: 'user-4',
    creatorId: 'creator-1',
    itemId: 'tip',
    itemType: 'tip',
    amountUSD: 20.00,
    token: 'ETH',
    tokenAmount: 0.008,
    transactionHash: '0xdef...',
    createdAt: '2024-02-05T00:00:00Z',
    status: 'pending',
  },
];

describe('MRR Calculation Functions', () => {
  describe('calculateMRR', () => {
    it('calculates MRR correctly from active subscriptions', () => {
      const mrr = calculateMRR(mockCreators, mockPurchases);
      
      // Expected: $10 (basic) + $25 (premium) + $5 (supporter) = $40
      expect(mrr).toBe(40.00);
    });

    it('returns 0 when no subscriptions exist', () => {
      const noSubPurchases = mockPurchases.filter(p => p.itemType !== 'subscription');
      const mrr = calculateMRR(mockCreators, noSubPurchases);
      
      expect(mrr).toBe(0);
    });

    it('ignores failed/pending subscriptions', () => {
      const purchasesWithFailed = [
        ...mockPurchases,
        {
          id: 'purchase-failed',
          userId: 'user-5',
          creatorId: 'creator-1',
          itemId: 'basic',
          itemType: 'subscription' as const,
          amountUSD: 10.00,
          token: 'USDC' as const,
          tokenAmount: 10.00,
          transactionHash: '0xfailed...',
          createdAt: '2024-02-10T00:00:00Z',
          status: 'failed' as const,
        },
      ];

      const mrr = calculateMRR(mockCreators, purchasesWithFailed);
      
      // Should still be $40, ignoring the failed purchase
      expect(mrr).toBe(40.00);
    });

    it('only includes monthly interval subscriptions', () => {
      const creatorsWithYearly = [
        ...mockCreators,
        {
          ...mockCreators[0],
          id: 'creator-3',
          subscriptionTiers: [
            {
              id: 'yearly',
              name: 'Yearly Tier',
              priceUSD: 120.00,
              interval: 'year' as const,
              features: ['Yearly feature'],
            },
          ],
        },
      ];

      const purchasesWithYearly = [
        ...mockPurchases,
        {
          id: 'purchase-yearly',
          userId: 'user-6',
          creatorId: 'creator-3',
          itemId: 'yearly',
          itemType: 'subscription' as const,
          amountUSD: 120.00,
          token: 'USDC' as const,
          tokenAmount: 120.00,
          transactionHash: '0xyearly...',
          createdAt: '2024-02-15T00:00:00Z',
          status: 'completed' as const,
        },
      ];

      const mrr = calculateMRR(creatorsWithYearly, purchasesWithYearly);
      
      // Should still be $40, ignoring the yearly subscription
      expect(mrr).toBe(40.00);
    });
  });

  describe('getActiveSubscribers', () => {
    it('counts unique active subscribers correctly', () => {
      const count = getActiveSubscribers(mockPurchases);
      
      // user-1, user-2, and user-3 have completed subscriptions
      expect(count).toBe(3);
    });

    it('returns 0 when no subscriptions exist', () => {
      const noSubPurchases = mockPurchases.filter(p => p.itemType !== 'subscription');
      const count = getActiveSubscribers(noSubPurchases);
      
      expect(count).toBe(0);
    });

    it('ignores failed/pending subscriptions', () => {
      const purchasesWithPending = [
        ...mockPurchases,
        {
          id: 'purchase-pending',
          userId: 'user-7',
          creatorId: 'creator-1',
          itemId: 'basic',
          itemType: 'subscription' as const,
          amountUSD: 10.00,
          token: 'USDC' as const,
          tokenAmount: 10.00,
          transactionHash: '0xpending...',
          createdAt: '2024-02-20T00:00:00Z',
          status: 'pending' as const,
        },
      ];

      const count = getActiveSubscribers(purchasesWithPending);
      
      // Should still be 3, ignoring the pending subscription
      expect(count).toBe(3);
    });
  });

  describe('getTotalEarnings', () => {
    it('calculates total earnings from all completed purchases', () => {
      const total = getTotalEarnings(mockPurchases);
      
      // Expected: $10 + $25 + $5 + $49.99 = $89.99 (excludes pending $20)
      expect(total).toBe(89.99);
    });

    it('returns 0 when no completed purchases exist', () => {
      const pendingOnly = mockPurchases.filter(p => p.status === 'pending');
      const total = getTotalEarnings(pendingOnly);
      
      expect(total).toBe(0);
    });

    it('includes all purchase types (subscriptions, products, tips)', () => {
      const completedPurchases = mockPurchases.filter(p => p.status === 'completed');
      const total = getTotalEarnings(completedPurchases);
      
      // Should include subscription ($40), product ($49.99), but not pending tip
      expect(total).toBe(89.99);
    });
  });
});