export const PokemonType = {
  Normal: 'Normal',
  Fire: 'Fire',
  Water: 'Water',
  Electric: 'Electric',
  Grass: 'Grass',
  Ice: 'Ice',
  Fighting: 'Fighting',
  Poison: 'Poison',
  Ground: 'Ground',
  Flying: 'Flying',
  Psychic: 'Psychic',
  Bug: 'Bug',
  Rock: 'Rock',
  Ghost: 'Ghost',
  Dragon: 'Dragon',
  Dark: 'Dark',
  Steel: 'Steel',
  Fairy: 'Fairy',
} as const;

export type PokemonType = (typeof PokemonType)[keyof typeof PokemonType];

export const TYPE_COLORS: Record<PokemonType, string> = {
  [PokemonType.Normal]: '#A8A878',
  [PokemonType.Fire]: '#F08030',
  [PokemonType.Water]: '#6890F0',
  [PokemonType.Electric]: '#F8D030',
  [PokemonType.Grass]: '#7AC74C',
  [PokemonType.Ice]: '#98D8D8',
  [PokemonType.Fighting]: '#C03028',
  [PokemonType.Poison]: '#A040A0',
  [PokemonType.Ground]: '#E0C068',
  [PokemonType.Flying]: '#A890F0',
  [PokemonType.Psychic]: '#F85888',
  [PokemonType.Bug]: '#A8B820',
  [PokemonType.Rock]: '#B8A038',
  [PokemonType.Ghost]: '#705898',
  [PokemonType.Dragon]: '#7038F8',
  [PokemonType.Dark]: '#705848',
  [PokemonType.Steel]: '#B8B8D0',
  [PokemonType.Fairy]: '#EE99AC',
};

// Base Matrix (Gen 6-9)
const MODERN_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  [PokemonType.Normal]: { [PokemonType.Rock]: 0.5, [PokemonType.Ghost]: 0, [PokemonType.Steel]: 0.5 },
  [PokemonType.Fire]: { [PokemonType.Fire]: 0.5, [PokemonType.Water]: 0.5, [PokemonType.Grass]: 2, [PokemonType.Ice]: 2, [PokemonType.Bug]: 2, [PokemonType.Rock]: 0.5, [PokemonType.Dragon]: 0.5, [PokemonType.Steel]: 2 },
  [PokemonType.Water]: { [PokemonType.Fire]: 2, [PokemonType.Water]: 0.5, [PokemonType.Grass]: 0.5, [PokemonType.Ground]: 2, [PokemonType.Rock]: 2, [PokemonType.Dragon]: 0.5 },
  [PokemonType.Electric]: { [PokemonType.Water]: 2, [PokemonType.Electric]: 0.5, [PokemonType.Grass]: 0.5, [PokemonType.Ground]: 0, [PokemonType.Flying]: 2, [PokemonType.Dragon]: 0.5 },
  [PokemonType.Grass]: { [PokemonType.Fire]: 0.5, [PokemonType.Water]: 2, [PokemonType.Grass]: 0.5, [PokemonType.Poison]: 0.5, [PokemonType.Ground]: 2, [PokemonType.Flying]: 0.5, [PokemonType.Bug]: 0.5, [PokemonType.Rock]: 2, [PokemonType.Dragon]: 0.5, [PokemonType.Steel]: 0.5 },
  [PokemonType.Ice]: { [PokemonType.Fire]: 0.5, [PokemonType.Water]: 0.5, [PokemonType.Grass]: 2, [PokemonType.Ice]: 0.5, [PokemonType.Ground]: 2, [PokemonType.Flying]: 2, [PokemonType.Dragon]: 2, [PokemonType.Steel]: 0.5 },
  [PokemonType.Fighting]: { [PokemonType.Normal]: 2, [PokemonType.Ice]: 2, [PokemonType.Poison]: 0.5, [PokemonType.Flying]: 0.5, [PokemonType.Psychic]: 0.5, [PokemonType.Bug]: 0.5, [PokemonType.Rock]: 2, [PokemonType.Ghost]: 0, [PokemonType.Dark]: 2, [PokemonType.Steel]: 2, [PokemonType.Fairy]: 0.5 },
  [PokemonType.Poison]: { [PokemonType.Grass]: 2, [PokemonType.Poison]: 0.5, [PokemonType.Ground]: 0.5, [PokemonType.Rock]: 0.5, [PokemonType.Ghost]: 0.5, [PokemonType.Steel]: 0, [PokemonType.Fairy]: 2 },
  [PokemonType.Ground]: { [PokemonType.Fire]: 2, [PokemonType.Electric]: 2, [PokemonType.Grass]: 0.5, [PokemonType.Poison]: 2, [PokemonType.Flying]: 0, [PokemonType.Bug]: 0.5, [PokemonType.Rock]: 2, [PokemonType.Steel]: 2 },
  [PokemonType.Flying]: { [PokemonType.Electric]: 0.5, [PokemonType.Grass]: 2, [PokemonType.Fighting]: 2, [PokemonType.Bug]: 2, [PokemonType.Rock]: 0.5, [PokemonType.Steel]: 0.5 },
  [PokemonType.Psychic]: { [PokemonType.Fighting]: 2, [PokemonType.Poison]: 2, [PokemonType.Psychic]: 0.5, [PokemonType.Dark]: 0, [PokemonType.Steel]: 0.5 },
  [PokemonType.Bug]: { [PokemonType.Fire]: 0.5, [PokemonType.Grass]: 2, [PokemonType.Fighting]: 0.5, [PokemonType.Poison]: 0.5, [PokemonType.Flying]: 0.5, [PokemonType.Psychic]: 2, [PokemonType.Ghost]: 0.5, [PokemonType.Dark]: 2, [PokemonType.Steel]: 0.5, [PokemonType.Fairy]: 0.5 },
  [PokemonType.Rock]: { [PokemonType.Fire]: 2, [PokemonType.Ice]: 2, [PokemonType.Fighting]: 0.5, [PokemonType.Ground]: 0.5, [PokemonType.Flying]: 2, [PokemonType.Bug]: 2, [PokemonType.Steel]: 0.5 },
  [PokemonType.Ghost]: { [PokemonType.Normal]: 0, [PokemonType.Psychic]: 2, [PokemonType.Ghost]: 2, [PokemonType.Dark]: 0.5, [PokemonType.Steel]: 0.5 },
  [PokemonType.Dragon]: { [PokemonType.Dragon]: 2, [PokemonType.Steel]: 0.5, [PokemonType.Fairy]: 0 },
  [PokemonType.Dark]: { [PokemonType.Fighting]: 0.5, [PokemonType.Psychic]: 2, [PokemonType.Ghost]: 2, [PokemonType.Dark]: 0.5, [PokemonType.Fairy]: 0.5 },
  [PokemonType.Steel]: { [PokemonType.Fire]: 0.5, [PokemonType.Water]: 0.5, [PokemonType.Electric]: 0.5, [PokemonType.Ice]: 2, [PokemonType.Rock]: 2, [PokemonType.Steel]: 0.5, [PokemonType.Fairy]: 2 },
  [PokemonType.Fairy]: { [PokemonType.Fire]: 0.5, [PokemonType.Fighting]: 2, [PokemonType.Poison]: 0.5, [PokemonType.Dragon]: 2, [PokemonType.Dark]: 2, [PokemonType.Steel]: 0.5 },
};

