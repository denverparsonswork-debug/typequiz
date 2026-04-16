import { PokemonType } from '../data/type-chart';

export interface AbilityEffect {
  type: PokemonType;
  multiplier: number;
}

export const ABILITY_MODIFIERS: Record<string, AbilityEffect[]> = {
  'levitate': [{ type: PokemonType.Ground, multiplier: 0 }],
  'volt-absorb': [{ type: PokemonType.Electric, multiplier: 0 }],
  'lightning-rod': [{ type: PokemonType.Electric, multiplier: 0 }],
  'motor-drive': [{ type: PokemonType.Electric, multiplier: 0 }],
  'water-absorb': [{ type: PokemonType.Water, multiplier: 0 }],
  'dry-skin': [
    { type: PokemonType.Water, multiplier: 0 },
    { type: PokemonType.Fire, multiplier: 1.25 }
  ],
  'storm-drain': [{ type: PokemonType.Water, multiplier: 0 }],
  'flash-fire': [{ type: PokemonType.Fire, multiplier: 0 }],
  'well-baked-body': [{ type: PokemonType.Fire, multiplier: 0 }],
  'sap-sipper': [{ type: PokemonType.Grass, multiplier: 0 }],
  'earth-eater': [{ type: PokemonType.Ground, multiplier: 0 }],
  'thick-fat': [
    { type: PokemonType.Fire, multiplier: 0.5 },
    { type: PokemonType.Ice, multiplier: 0.5 }
  ],
  'heatproof': [{ type: PokemonType.Fire, multiplier: 0.5 }],
  'purifying-salt': [{ type: PokemonType.Ghost, multiplier: 0.5 }],
  'fluffy': [{ type: PokemonType.Fire, multiplier: 2 }],
  'bulletproof': [], // This is move-specific, maybe handle later
  'soundproof': [], // This is move-specific
  'wonder-guard': [], // Handled by special logic
};

export const normalizeAbilityName = (name: string): string => {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
