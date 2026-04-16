import React, { useState, useEffect, useCallback } from 'react';
import { generatePokemonAbilityQuestion } from '../logic/quiz-engine';
import type { PokemonAbilityQuestion } from '../logic/quiz-engine';

interface PokemonAbilityQuizProps {
  onReset: () => void;
}

const PokemonAbilityQuiz: React.FC<PokemonAbilityQuizProps> = ({ onReset }) => {
  const [question, setQuestion] = useState<PokemonAbilityQuestion | null>(null);
  const [streak, setStreak] = useState(0);
  const highScoreKey = 'highScore_pokemon_ability';
  const [highScore, setHighScore] = useState(Number(localStorage.getItem(highScoreKey) || '0'));
  const [lives, setLives] = useState(3);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const nextQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const q = await generatePokemonAbilityQuestion();
      setQuestion(q);
      setExplanation(null);
      setSelectedOptions([]);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    nextQuestion();
  }, []);

  const handleGuess = (option: string) => {
    if (explanation || gameOver || selectedOptions.includes(option) || loading) return;

    const isCorrect = option === question!.correctAnswer;
    setSelectedOptions(prev => [...prev, option]);

    if (isCorrect) {
      setExplanation(`Correct! ${question!.pokemon.name} can have ${option}.`);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > highScore) {
        setHighScore(newStreak);
        localStorage.setItem(highScoreKey, newStreak.toString());
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setExplanation(`Wrong. ${question!.pokemon.name} cannot have ${option}. Legal abilities: ${question!.pokemon.allAbilities.join(', ')}.`);
      setStreak(0);
      if (newLives <= 0) {
        setGameOver(true);
      }
    }
  };

  const handleContinue = () => {
    if (gameOver) return;
    nextQuestion();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && explanation && !gameOver) {
        e.preventDefault();
        handleContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [explanation, gameOver, handleContinue]);

  const restartGame = () => {
    setLives(3);
    setStreak(0);
    setGameOver(false);
    nextQuestion();
  };

  if (loading && !question) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 animate-pulse font-bold tracking-widest uppercase">Analyzing Pokémon Data...</p>
      </div>
    );
  }

  if (!question) return <div className="text-red-500">Error loading question. Please try again.</div>;

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-6 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4 gap-2">
        <div className="text-left min-w-[60px]">
          <p className="text-gray-400 text-[10px] sm:text-xs uppercase">Streak</p>
          <p className="text-xl sm:text-3xl font-bold text-yellow-500">{streak}</p>
        </div>
        
        <div className="flex flex-col items-center flex-1 text-center">
          <div className="flex gap-1 sm:gap-2 mb-1">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`text-xl sm:text-2xl ${i < lives ? 'text-red-500' : 'text-gray-600'}`}>
                ❤️
              </span>
            ))}
          </div>
          <div className="text-[10px] sm:text-xs text-red-400 font-bold uppercase tracking-widest">
            ABILITY SYNERGY
          </div>
        </div>

        <div className="text-right min-w-[60px]">
          <p className="text-gray-400 text-[10px] sm:text-xs uppercase leading-tight">Best</p>
          <p className="text-xl sm:text-3xl font-bold text-blue-400">{highScore}</p>
        </div>
      </div>

      {!gameOver ? (
        <>
          <div className="mb-8 text-center space-y-4">
            <h2 className="text-lg sm:text-xl text-gray-300">
              Which <span className="text-red-400 font-black">Ability</span> can this Pokémon have?
            </h2>
            <div className="relative group inline-block">
              <div className="absolute -inset-4 bg-red-500/20 blur-xl rounded-full opacity-50" />
              <img 
                src={question.pokemon.sprite} 
                alt={question.pokemon.name}
                className={`w-32 h-32 sm:w-48 sm:h-48 relative z-10 drop-shadow-2xl transition-all ${loading ? 'opacity-50 grayscale scale-95' : 'opacity-100'}`}
              />
            </div>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tighter text-white uppercase italic">
              {question.pokemon.name}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {question.options.map((option, i) => {
              const isSelected = selectedOptions.includes(option);
              const isCorrect = option === question.correctAnswer;
              
              let buttonClass = "p-4 rounded-2xl transition-all transform active:scale-95 w-full bg-gray-800/50 border-2 text-center group hover:bg-gray-800";
              if (explanation && isCorrect) {
                buttonClass += " border-green-500 ring-4 ring-green-500/20 bg-green-900/20";
              } else if (isSelected) {
                buttonClass += " border-red-500 opacity-50 grayscale bg-red-900/20";
              } else {
                buttonClass += " border-gray-700 hover:border-gray-500";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleGuess(option)}
                  disabled={!!explanation || loading}
                  className={buttonClass}
                >
                  <span className="text-lg font-bold group-hover:text-red-400 transition-colors uppercase italic tracking-tight">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {explanation && (
            <div className={`p-4 rounded-lg mb-6 text-sm sm:text-lg font-medium animate-in fade-in slide-in-from-bottom-4 duration-300 ${explanation.startsWith('Correct') ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
              <p>{explanation}</p>
              <button
                onClick={handleContinue}
                className="mt-4 px-6 sm:px-8 py-2 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-200 transition-colors shadow-lg"
              >
                Next Pokémon
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6 sm:py-10">
          <h2 className="text-3xl sm:text-5xl font-black text-red-500 mb-4 uppercase">Game Over</h2>
          <p className="text-xl sm:text-2xl mb-8 text-gray-400">Final streak: <span className="text-white font-bold">{streak}</span></p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={restartGame}
              className="px-8 py-3 bg-yellow-500 text-gray-900 rounded-full font-bold text-xl hover:bg-yellow-400 transition-transform active:scale-95 shadow-lg"
            >
              Try Again
            </button>
            <button
              onClick={onReset}
              className="px-8 py-3 bg-gray-700 text-white rounded-full font-bold text-xl hover:bg-gray-600 transition-transform active:scale-95 shadow-lg"
            >
              Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PokemonAbilityQuiz;
