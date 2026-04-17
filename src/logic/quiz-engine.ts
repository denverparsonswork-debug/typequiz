import { PokemonType, getTypeChart, getTypesForGen } from '../data/type-chart';
import { MOVES } from '../data/moves';
import type { Move } from '../data/moves';
import { fetchRandomPokemon } from './pokemon-api';
import type { PokemonData } from './pokemon-api';
import { ABILITY_MODIFIERS, normalizeAbilityName } from './ability-engine';
import { COMPETITIVE_ABILITIES } from '../data/abilities';
import type { AbilityInfo } from '../data/abilities';

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

export const generateQuestion = (difficulty: Difficulty, gen: number = 9): Question => {
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

  const superEffectiveTypes = allowedTypes.filter(t => calculateEffectiveness(t, defenderTypes, gen) > 1);
  if (superEffectiveTypes.length === 0) return generateQuestion(difficulty, gen);

  const correctAnswer = superEffectiveTypes[Math.floor(Math.random() * superEffectiveTypes.length)];
  const otherTypes = allowedTypes.filter(t => calculateEffectiveness(t, defenderTypes, gen) <= 1);
  const shuffledWrong = otherTypes.sort(() => 0.5 - Math.random());
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