import { SubscriptionTier } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { CheckIcon } from '@heroicons/react/24/outline';

interface TierCardProps {
  tier: SubscriptionTier;
  onSubscribe: (tier: SubscriptionTier) => void;
  isPopular?: boolean;
}

export const TierCard = ({ tier, onSubscribe, isPopular = false }: TierCardProps) => {
  return (
    <div className={`
      card relative overflow-hidden
      ${isPopular ? 'ring-2 ring-primary border-primary' : ''}
    `}>
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-2 text-sm font-medium">
          Most Popular
        </div>
      )}
      
      <div className={isPopular ? 'pt-8' : ''}>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
          <div className="mb-4">
            <span className="text-4xl font-bold text-primary">
              {formatCurrency(tier.priceUSD)}
            </span>
            <span className="text-gray-500 ml-1">/{tier.interval}</span>
          </div>
        </div>

        <ul className="space-y-3 mb-6">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => onSubscribe(tier)}
          className={`w-full ${isPopular ? 'btn-primary' : 'btn-secondary'}`}
        >
          Subscribe
        </button>
      </div>
    </div>
  );
};