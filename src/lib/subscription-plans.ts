// Subscription Plans Configuration (can be used on both client and server)

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // in USD
  duration: number; // in seconds
  features: string[];
  network: 'polygon' | 'polygon-amoy';
  isPopular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic-weekly',
    name: 'Basic Weekly',
    description: 'Perfect for trying out premium content',
    price: 5.00,
    duration: 7 * 24 * 60 * 60, // 7 days
    features: [
      'Access to premium content',
      'Weekly content updates',
      'Community access',
      'Basic support'
    ],
    network: 'polygon-amoy'
  },
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    description: 'For regular consumers of quality content',
    price: 15.00,
    duration: 30 * 24 * 60 * 60, // 30 days
    features: [
      'All Basic features',
      'Exclusive pro content',
      'Early access to new releases',
      'Priority support',
      'Download privileges'
    ],
    network: 'polygon-amoy',
    isPopular: true
  },
  {
    id: 'premium-yearly',
    name: 'Premium Yearly',
    description: 'Best value for power users',
    price: 120.00,
    duration: 365 * 24 * 60 * 60, // 365 days
    features: [
      'All Pro features',
      'Unlimited downloads',
      'Personal consultations',
      'Custom requests',
      '24/7 VIP support',
      'Exclusive events access'
    ],
    network: 'polygon-amoy'
  }
];