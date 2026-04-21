import React, { useState, useMemo } from 'react';
import heroImg from '../assets/hero.png';

interface LandingPageProps {
  onStartQuiz: () => void;
  onStartMoveQuiz: () => void;
  onStartAbilityDesc: () => void;
  onStartPokemonAbility: () => void;
  activeGen: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'Tactical Drills' | 'Ability Mastery' | 'Battle Mechanics';
  color: string;
  keywords: string[];
  action: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartQuiz, 
  onStartMoveQuiz, 
  onStartAbilityDesc, 
  onStartPokemonAbility,
  activeGen
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const modules: Module[] = [
    {
      id: 'type-matchup',
      title: 'Type Matchup',
      description: 'Master weaknesses and resistances across all generations.',
      icon: '⚔️',
      category: 'Tactical Drills',
      color: 'blue',
      keywords: ['type', 'weakness', 'resistance', 'effectiveness', 'quiz', 'matchup', 'strategy'],
      action: onStartQuiz
    },
    {
      id: 'move-mastery',
      title: 'Move Mastery',
      description: 'Identify super-effective moves against specific sprites.',
      icon: '🧩',
      category: 'Battle Mechanics',
      color: 'purple',
      keywords: ['move', 'attack', 'sprite', 'effective', 'super effective', 'resist', 'interaction'],
      action: onStartMoveQuiz
    },
    {
      id: 'ability-oracle',
      title: 'Ability Oracle',
      description: 'Match ability descriptions to their competitive names.',
      icon: '🧿',
      category: 'Ability Mastery',
      color: 'red',
      keywords: ['ability', 'description', 'oracle', 'name', 'effect', 'memorize'],
      action: onStartAbilityDesc
    },
    {
      id: 'ability-synergy',
      title: 'Ability Synergy',
      description: 'Identify which legal abilities belong to each Pokémon.',
      icon: 'cyan',
      category: 'Ability Mastery',
      color: 'cyan',
      keywords: ['ability', 'synergy', 'pokemon', 'legal', 'pool', 'recognition'],
      action: onStartPokemonAbility
    }
  ];

  const filteredModules = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return modules;
    return modules.filter(m => 
      m.title.toLowerCase().includes(query) ||
      m.description.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query) ||
      m.keywords.some(k => k.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const categories = ['Tactical Drills', 'Battle Mechanics', 'Ability Mastery'] as const;

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4 py-8 sm:py-16 space-y-20">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-12 w-full">
        <div className="flex-1 text-center md:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Active Training: Gen {activeGen} Mode
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

      {/* Modules Section */}
      <section className="w-full space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-gray-900 pb-10">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Training <span className="text-blue-500">Modules</span></h2>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Select a discipline to begin your journey.</p>
          </div>
          
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="text-gray-500 text-lg">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search drills (e.g., 'weakness', 'moves', 'abilities')..."
              className="w-full bg-gray-900/50 border border-gray-800 focus:border-blue-500/50 rounded-2xl py-4 pl-12 pr-6 text-white placeholder-gray-600 focus:outline-none transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredModules.length > 0 ? (
          <div className="space-y-16">
            {categories.map(category => {
              const categoryModules = filteredModules.filter(m => m.category === category);
              if (categoryModules.length === 0) return null;

              return (
                <div key={category} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] whitespace-nowrap">
                      {category}
                    </h3>
                    <div className="h-px bg-gray-900 w-full" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryModules.map((module) => (
                      <button
                        key={module.id}
                        onClick={module.action}
                        className={`group relative overflow-hidden bg-gray-900/50 border border-gray-800 p-8 rounded-3xl hover:border-${module.color}-500/50 transition-all text-left flex flex-col h-full`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br from-${module.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                        
                        <div className="space-y-6 relative z-10 flex flex-col h-full">
                          <div className={`w-12 h-12 rounded-2xl bg-${module.color}-500/20 flex items-center justify-center text-${module.color}-400 text-2xl shadow-inner`}>
                            {module.id === 'ability-synergy' ? '🧬' : module.icon}
                          </div>
                          
                          <div className="space-y-2 flex-grow">
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter group-hover:text-white transition-colors">
                              {module.title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">
                              {module.description}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-4">
                            {module.keywords.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] font-bold text-gray-600 bg-gray-800/50 px-2 py-1 rounded-md uppercase tracking-widest">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className={`pt-6 flex items-center text-${module.color}-400 font-black text-[10px] tracking-[0.2em] uppercase mt-auto`}>
                            INITIATE DRILL <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 bg-gray-900/20 border-2 border-dashed border-gray-800 rounded-3xl">
            <div className="text-4xl">🔎</div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white uppercase italic">No Matches Found</h3>
              <p className="text-gray-600 text-sm font-medium">Try searching for different keywords like "type", "move", or "ability".</p>
            </div>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-blue-400 text-xs font-bold uppercase tracking-widest hover:text-blue-300 transition-colors underline underline-offset-4"
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      {/* Footer / Stats (Placeholder) */}
      <footer className="w-full pt-20 pb-10 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-gray-600 text-sm italic font-medium uppercase tracking-tight">
          Built for Champions. Optimized for the Ladder.
        </p>
        <div className="flex gap-8 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="hover:text-white cursor-pointer transition-colors">Discord</span>
          <span className="hover:text-white cursor-pointer transition-colors">GitHub</span>
          <span className="hover:text-white cursor-pointer transition-colors">Roadmap</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
