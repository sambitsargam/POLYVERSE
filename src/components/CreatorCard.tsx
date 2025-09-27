import Image from 'next/image';
import Link from 'next/link';
import { CheckBadgeIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { Creator } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

interface CreatorCardProps {
  creator: Creator;
}

export const CreatorCard = ({ creator }: CreatorCardProps) => {
  return (
    <Link 
      href={`/creator/${creator.handle}`}
      className="card hover:shadow-md transition-shadow duration-200 block"
    >
      {/* Banner */}
      <div className="relative w-full h-24 mb-4 rounded-lg overflow-hidden bg-gradient-to-r from-primary to-primary-light">
        <Image
          src={creator.banner}
          alt={`${creator.name} banner`}
          fill
          className="object-cover"
        />
      </div>

      {/* Avatar */}
      <div className="flex items-start space-x-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-sm">
          <Image
            src={creator.avatar}
            alt={creator.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {creator.name}
            </h3>
            {creator.isVerified && (
              <CheckBadgeIcon className="w-5 h-5 text-primary flex-shrink-0" />
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-2">@{creator.handle}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <UserGroupIcon className="w-4 h-4" />
              <span>{formatNumber(creator.followers)}</span>
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              {creator.category}
            </span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-gray-600 text-sm mt-4 line-clamp-2">
        {creator.bio}
      </p>

      {/* Subscription Tiers */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">Subscription tiers from:</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-primary">
            ${Math.min(...creator.subscriptionTiers.map(tier => tier.priceUSD))}/month
          </span>
          <span className="text-sm text-gray-500">
            {creator.subscriptionTiers.length} tier{creator.subscriptionTiers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  );
};