export interface Creator {
  id: string;
  handle: string;
  name: string;
  avatar: string;
  banner: string;
  bio: string;
  category: string;
  followers: number;
  isVerified: boolean;
  createdAt: string;
  socialLinks: {
    twitter?: string;
    discord?: string;
    youtube?: string;
    instagram?: string;
  };
  subscriptionTiers: SubscriptionTier[];
}

export interface SubscriptionTier {
  id: string;
  name: string;
  priceUSD: number;
  interval: 'month' | 'year';
  features: string[];
}

export interface Product {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  priceUSD: number;
  type: 'course' | 'ebook' | 'digital_art' | 'program';
  image: string;
  downloadUrl: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  creatorId: string;
  itemId: string;
  itemType: 'subscription' | 'product' | 'tip';
  amountUSD: number;
  token: 'MATIC' | 'ETH' | 'USDC';
  tokenAmount: number;
  transactionHash: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface MockRates {
  USD_TO_MATIC: number;
  USD_TO_ETH: number;
  USD_TO_USDC: number;
  lastUpdated: string;
}

export interface User {
  id: string;
  walletAddress: string;
  name: string;
  avatar: string;
  subscriptions: string[]; // tier IDs
  createdAt: string;
}

export interface DashboardStats {
  mrr: number;
  totalEarnings: number;
  activeSubscribers: number;
  recentTransactions: Purchase[];
}