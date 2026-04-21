import { PokemonType, getTypeChart, getTypesForGen } from '../data/type-chart';
import { MOVES } from '../data/moves';
import type { Move } from '../data/moves';
import { fetchRandomPokemon } from './pokemon-api';
import type { PokemonData } from './pokemon-api';
import { ABILITY_MODIFIERS, normalizeAbilityName } from './ability-engine';
import { COMPETITIVE_ABILITIES } from '../data/abilities';
import type { AbilityInfo } from '../data/abilities';
import { COMPETITIVE_ITEMS } from '../data/items';
import type { ItemInfo } from '../data/items';

export type Difficulty = 'easy' | 'dual' | 'hard';

export interface Question {
  defenderTypes: PokemonType[];
  options: PokemonType[];
  correctAnswer: PokemonType;
}

export interface MoveQuestion {
  pokemon: PokemonData;
  options: Move[];
  correctAnswer: Move;
}

export interface AbilityDescQuestion {
  ability: AbilityInfo;
  options: string[];
  correctAnswer: string;
}

export interface PokemonAbilityQuestion {
  pokemon: PokemonData;
  options: string[];
  correctAnswer: string;
}

export interface TeraQuestion {
  attackerType: PokemonType;
  pokemon: PokemonData;
  options: PokemonType[];
  correctAnswer: PokemonType;
}

export interface CoverageQuestion {
  defender: PokemonData;
  currentMoves: Move[];
  options: Move[];
  correctAnswer: Move;
}

export interface SpeedQuestion {
  pokemonA: PokemonData;
  pokemonB: PokemonData;
  modifierA?: string;
  modifierB?: string;
  correctAnswer: 'A' | 'B';
}

export interface CommonThreatQuestion {
  team: PokemonData[];
  options: PokemonType[];
  correctAnswer: PokemonType;
}

export interface ItemQuestion {
  item: ItemInfo;
  options: string[];
  correctAnswer: string;
}

export const calculateEffectiveness = (
  attacker: PokemonType, 
  defenderTypes: PokemonType[], 
  gen: number = 9,
  ability?: string
): number => {
  let multiplier = 1;
  const chart = getTypeChart(gen);
  
  // Base type effectiveness
  for (const defender of defenderTypes) {
    multiplier *= (chart[attacker]?.[defender] ?? 1);
  }

  // Ability modifiers
  if (ability && ability !== 'none') {
    const effects = ABILITY_MODIFIERS[ability.toLowerCase()];
    if (effects) {
      for (const effect of effects) {
        if (effect.type === attacker) {
          multiplier *= effect.multiplier;
        }
      }
    }

    // Wonder Guard special handling
    if (ability.toLowerCase() === 'wonder-guard') {
      if (multiplier <= 1) multiplier = 0;
    }
  }

  return multiplier;
};

export const getExplanation = (
  attacker: PokemonType, 
  defenderTypes: PokemonType[], 
  gen: number = 9,
  ability?: string
): string => {
  const chart = getTypeChart(gen);
  const multipliers = defenderTypes.map(def => ({
    type: def,
    value: chart[attacker]?.[def] ?? 1
  }));

  const baseTotal = defenderTypes.reduce((acc, def) => acc * (chart[attacker]?.[def] ?? 1), 1);
  let finalTotal = calculateEffectiveness(attacker, defenderTypes, gen, ability);
  
  const parts = multipliers.map(m => `${m.value}x vs ${m.type}`);
  let resultText = '';
  if (finalTotal > 1) resultText = `Super Effective (${finalTotal}x)!`;
  else if (finalTotal === 1) resultText = `Neutral (1x).`;
  else if (finalTotal === 0) resultText = `No Effect (0x)!`;
  else resultText = `Not Very Effective (${finalTotal}x).`;

  let abilityNote = '';
  if (ability && ability !== 'none' && baseTotal !== finalTotal) {
    abilityNote = ` (Adjusted by ${normalizeAbilityName(ability)})`;
  }

  return `${attacker} is ${parts.join(' and ')}. Final: ${resultText}${abilityNote}`;
};

