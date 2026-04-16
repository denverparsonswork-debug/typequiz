import React from 'react';
import heroImg from '../assets/hero.png';

interface LandingPageProps {
  onStartQuiz: () => void;
  onStartMoveQuiz: () => void;
  onStartAbilityDesc: () => void;
  onStartPokemonAbility: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartQuiz, 
  onStartMoveQuiz, 
  onStartAbilityDesc, 
  onStartPokemonAbility 
}) => {
  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4 py-8 sm:py-16 space-y-20">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-12 w-full">
        <div className="flex-1 text-center md:text-left space-y-6">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-4">
            Beta Training Program
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter leading-none">
            MASTER <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-red-500">
              COMPETITIVE
            </span> <br />
            POKÉMON
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-xl mx-auto md:mx-0">
            The ultimate training ground for aspiring Champions. Sharpen your instincts with tactical drills and matchup mastery.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button
              onClick={onStartQuiz}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              Start Training
            </button>
            <button 
              onClick={onStartAbilityDesc}
              className="px-8 py-4 bg-gray-900 border border-gray-800 hover:border-gray-700 text-white rounded-xl font-bold text-lg transition-all active:scale-95"
            >
              Learn Abilities
            </button>
          </div>
        </div>
        <div className="flex-1 relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl opacity-50 group-hover:opacity-75 transition-opacity" />
          <img
            src={heroImg}
            alt="Competitive Pokémon Training"
            className="relative z-10 w-full h-auto drop-shadow-2xl rounded-3xl transform group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      </section>

      {/* Feature Grid */}
      <section className="w-full space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Training Modules</h2>
          <p className="text-gray-500">Select a discipline to begin your journey.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Module 1: Type Quiz */}
          <button
            onClick={onStartQuiz}
            className="group relative overflow-hidden bg-gray-900/50 border border-gray-800 p-6 rounded-3xl hover:border-blue-500/50 transition-all text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="space-y-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 text-xl">
                ⚔️
              </div>
              <h3 className="text-xl font-bold text-white">Type Matchup</h3>
              <p className="text-gray-400 text-xs">
                Master weaknesses and resistances across all generations.
              </p>
              <div className="pt-2 flex items-center text-blue-400 font-bold text-[10px] tracking-widest uppercase">
                START DRILL <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </button>

          {/* Module 2: Move Mastery */}
          <button
            onClick={onStartMoveQuiz}
            className="group relative overflow-hidden bg-gray-900/50 border border-gray-800 p-6 rounded-3xl hover:border-purple-500/50 transition-all text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="space-y-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 text-xl">
                🧩
              </div>
              <h3 className="text-xl font-bold text-white">Move Mastery</h3>
              <p className="text-gray-400 text-xs">
                Identify super-effective moves against specific sprites.
              </p>
              <div className="pt-2 flex items-center text-purple-400 font-bold text-[10px] tracking-widest uppercase">
                TRAIN MOVES <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </button>

          {/* Module 3: Ability Oracle */}
          <button
            onClick={onStartAbilityDesc}
            className="group relative overflow-hidden bg-gray-900/50 border border-gray-800 p-6 rounded-3xl hover:border-red-500/50 transition-all text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="space-y-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 text-xl">
                🧿
              </div>
              <h3 className="text-xl font-bold text-white">Ability Oracle</h3>
              <p className="text-gray-400 text-xs">
                Match ability descriptions to their competitive names.
              </p>
              <div className="pt-2 flex items-center text-red-400 font-bold text-[10px] tracking-widest uppercase">
                MEMORIZE <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </button>

          {/* Module 4: Ability Synergy */}
          <button
            onClick={onStartPokemonAbility}
            className="group relative overflow-hidden bg-gray-900/50 border border-gray-800 p-6 rounded-3xl hover:border-cyan-500/50 transition-all text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="space-y-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl">
                🧬
              </div>
              <h3 className="text-xl font-bold text-white">Ability Synergy</h3>
              <p className="text-gray-400 text-xs">
                Identify which legal abilities belong to each Pokémon.
              </p>
              <div className="pt-2 flex items-center text-cyan-400 font-bold text-[10px] tracking-widest uppercase">
                RECOGNIZE <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Footer / Stats (Placeholder) */}
      <footer className="w-full pt-20 pb-10 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-gray-600 text-sm italic">
          Built for Champions. Optimized for the Ladder.
        </p>
        <div className="flex gap-8 text-gray-500 text-sm font-bold uppercase tracking-widest">
          <span className="hover:text-white cursor-pointer transition-colors">Discord</span>
          <span className="hover:text-white cursor-pointer transition-colors">GitHub</span>
          <span className="hover:text-white cursor-pointer transition-colors">Roadmap</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
