import { Creator, Product, Purchase, MockRates } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const calculateTokenAmount = (usdAmount: number, token: 'MATIC' | 'ETH' | 'USDC', rates: MockRates): number => {
  switch (token) {
    case 'MATIC':
      return usdAmount * rates.USD_TO_MATIC;
    case 'ETH':
      return usdAmount * rates.USD_TO_ETH;
    case 'USDC':
      return usdAmount * rates.USD_TO_USDC;
    default:
      return usdAmount;
  }
};

export const formatTokenAmount = (amount: number, token: string): string => {
  const decimals = token === 'ETH' ? 6 : 2;
  return `${amount.toFixed(decimals)} ${token}`;
};

export const generateMockTransactionHash = (): string => {
  return '0x' + Math.random().toString(16).substr(2, 64);
};

export const calculateMRR = (creators: Creator[], purchases: Purchase[]): number => {
  // Calculate Monthly Recurring Revenue from active subscriptions
  const activeSubscriptions = purchases.filter(
    p => p.itemType === 'subscription' && p.status === 'completed'
  );
  
  return activeSubscriptions.reduce((total, purchase) => {
    const creator = creators.find(c => c.id === purchase.creatorId);
    if (!creator) return total;
    
    const tier = creator.subscriptionTiers.find(t => t.id === purchase.itemId);
    if (!tier || tier.interval !== 'month') return total;
    
    return total + tier.priceUSD;
  }, 0);
};

export const getActiveSubscribers = (purchases: Purchase[]): number => {
  const uniqueSubscribers = new Set(
    purchases
      .filter(p => p.itemType === 'subscription' && p.status === 'completed')
      .map(p => p.userId)
  );
  return uniqueSubscribers.size;
};

export const getTotalEarnings = (purchases: Purchase[]): number => {
  return purchases
    .filter(p => p.status === 'completed')
    .reduce((total, purchase) => total + purchase.amountUSD, 0);
};