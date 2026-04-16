import React from 'react';

const RESOURCES = [
  {
    name: 'Pokémon Showdown',
    url: 'https://pokemonshowdown.com/',
    description: 'The industry-standard battle simulator. Build teams and battle players worldwide.',
    category: 'Simulator',
    color: 'blue'
  },
  {
    name: 'Smogon University',
    url: 'https://www.smogon.com/',
    description: 'The hub for competitive Pokémon strategy, tiered play, and community forums.',
    category: 'Strategy',
    color: 'purple'
  },
  {
    name: 'Pikalytics',
    url: 'https://pikalytics.com/',
    description: 'Usage statistics and move/item trends for Showdown and VGC ladder play.',
    category: 'Data',
    color: 'cyan'
  },
  {
    name: 'Victory Road',
    url: 'https://victoryroadvgc.com/',
    description: 'Leading resource for VGC (Official Circuit) news, team reports, and events.',
    category: 'VGC',
    color: 'red'
  },
  {
    name: 'Serebii.net',
    url: 'https://www.serebii.net/',
    description: 'The most comprehensive and up-to-date database for Pokémon game mechanics.',
    category: 'Database',
    color: 'green'
  },
  {
    name: 'Bulbapedia',
    url: 'https://bulbapedia.bulbagarden.net/',
    description: 'The community-driven Pokémon encyclopedia with detailed technical history.',
    category: 'Wiki',
    color: 'yellow'
  }
];

const Resources: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center mb-16 space-y-4">
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
          Scouting <span className="text-blue-500">Resources</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Expand your knowledge beyond the lab. These are the essential tools used by top-ladder players and tournament champions.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RESOURCES.map((res) => (
          <a
            key={res.name}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-gray-900/50 border border-gray-800 p-8 rounded-3xl hover:border-blue-500/50 transition-all hover:-translate-y-1 block shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-current opacity-70`}>
                  {res.category}
                </span>
                <span className="text-gray-600 group-hover:text-blue-400 transition-colors text-xl">
                  ↗
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors uppercase italic">
                {res.name}
              </h3>
              
              <p className="text-gray-400 text-sm leading-relaxed">
                {res.description}
              </p>
              
              <div className="pt-4 text-xs font-bold text-gray-500 group-hover:text-gray-300 transition-colors uppercase tracking-widest">
                Visit Site
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-20 p-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-3xl border border-blue-500/10 text-center">
        <h2 className="text-2xl font-bold text-white mb-4 italic">Want to suggest a resource?</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto text-sm">
          PKMN LABS is a community-driven project. If you have a guide, tool, or website that helped you climb the ladder, let us know!
        </p>
        <button className="px-8 py-3 bg-gray-900 border border-gray-700 hover:border-blue-500 text-white rounded-xl font-bold text-sm transition-all uppercase tracking-widest">
          Submit Suggestion
        </button>
      </div>
    </div>
  );
};

export default Resources;
