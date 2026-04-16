import React from 'react';
import type { PokemonType } from '../data/type-chart';
import { TYPE_COLORS } from '../data/type-chart';

interface TypeBadgeProps {
  type: PokemonType;
  large?: boolean;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type, large = false }) => {
  return (
    <div
      className={`
        ${large ? 'w-28 sm:w-40 py-2 sm:py-3 text-sm sm:text-xl' : 'w-24 sm:w-36 py-1 sm:py-2 text-[10px] sm:text-base'}
        rounded-full font-bold text-white shadow-md inline-flex items-center justify-center
        transition-all duration-200 uppercase tracking-wider text-center
      `}
      style={{
        backgroundColor: TYPE_COLORS[type],
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
      }}
    >
      {type}
    </div>
  );
};

export default TypeBadge;