export const generateQuestion = (
  difficulty: Difficulty, 
  gen: number = 9,
  mode: 'effective' | 'resist' = 'effective'
): Question => {
  const allowedTypes = getTypesForGen(gen);
  
  let defenderTypes: PokemonType[] = [];
  if (difficulty === 'easy') {
    defenderTypes = [allowedTypes[Math.floor(Math.random() * allowedTypes.length)]];
  } else if (difficulty === 'dual') {
    const t1 = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    let t2 = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    while (t1 === t2) {
      t2 = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    }
    defenderTypes = [t1, t2];
  } else if (difficulty === 'hard') {
    const isDual = Math.random() < 0.7;
    if (isDual) {
      const t1 = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
      let t2 = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
      while (t1 === t2) t2 = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
      defenderTypes = [t1, t2];
    } else {
      defenderTypes = [allowedTypes[Math.floor(Math.random() * allowedTypes.length)]];
    }
  }

  let correctTypes: PokemonType[];
  let wrongTypes: PokemonType[];

  if (mode === 'resist') {
    correctTypes = allowedTypes.filter(t => calculateEffectiveness(t, defenderTypes, gen) < 1);
    wrongTypes = allowedTypes.filter(t => calculateEffectiveness(t, defenderTypes, gen) >= 1);
  } else {
    correctTypes = allowedTypes.filter(t => calculateEffectiveness(t, defenderTypes, gen) > 1);
    wrongTypes = allowedTypes.filter(t => calculateEffectiveness(t, defenderTypes, gen) <= 1);
  }

  if (correctTypes.length === 0) return generateQuestion(difficulty, gen, mode);

  const correctAnswer = correctTypes[Math.floor(Math.random() * correctTypes.length)];
  const shuffledWrong = wrongTypes.sort(() => 0.5 - Math.random());
  const options = [correctAnswer, ...shuffledWrong.slice(0, 3)].sort(() => 0.5 - Math.random());

  return { defenderTypes, options, correctAnswer };
};

export const generateMoveQuestion = async (
  gen: number = 9,
  mode: 'effective' | 'resist' = 'effective'
): Promise<MoveQuestion> => {
  const pokemon = await fetchRandomPokemon(gen);
  const allowedTypes = getTypesForGen(gen);
  
  // Filter moves to only those existing in the current generation's type set
  const allowedMoves = MOVES.filter(m => allowedTypes.includes(m.type));

  let correctMoves: Move[];
  let wrongMoves: Move[];

  if (mode === 'resist') {
    correctMoves = allowedMoves.filter(m => calculateEffectiveness(m.type, pokemon.types, gen, pokemon.activeAbility) < 1);
    wrongMoves = allowedMoves.filter(m => calculateEffectiveness(m.type, pokemon.types, gen, pokemon.activeAbility) >= 1);
  } else {
    correctMoves = allowedMoves.filter(m => calculateEffectiveness(m.type, pokemon.types, gen, pokemon.activeAbility) > 1);
    wrongMoves = allowedMoves.filter(m => calculateEffectiveness(m.type, pokemon.types, gen, pokemon.activeAbility) <= 1);
  }
  
  if (correctMoves.length === 0) return generateMoveQuestion(gen, mode);
  
  const correctAnswer = correctMoves[Math.floor(Math.random() * correctMoves.length)];
  const correctType = correctAnswer.type;
  
  const wrongOptions: Move[] = [];
  const usedTypes = new Set<PokemonType>([correctType]);
  const shuffledWrongPool = [...wrongMoves].sort(() => 0.5 - Math.random());
  
  for (const move of shuffledWrongPool) {
    if (!usedTypes.has(move.type)) {
      wrongOptions.push(move);
      usedTypes.add(move.type);
    }
    if (wrongOptions.length === 3) break;
  }
  
  if (wrongOptions.length < 3) return generateMoveQuestion(gen, mode);

  const options = [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random());
  
  return { pokemon, options, correctAnswer };
};

export const generateAbilityDescQuestion = (): AbilityDescQuestion => {
  const correctAbility = COMPETITIVE_ABILITIES[Math.floor(Math.random() * COMPETITIVE_ABILITIES.length)];
  const otherAbilities = COMPETITIVE_ABILITIES.filter(a => a.name !== correctAbility.name);
  const shuffledWrong = otherAbilities.sort(() => 0.5 - Math.random());
  const options = [correctAbility.name, ...shuffledWrong.slice(0, 3).map(a => a.name)].sort(() => 0.5 - Math.random());
  
  return { ability: correctAbility, options, correctAnswer: correctAbility.name };
};

