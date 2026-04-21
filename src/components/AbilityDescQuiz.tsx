import React, { useState, useEffect, useCallback } from 'react';
import { generateAbilityDescQuestion } from '../logic/quiz-engine';
import type { AbilityDescQuestion } from '../logic/quiz-engine';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

interface AbilityDescQuizProps {
  onReset: () => void;
}

const AbilityDescQuiz: React.FC<AbilityDescQuizProps> = ({ onReset }) => {
  const [question, setQuestion] = useState<AbilityDescQuestion | null>(null);
  const [streak, setStreak] = useState(0);
  const highScoreKey = 'highScore_ability_desc';
  const [highScore, setHighScore] = useState(Number(localStorage.getItem(highScoreKey) || '0'));
  const [lives, setLives] = useState(3);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const { isLoggedIn, token } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const nextQuestion = useCallback(() => {
    const q = generateAbilityDescQuestion();
    setQuestion(q);
    setExplanation(null);
    setSelectedOptions([]);
  }, []);

  useEffect(() => {
    setScoreSaved(false);
    nextQuestion();
  }, []);

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
          gameType: 'ability-desc',
          mode: 'standard',
          gen: 9, // Abilities are largely gen-independent in this quiz but we'll use 9 as default
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

  const handleGuess = (option: string) => {
    if (explanation || gameOver || selectedOptions.includes(option)) return;

    const isCorrect = option === question!.correctAnswer;
    setSelectedOptions(prev => [...prev, option]);

    if (isCorrect) {
      setExplanation(`Correct! That's the effect of ${option}.`);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > highScore) {
        setHighScore(newStreak);
        localStorage.setItem(highScoreKey, newStreak.toString());
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setExplanation(`Wrong. The correct answer was ${question!.correctAnswer}.`);
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

  if (!question) return <div>Loading...</div>;

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
          <div className="text-[10px] sm:text-xs text-purple-400 font-bold uppercase tracking-widest">
            ABILITY ORACLE
          </div>
        </div>

        <div className="text-right min-w-[60px]">
          <p className="text-gray-400 text-[10px] sm:text-xs uppercase leading-tight">Best</p>
          <p className="text-xl sm:text-3xl font-bold text-blue-400">{highScore}</p>
        </div>
      </div>

      {!gameOver ? (
        <>
          <div className="mb-10 text-center space-y-6">
            <h2 className="text-lg sm:text-xl text-gray-300">
              Which <span className="text-purple-400 font-black">Ability</span> has this effect?
            </h2>
            <div className="p-6 sm:p-10 bg-gray-800/50 border border-gray-700 rounded-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-xl sm:text-2xl font-medium leading-relaxed italic text-white relative z-10">
                "{question.ability.description}"
              </p>
            </div>
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
                  disabled={!!explanation}
                  className={buttonClass}
                >
                  <span className="text-lg font-bold group-hover:text-purple-400 transition-colors uppercase tracking-tight">
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
                {gameOver ? "Show Results" : "Continue"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6 sm:py-10 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-black text-red-500 mb-4 uppercase">Game Over</h2>
            <p className="text-xl sm:text-2xl mb-8 text-gray-400">Final streak: <span className="text-white font-bold">{streak}</span></p>
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

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={saveScore}
      />
    </div>
  );
};

export default AbilityDescQuiz;