export const getTypeChart = (gen: number): Record<PokemonType, Partial<Record<PokemonType, number>>> => {
  if (gen >= 6) return MODERN_CHART;

  // Deep clone modern chart to modify it
  const chart: Record<PokemonType, Partial<Record<PokemonType, number>>> = JSON.parse(JSON.stringify(MODERN_CHART));

  // Pre-Gen 6 (Gens 2-5): Steel resisted Ghost and Dark
  if (gen >= 2 && gen <= 5) {
    chart[PokemonType.Ghost][PokemonType.Steel] = 0.5;
    chart[PokemonType.Dark][PokemonType.Steel] = 0.5;
  }

  // Gen 1: Pure chaos
  if (gen === 1) {
    // 1. Ghost moves have no effect on Psychic
    chart[PokemonType.Ghost][PokemonType.Psychic] = 0;
    // 2. Ice is neutral (1x) vs Fire
    chart[PokemonType.Ice][PokemonType.Fire] = 1;
    // 3. Bug is 2x vs Poison
    chart[PokemonType.Bug][PokemonType.Poison] = 2;
    // 4. Poison is 2x vs Bug
    chart[PokemonType.Poison][PokemonType.Bug] = 2;
    
    // Cleanup: Remove types that didn't exist in Gen 1
    const removeTypes = [PokemonType.Steel, PokemonType.Dark, PokemonType.Fairy];
    for (const attacker of Object.values(PokemonType)) {
      for (const defender of removeTypes) {
        if (chart[attacker]) delete chart[attacker][defender];
      }
      if ((removeTypes as PokemonType[]).includes(attacker)) {
        delete chart[attacker];
      }
    }
  }

  // General Pre-Gen 6: Fairy didn't exist
  if (gen < 6) {
    const removeTypes = [PokemonType.Fairy];
    for (const attacker of Object.values(PokemonType)) {
      for (const defender of removeTypes) {
        if (chart[attacker]) delete chart[attacker][defender];
      }
      if ((removeTypes as PokemonType[]).includes(attacker)) {
        delete chart[attacker];
      }
    }
  }

  return chart;
};

export const getTypesForGen = (gen: number): PokemonType[] => {
  const all = Object.values(PokemonType) as PokemonType[];
  if (gen >= 6) return all;
  if (gen >= 2) return all.filter(t => t !== PokemonType.Fairy);
  return all.filter(t => !( [PokemonType.Steel, PokemonType.Dark, PokemonType.Fairy] as PokemonType[]).includes(t));
};
