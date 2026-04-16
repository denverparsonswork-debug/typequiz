import React, { useState, useEffect, useCallback } from 'react';
import { calculateEffectiveness, getExplanation, generateMoveQuestion } from '../logic/quiz-engine';
import type { MoveQuestion } from '../logic/quiz-engine';
import type { Move } from '../data/moves';
import { normalizeAbilityName } from '../logic/ability-engine';
import TypeBadge from './TypeBadge';

interface MoveQuizProps {
  onReset: () => void;
}

const MoveQuiz: React.FC<MoveQuizProps> = ({ onReset }) => {
  const [question, setQuestion] = useState<MoveQuestion | null>(null);
  const [streak, setStreak] = useState(0);
  const highScoreKey = 'highScore_move_mastery';
  const [highScore, setHighScore] = useState(Number(localStorage.getItem(highScoreKey) || '0'));
  const [lives, setLives] = useState(3);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [selectedMoves, setSelectedMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [showTypes, setShowTypes] = useState(false);
  const [isResistMode, setIsResistMode] = useState(false);

  const nextQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const q = await generateMoveQuestion(isResistMode ? 'resist' : 'effective');
      setQuestion(q);
      setExplanation(null);
      setSelectedMoves([]);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [isResistMode]);

  useEffect(() => {
    nextQuestion();
  }, [nextQuestion]);

  const handleGuess = (move: Move) => {
    if (explanation || gameOver || selectedMoves.includes(move) || loading) return;

    const effectiveness = calculateEffectiveness(
      move.type, 
      question!.pokemon.types, 
      question!.pokemon.activeAbility
    );
    
    const isCorrect = isResistMode ? effectiveness < 1 : effectiveness > 1;
    
    const pokeTypes = question!.pokemon.types.join('/');
    const currentExplanation = getExplanation(
      move.type, 
      question!.pokemon.types, 
      question!.pokemon.activeAbility
    );
    
    setSelectedMoves(prev => [...prev, move]);

    if (isCorrect) {
      setExplanation(`Correct! ${showHints ? currentExplanation : ''}`);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > highScore) {
        setHighScore(newStreak);
        localStorage.setItem(highScoreKey, newStreak.toString());
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      const abilityName = normalizeAbilityName(question!.pokemon.activeAbility);
      setExplanation(`Wrong. ${move.name} is ${currentExplanation}. ${question!.pokemon.name} is ${pokeTypes} with ${abilityName}.`);
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
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 animate-pulse font-bold tracking-widest uppercase">Scouting Pokémon...</p>
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
        
        <div className="flex flex-col items-center flex-1">
          <div className="flex gap-1 sm:gap-2 mb-1">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`text-xl sm:text-2xl ${i < lives ? 'text-red-500' : 'text-gray-600'}`}>
                ❤️
              </span>
            ))}
          </div>
          <div className="text-[10px] sm:text-xs text-blue-400 font-bold uppercase tracking-widest text-center">
            MOVE MASTERY: {isResistMode ? 'RESIST' : 'EFFECTIVE'}
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
              Select a <span className={`${isResistMode ? 'text-purple-400' : 'text-blue-400'} font-black uppercase`}>
                {isResistMode ? 'Resisted (or Immune)' : 'Super Effective'}
              </span> move against:
            </h2>
            <div className="relative group inline-block">
              <div className="absolute -inset-4 bg-blue-500/20 blur-xl rounded-full opacity-50" />
              <img 
                src={question.pokemon.sprite} 
                alt={question.pokemon.name}
                className={`w-32 h-32 sm:w-48 sm:h-48 relative z-10 drop-shadow-2xl transition-all ${loading ? 'opacity-50 grayscale scale-95' : 'opacity-100'}`}
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-4xl font-black tracking-tighter text-white uppercase italic">
                {question.pokemon.name}
              </h3>
              <div className="flex flex-col items-center gap-2 mt-1">
                <div className="inline-block px-3 py-1 rounded-md bg-gray-800 border border-gray-700 text-cyan-400 text-xs font-bold uppercase tracking-widest">
                  Ability: {normalizeAbilityName(question.pokemon.activeAbility)}
                </div>
                {showTypes && (
                  <div className="flex gap-2 animate-in fade-in zoom-in duration-300">
                    {question.pokemon.types.map((type, i) => (
                      <TypeBadge key={i} type={type} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {question.options.map((move, i) => {
              const isSelected = selectedMoves.includes(move);
              const isCorrect = move === question.correctAnswer;
              
              let buttonClass = "p-4 rounded-2xl transition-all transform active:scale-95 w-full bg-gray-800/50 border-2 flex flex-col items-center gap-2 group hover:bg-gray-800";
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
                  onClick={() => handleGuess(move)}
                  disabled={!!explanation || loading}
                  className={buttonClass}
                >
                  <span className="text-lg font-bold group-hover:text-blue-400 transition-colors uppercase italic">
                    {move.name}
                  </span>
                  <TypeBadge type={move.type} />
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
                {gameOver ? "Show Results" : "Next Pokémon"}
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

      <div className="mt-6 pt-4 border-t border-gray-800 flex flex-col items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={showHints}
            onChange={(e) => setShowHints(e.target.checked)}
            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
          />
          <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
            Show detailed hints & explanations
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={showTypes}
            onChange={(e) => setShowTypes(e.target.checked)}
            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
          />
          <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
            Show Pokémon types (Beginner Mode)
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={isResistMode}
            onChange={(e) => setIsResistMode(e.target.checked)}
            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-gray-900"
          />
          <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors font-bold uppercase tracking-tight">
            Resistance Training (Invert Logic)
          </span>
        </label>
      </div>
    </div>
  );
};

export default MoveQuiz;
