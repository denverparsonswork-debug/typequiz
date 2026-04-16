import { PokemonType } from '../data/type-chart';
import { normalizeAbilityName } from './ability-engine';

export interface PokemonData {
  name: string;
  types: PokemonType[];
  sprite: string;
  activeAbility: string;
  allAbilities: string[]; // Normalized names
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

export const fetchRandomPokemon = async (): Promise<PokemonData> => {
  const randomId = Math.floor(Math.random() * 1010) + 1;
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
  if (!response.ok) throw new Error('Failed to fetch Pokemon');
  
  const data = await response.json();
  
  // Normalized ability names
  const allAbilities = data.abilities.map((a: any) => normalizeAbilityName(a.ability.name));
  const activeAbility = data.abilities[Math.floor(Math.random() * data.abilities.length)].ability.name;
  
  return {
    name: data.name.toUpperCase(),
    types: data.types.map((t: any) => TYPE_MAP[t.type.name]),
    sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
    activeAbility,
    allAbilities,
  };
};
