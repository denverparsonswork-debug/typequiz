import React, { useState, useEffect, useCallback } from 'react';
import type { PokemonType } from '../data/type-chart';
import { generateQuestion, calculateEffectiveness, getExplanation } from '../logic/quiz-engine';
import type { Question, Difficulty } from '../logic/quiz-engine';
import TypeBadge from './TypeBadge';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

interface QuizProps {
  difficulty: Difficulty;
  onReset: () => void;
  gen: number;
}

const Quiz: React.FC<QuizProps> = ({ difficulty, onReset, gen }) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [streak, setStreak] = useState(0);
  const highScoreKey = `highScore_${difficulty}_gen${gen}`;
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(difficulty === 'hard' ? 1 : 3);
  const [attempts, setAttempts] = useState(0);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showHints, setShowHints] = useState(true);
  const [isResistMode, setIsResistMode] = useState(false);
  
  const { isLoggedIn, token } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion(difficulty, gen, isResistMode ? 'resist' : 'effective'));
    setAttempts(0);
    setExplanation(null);
    setSelectedTypes([]);
    if (difficulty === 'hard') {
      const time = Math.max(5, 15 - streak * 0.5);
      setTimeLeft(time);
    }
  }, [difficulty, streak, gen, isResistMode]);

  useEffect(() => {
    const saved = Number(localStorage.getItem(highScoreKey) || '0');
    setHighScore(saved);
    setLives(difficulty === 'hard' ? 1 : 3);
    setStreak(0);
    setGameOver(false);
    setExplanation(null);
    setScoreSaved(false);
    nextQuestion();
  }, [difficulty, highScoreKey, gen, isResistMode]);

  const saveScore = async () => {
    if (!isLoggedIn || streak === 0 || scoreSaved || isSaving) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gameType: 'type-quiz',
          mode: isResistMode ? `resist-${difficulty}` : difficulty,
          gen: gen,
          streak: streak
        }),
      });

      if (response.ok) {
        setScoreSaved(true);
      }
    } catch (err) {
      console.error('Failed to save score:', err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (gameOver && isLoggedIn && streak > 0 && !scoreSaved) {
      saveScore();
    }
  }, [gameOver, isLoggedIn, streak, scoreSaved]);

  useEffect(() => {
    if (difficulty === 'hard' && timeLeft !== null && timeLeft > 0 && !explanation && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !explanation && !gameOver) {
      handleTimeOut();
    }
  }, [timeLeft, difficulty, explanation, gameOver]);

  const handleTimeOut = () => {
    if (difficulty === 'hard' && !showHints) {
      setLives(0);
      setGameOver(true);
      return;
    }
    setExplanation("Time's up!");
    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) {
      setGameOver(true);
    }
  };

  const handleGuess = (type: PokemonType) => {
    if (explanation || gameOver || selectedTypes.includes(type)) return;

    const effectiveness = calculateEffectiveness(type, question!.defenderTypes, gen);
    const isCorrect = isResistMode ? effectiveness < 1 : effectiveness > 1;
    
    if (difficulty === 'hard' && !showHints) {
      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > highScore) {
          setHighScore(newStreak);
          localStorage.setItem(highScoreKey, newStreak.toString());
        }
        nextQuestion();
      } else {
        setLives(0);
        setGameOver(true);
      }
      return;
    }

    const currentExplanation = getExplanation(type, question!.defenderTypes, gen);
    setSelectedTypes(prev => [...prev, type]);

    if (isCorrect) {
      setExplanation(`Correct! ${showHints ? currentExplanation : ''}`);
      if (attempts === 0) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > highScore) {
          setHighScore(newStreak);
          localStorage.setItem(highScoreKey, newStreak.toString());
        }
      }
    } else {
      if (difficulty !== 'hard' && attempts === 0) {
        setAttempts(1);
        setExplanation(`Not quite. ${showHints ? currentExplanation : ''} Try one more time!`);
      } else {
        const newLives = lives - 1;
        setLives(newLives);
        setExplanation(`Wrong. ${showHints ? currentExplanation : ''} The correct answer was ${question!.correctAnswer}.`);
        if (newLives <= 0) {
          setGameOver(true);
        }
      }
    }
  };

  const handleContinue = () => {
    if (gameOver) return;
    if (explanation?.includes("Try one more time")) {
      setExplanation(null);
    } else {
      nextQuestion();
    }
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
    setLives(difficulty === 'hard' ? 1 : 3);
    setStreak(0);
    setGameOver(false);
    setScoreSaved(false);
    nextQuestion();
  };

  if (!question) return <div>Loading...</div>;

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-6 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4 gap-2">
        <div className="text-left min-w-[60px]">
          <p className="text-gray-400 text-[10px] sm:text-xs uppercase">Streak</p>
          <p className="text-xl sm:text-3xl font-bold text-yellow-500">{streak}</p>
        </div>
        
        <div className="flex flex-col items-center flex-1">
          <div className="flex gap-1 sm:gap-2 mb-1">
            {[...Array(difficulty === 'hard' ? 1 : 3)].map((_, i) => (
              <svg 
                key={i} 
                className={`w-5 h-5 sm:w-8 sm:h-8 ${i < lives ? 'fill-red-500' : 'fill-gray-800'}`} 
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ))}
          </div>
          <div className="text-[10px] sm:text-xs text-blue-400 font-bold uppercase tracking-widest text-center">
            TYPE QUIZ: {isResistMode ? 'RESIST' : 'EFFECTIVE'}
          </div>
          {difficulty === 'hard' && timeLeft !== null && (
            <div className={`text-lg sm:text-xl font-mono font-bold ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
              ⏱️ {timeLeft.toFixed(0)}s
            </div>
          )}
          {difficulty !== 'hard' && !explanation && (
            <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-tighter sm:tracking-widest">
              {attempts === 0 ? "1st Try" : "Last Try!"}
            </div>
          )}
        </div>

        <div className="text-right min-w-[60px]">
          <p className="text-gray-400 text-[10px] sm:text-xs uppercase leading-tight">Best ({difficulty})</p>
          <p className="text-xl sm:text-3xl font-bold text-blue-400">{highScore}</p>
        </div>
      </div>

      {!gameOver ? (
        <>
          <div className="mb-8 text-center">
            <h2 className="text-lg sm:text-xl mb-4 text-gray-300 font-bold uppercase tracking-tight">
              What is <span className={`${isResistMode ? 'text-purple-400' : 'text-blue-400'} font-black`}>
                {isResistMode ? 'NOT VERY EFFECTIVE' : 'SUPER EFFECTIVE'}
              </span> against?
            </h2>
            <div className="flex justify-center gap-2 sm:gap-4">
              {question.defenderTypes.map((type, i) => (
                <TypeBadge key={i} type={type} large />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-8">
            {question.options.map((type, i) => {
              const isSelected = selectedTypes.includes(type);
              const isCorrect = type === question.correctAnswer;
              const isResolved = explanation && !explanation.includes("Try one more time");
              
              let buttonClass = "p-1 sm:p-2 rounded-lg transition-all transform active:scale-95 w-full";
              if (isResolved && isCorrect) {
                buttonClass += " border-2 sm:border-4 border-green-500 ring-2 sm:ring-4 ring-green-500/30";
              } else if (isSelected) {
                buttonClass += " border-2 sm:border-4 border-red-500 opacity-50 grayscale";
              } else {
                buttonClass += " border border-transparent hover:border-gray-500";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleGuess(type)}
                  disabled={!!explanation}
                  className={buttonClass}
                >
                  <TypeBadge type={type} />
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
                {gameOver ? "Show Results" : "Continue"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6 sm:py-10 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-black text-red-500 uppercase">Game Over</h2>
            <p className="text-xl sm:text-2xl text-gray-400">Final streak: <span className="text-white font-bold">{streak}</span></p>
          </div>

          {!isLoggedIn && streak > 0 && (
            <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl space-y-4 animate-in zoom-in duration-500">
              <p className="text-sm text-blue-300 font-bold uppercase tracking-widest">Register to save this score!</p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-500 transition-transform active:scale-95 shadow-lg shadow-blue-500/20"
              >
                Sign Up Now
              </button>
            </div>
          )}

          {isLoggedIn && streak > 0 && (
            <div className="flex items-center justify-center gap-2 text-green-400 font-bold uppercase tracking-widest text-xs">
              {scoreSaved ? '✅ Streak saved to leaderboard' : '⏳ Saving streak...'}
            </div>
          )}

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
            checked={isResistMode}
            onChange={(e) => setIsResistMode(e.target.checked)}
            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-gray-900"
          />
          <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors font-bold uppercase tracking-tight">
            Resistance Training (Invert Logic)
          </span>
        </label>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={saveScore}
      />
    </div>
  );
};

export default Quiz;