export const generatePokemonAbilityQuestion = async (gen: number = 9): Promise<PokemonAbilityQuestion> => {
  // Abilities don't exist in Gen 1-2, so force higher gen or handled by component
  const effectiveGen = gen < 3 ? 9 : gen;
  const pokemon = await fetchRandomPokemon(effectiveGen);
  
  const correctAnswer = pokemon.allAbilities[Math.floor(Math.random() * pokemon.allAbilities.length)];
  const wrongAbilities = COMPETITIVE_ABILITIES.filter(a => !pokemon.allAbilities.includes(a.name));
  const shuffledWrong = wrongAbilities.sort(() => 0.5 - Math.random());
  const options = [correctAnswer, ...shuffledWrong.slice(0, 3).map(a => a.name)].sort(() => 0.5 - Math.random());
  
  return { pokemon, options, correctAnswer };
};

export const generateTeraQuestion = async (gen: number = 9): Promise<TeraQuestion> => {
  const pokemon = await fetchRandomPokemon(gen);
  const allowedTypes = getTypesForGen(gen);
  
  // Pick a random attacker type that is currently super effective against this pokemon
  const superEffectiveAttackerTypes = allowedTypes.filter(t => 
    calculateEffectiveness(t, pokemon.types, gen, pokemon.activeAbility) > 1
  );
  
  const attackerType = superEffectiveAttackerTypes.length > 0 
    ? superEffectiveAttackerTypes[Math.floor(Math.random() * superEffectiveAttackerTypes.length)]
    : allowedTypes[Math.floor(Math.random() * allowedTypes.length)];

  // Find the BEST defensive Tera type (minimizes damage)
  // Sort types by effectiveness (lowest multiplier first)
  const sortedByEffectiveness = [...allowedTypes].sort((a, b) => {
    const effA = calculateEffectiveness(attackerType, [a], gen, pokemon.activeAbility);
    const effB = calculateEffectiveness(attackerType, [b], gen, pokemon.activeAbility);
    return effA - effB;
  });

  const bestMultiplier = calculateEffectiveness(attackerType, [sortedByEffectiveness[0]], gen, pokemon.activeAbility);
  const bestTypes = sortedByEffectiveness.filter(t => 
    calculateEffectiveness(attackerType, [t], gen, pokemon.activeAbility) === bestMultiplier
  );
  
  const correctAnswer = bestTypes[Math.floor(Math.random() * bestTypes.length)];
  
  // Wrong options: Types that are neutral or worse (multiplier >= 1) 
  // or at least worse than the correct answer
  const wrongTypes = allowedTypes.filter(t => 
    calculateEffectiveness(attackerType, [t], gen, pokemon.activeAbility) > bestMultiplier
  );
  
  const shuffledWrong = wrongTypes.sort(() => 0.5 - Math.random());
  const options = [correctAnswer, ...shuffledWrong.slice(0, 3)].sort(() => 0.5 - Math.random());
  
  return { attackerType, pokemon, options, correctAnswer };
};

export const generateCoverageQuestion = async (gen: number = 9): Promise<CoverageQuestion> => {
  const defender = await fetchRandomPokemon(gen);
  const allowedTypes = getTypesForGen(gen);
  const allowedMoves = MOVES.filter(m => allowedTypes.includes(m.type));

  // Current moves should NOT be super effective
  const neutralOrResistedMoves = allowedMoves.filter(m => 
    calculateEffectiveness(m.type, defender.types, gen, defender.activeAbility) <= 1
  );
  
  // Randomly pick 3 distinct types for current moves
  const currentMoves: Move[] = [];
  const usedTypes = new Set<PokemonType>();
  const shuffledNeutral = [...neutralOrResistedMoves].sort(() => 0.5 - Math.random());
  
  for (const move of shuffledNeutral) {
    if (!usedTypes.has(move.type)) {
      currentMoves.push(move);
      usedTypes.add(move.type);
    }
    if (currentMoves.length === 3) break;
  }

  // Correct Answer: A move that IS super effective
  const superEffectiveMoves = allowedMoves.filter(m => 
    calculateEffectiveness(m.type, defender.types, gen, defender.activeAbility) > 1 &&
    !usedTypes.has(m.type)
  );
  
  if (superEffectiveMoves.length === 0 || currentMoves.length < 3) return generateCoverageQuestion(gen);
  
  const correctAnswer = superEffectiveMoves[Math.floor(Math.random() * superEffectiveMoves.length)];
  
  // Wrong Options: Other moves that are NOT super effective
  const wrongMoves = allowedMoves.filter(m => 
    calculateEffectiveness(m.type, defender.types, gen, defender.activeAbility) <= 1 &&
    !usedTypes.has(m.type)
  );
  
  const wrongOptions: Move[] = [];
  const wrongTypes = new Set<PokemonType>();
  const shuffledWrong = [...wrongMoves].sort(() => 0.5 - Math.random());
  
  for (const move of shuffledWrong) {
    if (!wrongTypes.has(move.type)) {
      wrongOptions.push(move);
      wrongTypes.add(move.type);
    }
    if (wrongOptions.length === 3) break;
  }
  
  if (wrongOptions.length < 3) return generateCoverageQuestion(gen);

  const options = [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random());

  return { defender, currentMoves, options, correctAnswer };
};

