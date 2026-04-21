import React, { useState, useEffect, useCallback } from 'react';
import { generateCoverageQuestion, calculateEffectiveness } from '../logic/quiz-engine';
import type { CoverageQuestion } from '../logic/quiz-engine';
import type { Move } from '../data/moves';
import { normalizeAbilityName } from '../logic/ability-engine';
import TypeBadge from './TypeBadge';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

interface CoverageQuizProps {
  onReset: () => void;
  gen: number;
}

const CoverageQuiz: React.FC<CoverageQuizProps> = ({ onReset, gen }) => {
  const [question, setQuestion] = useState<CoverageQuestion | null>(null);
  const [streak, setStreak] = useState(0);
  const highScoreKey = `highScore_coverage_master_gen${gen}`;
  const [highScore, setHighScore] = useState(Number(localStorage.getItem(highScoreKey) || '0'));
  const [lives, setLives] = useState(3);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [selectedMoves, setSelectedMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);

  const { isLoggedIn, token } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const nextQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const q = await generateCoverageQuestion(gen);
      setQuestion(q);
      setExplanation(null);
      setSelectedMoves([]);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [gen]);

  useEffect(() => {
    setScoreSaved(false);
    nextQuestion();
  }, [nextQuestion]);

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
          gameType: 'coverage-master',
          mode: 'standard',
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

  const handleGuess = (move: Move) => {
    if (explanation || gameOver || selectedMoves.includes(move) || loading) return;

    const effectiveness = calculateEffectiveness(
      move.type, 
      question!.defender.types, 
      gen,
      question!.defender.activeAbility
    );
    
    const isCorrect = effectiveness > 1;
    setSelectedMoves(prev => [...prev, move]);

    if (isCorrect) {
      setExplanation(`Correct! ${move.name} is ${effectiveness}x super effective against ${question!.defender.name}.`);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > highScore) {
        setHighScore(newStreak);
        localStorage.setItem(highScoreKey, newStreak.toString());
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setExplanation(`Wrong. ${move.name} is only ${effectiveness}x effective. You needed a Super Effective coverage move.`);
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
    setScoreSaved(false);
    nextQuestion();
  };

  if (loading && !question) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 animate-pulse font-bold tracking-widest uppercase">Analyzing Coverage...</p>
      </div>
    );
  }

  if (!question) return <div className="text-red-500">Error loading question. Please try again.</div>;

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
              <svg 
                key={i} 
                className={`w-5 h-5 sm:w-8 sm:h-8 ${i < lives ? 'fill-red-500' : 'fill-gray-800'}`} 
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ))}
          </div>
          <div className="text-[10px] sm:text-xs text-yellow-500 font-bold uppercase tracking-widest">
            COVERAGE MASTER
          </div>
        </div>

        <div className="text-right min-w-[60px]">
          <p className="text-gray-400 text-[10px] sm:text-xs uppercase leading-tight">Best</p>
          <p className="text-xl sm:text-3xl font-bold text-blue-400">{highScore}</p>
        </div>
      </div>

      {!gameOver ? (
        <>
          <div className="mb-8 text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl text-gray-300 font-bold uppercase tracking-tight">
                Your current moves <span className="text-red-400">lack coverage</span>. Pick the <span className="text-yellow-500 font-black">Best 4th Move</span> against:
              </h2>
              <div className="flex flex-wrap justify-center gap-2 py-2">
                {question.currentMoves.map((move, i) => (
                  <div key={i} className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg flex items-center gap-2 opacity-60">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{move.name}</span>
                    <TypeBadge type={move.type} />
                  </div>
                ))}
                <div className="px-3 py-1 border-2 border-dashed border-yellow-500/50 rounded-lg flex items-center gap-2 animate-pulse bg-yellow-500/5">
                  <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Select 4th Move</span>
                </div>
              </div>
            </div>

            <div className="relative group inline-block">
              <div className="absolute -inset-4 bg-yellow-500/10 blur-xl rounded-full opacity-50" />
              <img 
                src={question.defender.sprite} 
                alt={question.defender.name}
                className={`w-32 h-32 sm:w-48 sm:h-48 relative z-10 drop-shadow-2xl transition-all ${loading ? 'opacity-50 grayscale scale-95' : 'opacity-100'}`}
              />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-4xl font-black tracking-tighter text-white uppercase italic">
                {question.defender.name}
              </h3>
              <div className="flex flex-col items-center gap-2 mt-1">
                <div className="flex gap-2">
                  {question.defender.types.map((type, i) => (
                    <TypeBadge key={i} type={type} />
                  ))}
                </div>
                <div className="inline-block px-3 py-1 rounded-md bg-gray-800 border border-gray-700 text-cyan-400 text-xs font-bold uppercase tracking-widest">
                  Ability: {normalizeAbilityName(question.defender.activeAbility)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {question.options.map((move, i) => {
              const isSelected = selectedMoves.includes(move);
              const isCorrect = move === question.correctAnswer;
              
              let buttonClass = "p-4 rounded-2xl transition-all transform active:scale-95 w-full bg-gray-800/50 border-2 flex flex-col items-center gap-2 group hover:bg-gray-800 h-full";
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
                  <span className="text-lg font-bold group-hover:text-yellow-500 transition-colors uppercase italic">
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

export default CoverageQuiz;