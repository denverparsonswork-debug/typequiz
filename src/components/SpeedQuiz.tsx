import React, { useState, useEffect, useCallback } from 'react';
import { generateSpeedQuestion } from '../logic/quiz-engine';
import type { SpeedQuestion } from '../logic/quiz-engine';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

interface SpeedQuizProps {
  onReset: () => void;
  gen: number;
}

const SpeedQuiz: React.FC<SpeedQuizProps> = ({ onReset, gen }) => {
  const [question, setQuestion] = useState<SpeedQuestion | null>(null);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState<'standard' | 'hard'>('standard');
  const highScoreKey = `highScore_speed_tiers_${difficulty}`;
  const [highScore, setHighScore] = useState(Number(localStorage.getItem(highScoreKey) || '0'));
  const [lives, setLives] = useState(3);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  const { isLoggedIn, token } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const nextQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const q = await generateSpeedQuestion(gen, difficulty);
      setQuestion(q);
      setExplanation(null);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [gen, difficulty]);

  useEffect(() => {
    setHighScore(Number(localStorage.getItem(highScoreKey) || '0'));
    setScoreSaved(false);
    nextQuestion();
  }, [nextQuestion, highScoreKey]);

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
          gameType: 'speed-tiers',
          mode: difficulty,
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

  const handleGuess = (choice: 'A' | 'B') => {
    if (explanation || gameOver || loading) return;

    const isCorrect = choice === question!.correctAnswer;

    if (isCorrect) {
      const winner = choice === 'A' ? question!.pokemonA : question!.pokemonB;
      const loser = choice === 'A' ? question!.pokemonB : question!.pokemonA;
      setExplanation(`Correct! ${winner.name} (Base ${winner.speed}) is faster than ${loser.name} (Base ${loser.speed}).`);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > highScore) {
        setHighScore(newStreak);
        localStorage.setItem(highScoreKey, newStreak.toString());
      }
    } else {
      const winner = choice === 'A' ? question!.pokemonB : question!.pokemonA;
      const loser = choice === 'A' ? question!.pokemonA : question!.pokemonB;
      setLives(lives - 1);
      setExplanation(`Wrong. ${winner.name} (Base ${winner.speed}) moves first.`);
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

  if (loading && !question) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 animate-pulse font-bold tracking-widest uppercase">Calculating Initiative...</p>
      </div>
    );
  }

  if (!question) return <div className="text-red-500">Error loading question.</div>;

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
          <div className="text-[10px] sm:text-xs text-blue-400 font-bold uppercase tracking-widest">SPEED TIERS: {difficulty}</div>
        </div>

        <div className="text-right min-w-[60px]">
          <p className="text-gray-400 text-[10px] sm:text-xs uppercase leading-tight">Best</p>
          <p className="text-xl sm:text-3xl font-bold text-blue-400">{highScore}</p>
        </div>
      </div>

      {!gameOver ? (
        <>
          <div className="text-center mb-10">
            <h2 className="text-lg sm:text-xl text-gray-300 font-bold uppercase tracking-tight mb-8">
              Who <span className="text-blue-400 font-black italic underline decoration-blue-500/50 underline-offset-4">Moves First</span>?
            </h2>
            
            <div className="grid grid-cols-2 gap-8 items-center relative">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
                <span className="text-4xl font-black text-gray-800/50 italic">VS</span>
              </div>

              {/* Pokemon A */}
              <button 
                onClick={() => handleGuess('A')}
                disabled={!!explanation}
                className={`flex flex-col items-center gap-4 p-6 rounded-3xl transition-all relative z-10 group
                  ${explanation && question.correctAnswer === 'A' ? 'bg-green-500/10 border-2 border-green-500' : 'bg-gray-800/50 border-2 border-transparent hover:border-blue-500/50'}
                  ${explanation && explanation.includes('Wrong') && question.correctAnswer !== 'A' ? 'opacity-30 grayscale' : ''}`}
              >
                <img src={question.pokemonA.sprite} className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-xl group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <h3 className="text-sm sm:text-lg font-black uppercase italic tracking-tighter">{question.pokemonA.name}</h3>
                  {question.modifierA && (
                    <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 uppercase mt-2 inline-block">
                      {question.modifierA}
                    </span>
                  )}
                </div>
              </button>

              {/* Pokemon B */}
              <button 
                onClick={() => handleGuess('B')}
                disabled={!!explanation}
                className={`flex flex-col items-center gap-4 p-6 rounded-3xl transition-all relative z-10 group
                  ${explanation && question.correctAnswer === 'B' ? 'bg-green-500/10 border-2 border-green-500' : 'bg-gray-800/50 border-2 border-transparent hover:border-blue-500/50'}
                  ${explanation && explanation.includes('Wrong') && question.correctAnswer !== 'B' ? 'opacity-30 grayscale' : ''}`}
              >
                <img src={question.pokemonB.sprite} className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-xl group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <h3 className="text-sm sm:text-lg font-black uppercase italic tracking-tighter">{question.pokemonB.name}</h3>
                  {question.modifierB && (
                    <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 uppercase mt-2 inline-block">
                      {question.modifierB}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {explanation && (
            <div className={`p-4 rounded-lg mb-6 text-sm sm:text-lg font-medium animate-in fade-in slide-in-from-bottom-4 duration-300 ${explanation.startsWith('Correct') ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
              <p>{explanation}</p>
              <button onClick={nextQuestion} className="mt-4 px-8 py-2 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-200 transition-colors shadow-lg">Next Round</button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 space-y-8">
          <h2 className="text-3xl sm:text-5xl font-black text-red-500 uppercase">Eliminated</h2>
          <p className="text-xl sm:text-2xl text-gray-400">Streak: <span className="text-white font-bold">{streak}</span></p>
          <div className="flex gap-4 justify-center">
            <button onClick={restartGame} className="px-8 py-3 bg-yellow-500 text-gray-900 rounded-full font-bold hover:bg-yellow-400 transition-transform active:scale-95 shadow-lg">Try Again</button>
            <button onClick={onReset} className="px-8 py-3 bg-gray-700 text-white rounded-full font-bold hover:bg-gray-600 transition-transform active:scale-95 shadow-lg">Menu</button>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-800 flex justify-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" checked={difficulty === 'hard'} onChange={(e) => {
            setDifficulty(e.target.checked ? 'hard' : 'standard');
            setStreak(0);
          }} className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-red-500 focus:ring-red-500" />
          <span className="text-gray-400 text-xs font-bold uppercase tracking-widest group-hover:text-gray-300 transition-colors">Hard Mode (Modifiers)</span>
        </label>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={saveScore} />
    </div>
  );
};

export default SpeedQuiz;