export const generateSpeedQuestion = async (gen: number = 9, difficulty: string = 'standard'): Promise<SpeedQuestion> => {
  const pokemonA = await fetchRandomPokemon(gen);
  const pokemonB = await fetchRandomPokemon(gen);
  
  if (pokemonA.name === pokemonB.name) return generateSpeedQuestion(gen, difficulty);
  
  let speedA = pokemonA.speed;
  let speedB = pokemonB.speed;
  let modifierA: string | undefined;
  let modifierB: string | undefined;

  if (difficulty === 'hard') {
    // Add Scarf or Tailwind modifiers randomly
    if (Math.random() < 0.3) {
      speedA *= 1.5;
      modifierA = 'Choice Scarf';
    } else if (Math.random() < 0.2) {
      speedA *= 2;
      modifierA = 'Tailwind';
    }

    if (Math.random() < 0.3) {
      speedB *= 1.5;
      modifierB = 'Choice Scarf';
    } else if (Math.random() < 0.2) {
      speedB *= 2;
      modifierB = 'Tailwind';
    }
  }

  // Avoid identical speeds to keep it fair
  if (Math.floor(speedA) === Math.floor(speedB)) return generateSpeedQuestion(gen, difficulty);

  return {
    pokemonA,
    pokemonB,
    modifierA,
    modifierB,
    correctAnswer: speedA > speedB ? 'A' : 'B'
  };
};

export const generateCommonThreatQuestion = async (gen: number = 9): Promise<CommonThreatQuestion> => {
  const p1 = await fetchRandomPokemon(gen);
  const p2 = await fetchRandomPokemon(gen);
  const p3 = await fetchRandomPokemon(gen);
  const team = [p1, p2, p3];
  
  const allowedTypes = getTypesForGen(gen);
  
  // Find types that are super effective (> 1) against ALL members of the team
  const sharedWeaknesses = allowedTypes.filter(attackerType => 
    team.every(defender => calculateEffectiveness(attackerType, defender.types, gen, defender.activeAbility) > 1)
  );

  if (sharedWeaknesses.length === 0) return generateCommonThreatQuestion(gen);

  const correctAnswer = sharedWeaknesses[Math.floor(Math.random() * sharedWeaknesses.length)];
  
  // Find types that are NOT super effective against at least one member
  const wrongTypes = allowedTypes.filter(t => !sharedWeaknesses.includes(t));
  const shuffledWrong = wrongTypes.sort(() => 0.5 - Math.random());
  const options = [correctAnswer, ...shuffledWrong.slice(0, 3)].sort(() => 0.5 - Math.random());

  return { team, options, correctAnswer };
};

export const generateItemQuestion = (): ItemQuestion => {
  const correctItem = COMPETITIVE_ITEMS[Math.floor(Math.random() * COMPETITIVE_ITEMS.length)];
  const otherItems = COMPETITIVE_ITEMS.filter(i => i.name !== correctItem.name);
  const shuffledWrong = otherItems.sort(() => 0.5 - Math.random());
  const options = [correctItem.name, ...shuffledWrong.slice(0, 3).map(i => i.name)].sort(() => 0.5 - Math.random());
  
  return { item: correctItem, options, correctAnswer: correctItem.name };
};