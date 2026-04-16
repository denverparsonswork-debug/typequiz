import { useState } from 'react';
import Quiz from './components/Quiz';
import MoveQuiz from './components/MoveQuiz';
import AbilityDescQuiz from './components/AbilityDescQuiz';
import PokemonAbilityQuiz from './components/PokemonAbilityQuiz';
import Resources from './components/Resources';
import LandingPage from './components/LandingPage';
import type { Difficulty } from './logic/quiz-engine';

type View = 'landing' | 'type-quiz-menu' | 'type-quiz-game' | 'move-mastery' | 'ability-desc' | 'pokemon-ability' | 'resources';

function App() {
  const [view, setView] = useState<View>('landing');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const startTypeQuiz = (diff: Difficulty) => {
    setDifficulty(diff);
    setView('type-quiz-game');
  };

  const resetToLanding = () => {
    setView('landing');
    setDifficulty(null);
  };

  const goToTypeMenu = () => {
    setView('type-quiz-menu');
    setDifficulty(null);
  };

  const startMoveMastery = () => {
    setView('move-mastery');
    setDifficulty(null);
  };

  const startAbilityDesc = () => {
    setView('ability-desc');
    setDifficulty(null);
  };

  const startPokemonAbility = () => {
    setView('pokemon-ability');
    setDifficulty(null);
  };

  const goToResources = () => {
    setView('resources');
    setDifficulty(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center p-4 font-sans w-full overflow-x-hidden text-white">
      {/* Navigation Header */}
      <nav className="w-full max-w-6xl flex justify-between items-center py-6 mb-8 border-b border-gray-900">
        <div 
          className="text-2xl font-black tracking-tighter cursor-pointer hover:opacity-80 transition-opacity uppercase italic"
          onClick={resetToLanding}
        >
          PKMN <span className="text-blue-500">LABS</span>
        </div>
        <div className="hidden sm:flex gap-8 text-xs font-bold uppercase tracking-widest text-gray-400">
          <span className="hover:text-white cursor-pointer transition-colors" onClick={resetToLanding}>Home</span>
          <span className="hover:text-white cursor-pointer transition-colors" onClick={goToTypeMenu}>Training</span>
          <span className="hover:text-white cursor-pointer transition-colors" onClick={goToResources}>Resources</span>
          <span className="text-gray-700 cursor-not-allowed">Puzzles</span>
        </div>
        <button 
          className="px-5 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-gray-700 transition-all"
          onClick={goToTypeMenu}
        >
          Train Now
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="w-full flex flex-col items-center justify-center flex-1">
        {view === 'landing' && (
          <LandingPage 
            onStartQuiz={goToTypeMenu} 
            onStartMoveQuiz={startMoveMastery}
            onStartAbilityDesc={startAbilityDesc}
            onStartPokemonAbility={startPokemonAbility}
          />
        )}

        {view === 'resources' && (
          <Resources />
        )}

        {view === 'type-quiz-menu' && (
          <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500 flex flex-col items-center">
            <header className="space-y-2 w-full">
              <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 tracking-tighter break-words uppercase">
                Type Matchup Master
              </h1>
              <p className="text-gray-400 text-lg">Select your training intensity</p>
            </header>

            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={() => startTypeQuiz('easy')}
                className="group relative overflow-hidden bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-green-500/50 transition-all active:scale-95 shadow-xl w-full text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-1">Easy Mode</h3>
                  <p className="text-gray-400 text-sm">Mono typing. 3 lives. 2 chances per question.</p>
                </div>
              </button>

              <button
                onClick={() => startTypeQuiz('dual')}
                className="group relative overflow-hidden bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-yellow-500/50 transition-all active:scale-95 shadow-xl w-full text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-1">Dual Mode</h3>
                  <p className="text-gray-400 text-sm">Dual typing. 3 lives. 2 chances per question.</p>
                </div>
              </button>

              <button
                onClick={() => startTypeQuiz('hard')}
                className="group relative overflow-hidden bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-red-500/50 transition-all active:scale-95 shadow-xl w-full text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-1">Hard Mode</h3>
                  <p className="text-gray-400 text-sm">Mix typing. 1 life. 1 chance. Timed!</p>
                </div>
              </button>
            </div>

            <button 
              onClick={resetToLanding}
              className="text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest pt-4"
            >
              ← Back to Labs
            </button>
          </div>
        )}

        {view === 'type-quiz-game' && difficulty && (
          <div className="w-full max-w-2xl animate-in slide-in-from-top-8 duration-500">
            <Quiz difficulty={difficulty} onReset={goToTypeMenu} />
          </div>
        )}

        {view === 'move-mastery' && (
          <div className="w-full max-w-2xl animate-in slide-in-from-top-8 duration-500">
            <MoveQuiz onReset={resetToLanding} />
          </div>
        )}

        {view === 'ability-desc' && (
          <div className="w-full max-w-2xl animate-in slide-in-from-top-8 duration-500">
            <AbilityDescQuiz onReset={resetToLanding} />
          </div>
        )}

        {view === 'pokemon-ability' && (
          <div className="w-full max-w-2xl animate-in slide-in-from-top-8 duration-500">
            <PokemonAbilityQuiz onReset={resetToLanding} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
