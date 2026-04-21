import React, { useState, useEffect, useCallback } from 'react';
import { generateItemQuestion } from '../logic/quiz-engine';
import type { ItemQuestion } from '../logic/quiz-engine';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

interface ItemQuizProps {
  onReset: () => void;
}

const ItemQuiz: React.FC<ItemQuizProps> = ({ onReset }) => {
  const [question, setQuestion] = useState<ItemQuestion | null>(null);
  const [streak, setStreak] = useState(0);
  const highScoreKey = 'highScore_item_intuition';
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
    const q = generateItemQuestion();
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
          gameType: 'item-intuition',
          mode: 'standard',
          gen: 9,
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
      setLives(lives - 1);
      setExplanation(`Wrong. The correct answer was ${question!.correctAnswer}.`);
      if (lives <= 1) setGameOver(true);
    }
  };

  const restartGame = () => {
    setLives(3);
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
        
        <div className="flex flex-col items-center flex-1 text-center">
          <div className="flex gap-1 sm:gap-2 mb-1">
            {[...Array(3)].map((_, i) => (
              <svg key={i} className={`w-5 h-5 sm:w-8 sm:h-8 ${i < lives ? 'fill-red-500' : 'fill-gray-800'}`} viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ))}
          </div>
          <div className="text-[10px] sm:text-xs text-yellow-500 font-bold uppercase tracking-widest">ITEM INTUITION</div>
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
              Identify the <span className="text-yellow-500 font-black">Held Item</span> by its effect:
            </h2>
            <div className="p-6 sm:p-10 bg-gray-800/50 border border-gray-700 rounded-3xl relative overflow-hidden group">
              <p className="text-xl sm:text-2xl font-medium leading-relaxed italic text-white relative z-10">
                "{question.item.description}"
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
                <button key={i} onClick={() => handleGuess(option)} disabled={!!explanation} className={buttonClass}>
                  <span className="text-lg font-bold group-hover:text-yellow-500 transition-colors uppercase tracking-tight">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {explanation && (
            <div className={`p-4 rounded-lg mb-6 text-sm sm:text-lg font-medium animate-in fade-in slide-in-from-bottom-4 duration-300 ${explanation.startsWith('Correct') ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
              <p>{explanation}</p>
              <button onClick={nextQuestion} className="mt-4 px-6 sm:px-8 py-2 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-200 transition-colors shadow-lg">Next Round</button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 space-y-8">
          <h2 className="text-3xl sm:text-5xl font-black text-red-500 uppercase">Disconnected</h2>
          <p className="text-xl sm:text-2xl text-gray-400">Streak: <span className="text-white font-bold">{streak}</span></p>
          <div className="flex gap-4 justify-center">
            <button onClick={restartGame} className="px-8 py-3 bg-yellow-500 text-gray-900 rounded-full font-bold hover:bg-yellow-400 transition-transform active:scale-95 shadow-lg">Try Again</button>
            <button onClick={onReset} className="px-8 py-3 bg-gray-700 text-white rounded-full font-bold hover:bg-gray-600 transition-transform active:scale-95 shadow-lg">Menu</button>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={saveScore} />
    </div>
  );
};

export default ItemQuiz;