import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onPurchase: (product: Product) => void;
}

export const ProductCard = ({ product, onPurchase }: ProductCardProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-blue-100 text-blue-800';
      case 'ebook':
        return 'bg-green-100 text-green-800';
      case 'digital_art':
        return 'bg-purple-100 text-purple-800';
      case 'program':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'course':
        return 'Course';
      case 'ebook':
        return 'eBook';
      case 'digital_art':
        return 'Digital Art';
      case 'program':
        return 'Program';
      default:
        return type;
    }
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      {/* Product Image */}
      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(product.type)}`}>
            {getTypeLabel(product.type)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {product.title}
        </h3>

        <p className="text-gray-600 text-sm line-clamp-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(product.priceUSD)}
          </span>
          
          <button
            onClick={() => onPurchase(product)}
            className="btn-primary"
          >
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
};