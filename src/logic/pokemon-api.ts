import { PokemonType } from '../data/type-chart';
import { normalizeAbilityName } from './ability-engine';

export interface PokemonData {
  name: string;
  types: PokemonType[];
  sprite: string;
  activeAbility: string;
  allAbilities: string[]; // Normalized names
  speed: number;
}

const TYPE_MAP: Record<string, PokemonType> = {
  normal: PokemonType.Normal,
  fire: PokemonType.Fire,
  water: PokemonType.Water,
  electric: PokemonType.Electric,
  grass: PokemonType.Grass,
  ice: PokemonType.Ice,
  fighting: PokemonType.Fighting,
  poison: PokemonType.Poison,
  ground: PokemonType.Ground,
  flying: PokemonType.Flying,
  psychic: PokemonType.Psychic,
  bug: PokemonType.Bug,
  rock: PokemonType.Rock,
  ghost: PokemonType.Ghost,
  dragon: PokemonType.Dragon,
  dark: PokemonType.Dark,
  steel: PokemonType.Steel,
  fairy: PokemonType.Fairy,
};

const GEN_ID_RANGES: Record<number, number> = {
  1: 151,
  2: 251,
  3: 386,
  4: 493,
  5: 649,
  6: 721,
  7: 809,
  8: 905,
  9: 1025
};

export const fetchRandomPokemon = async (gen: number = 9): Promise<PokemonData> => {
  const maxId = GEN_ID_RANGES[gen] || 1025;
  const randomId = Math.floor(Math.random() * maxId) + 1;
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
  if (!response.ok) throw new Error('Failed to fetch Pokemon');
  
  const data = await response.json();
  
  // Normalized ability names (Abilities didn't exist in Gen 1-2)
  const allAbilities = gen > 2 
    ? data.abilities.map((a: any) => normalizeAbilityName(a.ability.name))
    : ['No Ability'];
    
  const activeAbility = gen > 2
    ? data.abilities[Math.floor(Math.random() * data.abilities.length)].ability.name
    : 'none';
  
  const speedStat = data.stats.find((s: any) => s.stat.name === 'speed');
  const speed = speedStat ? speedStat.base_stat : 100;

  return {
    name: data.name.toUpperCase(),
    types: data.types.map((t: any) => TYPE_MAP[t.type.name]),
    sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
    activeAbility,
    allAbilities,
    speed,
  };
};
