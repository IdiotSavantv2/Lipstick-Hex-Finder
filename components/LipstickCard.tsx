
import React from 'react';
import { LipstickProduct } from '../types';

interface LipstickCardProps {
  product: LipstickProduct;
  color: string;
}

const LipstickCard: React.FC<LipstickCardProps> = ({ product, color }) => {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg transform transition-all hover:scale-105 hover:shadow-pink-500/20">
      <div className="flex items-center p-4">
        <div 
          className="w-12 h-12 rounded-full mr-4 border-2 border-gray-600"
          style={{ backgroundColor: color }}
        />
        <div className="flex-grow">
          <p className="font-bold text-lg text-white truncate">{product.shadeName}</p>
          <p className="text-gray-400 text-sm">{product.brand}</p>
        </div>
      </div>
    </div>
  );
};

export default LipstickCard;
