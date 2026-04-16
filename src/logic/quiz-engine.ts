import { PokemonType, TYPE_CHART } from '../data/type-chart';
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
  ability?: string
): number => {
  let multiplier = 1;
  
  // Base type effectiveness
  for (const defender of defenderTypes) {
    multiplier *= (TYPE_CHART[attacker][defender] ?? 1);
  }

  // Ability modifiers
  if (ability) {
    const effects = ABILITY_MODIFIERS[ability.toLowerCase()];
    if (effects) {
      for (const effect of effects) {
        if (effect.type === attacker) {
          multiplier *= effect.multiplier;
        }
      }
    }

    // Wonder Guard special handling: Only super effective (> 1x) hits
    if (ability.toLowerCase() === 'wonder-guard') {
      if (multiplier <= 1) {
        multiplier = 0;
      }
    }
  }

  return multiplier;
};

export const getExplanation = (
  attacker: PokemonType, 
  defenderTypes: PokemonType[], 
  ability?: string
): string => {
  const multipliers = defenderTypes.map(def => ({
    type: def,
    value: TYPE_CHART[attacker][def] ?? 1
  }));

  const baseTotal = defenderTypes.reduce((acc, def) => acc * (TYPE_CHART[attacker][def] ?? 1), 1);
  let finalTotal = calculateEffectiveness(attacker, defenderTypes, ability);
  
  const parts = multipliers.map(m => `${m.value}x vs ${m.type}`);
  let resultText = '';
  if (finalTotal > 1) resultText = `Super Effective (${finalTotal}x)!`;
  else if (finalTotal === 1) resultText = `Neutral (1x).`;
  else if (finalTotal === 0) resultText = `No Effect (0x)!`;
  else resultText = `Not Very Effective (${finalTotal}x).`;

  let abilityNote = '';
  if (ability && baseTotal !== finalTotal) {
    abilityNote = ` (Adjusted by ${normalizeAbilityName(ability)})`;
  }

  return `${attacker} is ${parts.join(' and ')}. Final: ${resultText}${abilityNote}`;
};

export const generateQuestion = (difficulty: Difficulty): Question => {
  const allTypes = Object.values(PokemonType) as PokemonType[];
  
  let defenderTypes: PokemonType[] = [];
  if (difficulty === 'easy') {
    defenderTypes = [allTypes[Math.floor(Math.random() * allTypes.length)]];
  } else if (difficulty === 'dual') {
    const t1 = allTypes[Math.floor(Math.random() * allTypes.length)];
    let t2 = allTypes[Math.floor(Math.random() * allTypes.length)];
    while (t1 === t2) {
      t2 = allTypes[Math.floor(Math.random() * allTypes.length)];
    }
    defenderTypes = [t1, t2];
  } else if (difficulty === 'hard') {
    const isDual = Math.random() < 0.7;
    if (isDual) {
      const t1 = allTypes[Math.floor(Math.random() * allTypes.length)];
      let t2 = allTypes[Math.floor(Math.random() * allTypes.length)];
      while (t1 === t2) {
        t2 = allTypes[Math.floor(Math.random() * allTypes.length)];
      }
      defenderTypes = [t1, t2];
    } else {
      defenderTypes = [allTypes[Math.floor(Math.random() * allTypes.length)]];
    }
  }

  const superEffectiveTypes = allTypes.filter(t => calculateEffectiveness(t, defenderTypes) > 1);
  if (superEffectiveTypes.length === 0) return generateQuestion(difficulty);

  const correctAnswer = superEffectiveTypes[Math.floor(Math.random() * superEffectiveTypes.length)];
  const otherTypes = allTypes.filter(t => calculateEffectiveness(t, defenderTypes) <= 1);
  const shuffledWrong = otherTypes.sort(() => 0.5 - Math.random());
  const options = [correctAnswer, ...shuffledWrong.slice(0, 3)].sort(() => 0.5 - Math.random());

  return { defenderTypes, options, correctAnswer };
};
export const generateMoveQuestion = async (): Promise<MoveQuestion> => {
  const pokemon = await fetchRandomPokemon();

  const superEffectiveMoves = MOVES.filter(m => calculateEffectiveness(m.type, pokemon.types, pokemon.activeAbility) > 1);
  const neutralOrResistedMoves = MOVES.filter(m => calculateEffectiveness(m.type, pokemon.types, pokemon.activeAbility) <= 1);

  if (superEffectiveMoves.length === 0) return generateMoveQuestion();

  const correctAnswer = superEffectiveMoves[Math.floor(Math.random() * superEffectiveMoves.length)];
  const correctType = correctAnswer.type;

  // Pick 3 wrong moves with unique types (different from each other and the correct type)
  const wrongOptions: Move[] = [];
  const usedTypes = new Set<PokemonType>([correctType]);

  // Shuffle wrong moves to get randomness
  const shuffledWrongPool = [...neutralOrResistedMoves].sort(() => 0.5 - Math.random());

  for (const move of shuffledWrongPool) {
    if (!usedTypes.has(move.type)) {
      wrongOptions.push(move);
      usedTypes.add(move.type);
    }
    if (wrongOptions.length === 3) break;
  }

  // If we couldn't find enough unique wrong types (shouldn't happen with our move pool), retry
  if (wrongOptions.length < 3) return generateMoveQuestion();

  const options = [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random());

  return { pokemon, options, correctAnswer };
};
export const generateAbilityDescQuestion = (): AbilityDescQuestion => {
  const correctAbility = COMPETITIVE_ABILITIES[Math.floor(Math.random() * COMPETITIVE_ABILITIES.length)];
  const otherAbilities = COMPETITIVE_ABILITIES.filter(a => a.name !== correctAbility.name);
  
  const shuffledWrong = otherAbilities.sort(() => 0.5 - Math.random());
  const options = [correctAbility.name, ...shuffledWrong.slice(0, 3).map(a => a.name)].sort(() => 0.5 - Math.random());
  
  return {
    ability: correctAbility,
    options,
    correctAnswer: correctAbility.name
  };
};

export const generatePokemonAbilityQuestion = async (): Promise<PokemonAbilityQuestion> => {
  const pokemon = await fetchRandomPokemon();
  
  // Choose one of the pokemon's legal abilities
  const correctAnswer = pokemon.allAbilities[Math.floor(Math.random() * pokemon.allAbilities.length)];
  
  // Pick 3 abilities the pokemon DOES NOT have
  const wrongAbilities = COMPETITIVE_ABILITIES.filter(a => !pokemon.allAbilities.includes(a.name));
  
  const shuffledWrong = wrongAbilities.sort(() => 0.5 - Math.random());
  const options = [correctAnswer, ...shuffledWrong.slice(0, 3).map(a => a.name)].sort(() => 0.5 - Math.random());
  
  return {
    pokemon,
    options,
    correctAnswer
  };
};
