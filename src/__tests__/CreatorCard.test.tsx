import { render, screen } from '@testing-library/react';
import { CreatorCard } from '@/components/CreatorCard';
import { Creator } from '@/lib/types';

const mockCreator: Creator = {
  id: 'test-creator',
  handle: 'testcreator',
  name: 'Test Creator',
  avatar: 'https://example.com/avatar.jpg',
  banner: 'https://example.com/banner.jpg',
  bio: 'This is a test creator bio',
  category: 'Technology',
  followers: 1500,
  isVerified: true,
  createdAt: '2023-01-01T00:00:00Z',
  socialLinks: {
    twitter: '@testcreator',
  },
  subscriptionTiers: [
    {
      id: 'basic',
      name: 'Basic Tier',
      priceUSD: 9.99,
      interval: 'month',
      features: ['Feature 1', 'Feature 2'],
    },
    {
      id: 'premium',
      name: 'Premium Tier',
      priceUSD: 19.99,
      interval: 'month',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
    },
  ],
};

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('CreatorCard', () => {
  it('renders creator information correctly', () => {
    render(<CreatorCard creator={mockCreator} />);
    
    expect(screen.getByText('Test Creator')).toBeInTheDocument();
    expect(screen.getByText('@testcreator')).toBeInTheDocument();
    expect(screen.getByText('This is a test creator bio')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('displays follower count in formatted number', () => {
    render(<CreatorCard creator={mockCreator} />);
    
    expect(screen.getByText('1.5K')).toBeInTheDocument();
  });

  it('shows subscription tier pricing', () => {
    render(<CreatorCard creator={mockCreator} />);
    
    // Should show the minimum tier price
    expect(screen.getByText('$9.99/month')).toBeInTheDocument();
    expect(screen.getByText('2 tiers')).toBeInTheDocument();
  });

  it('displays verification badge for verified creators', () => {
    render(<CreatorCard creator={mockCreator} />);
    
    // Check for verification icon (using accessible name or test id)
    const verificationIcon = document.querySelector('[data-testid="verification-icon"]') ||
                            document.querySelector('svg[class*="CheckBadgeIcon"]');
    expect(verificationIcon).toBeInTheDocument();
  });

  it('creates correct link to creator profile', () => {
    render(<CreatorCard creator={mockCreator} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/creator/testcreator');
  });
});