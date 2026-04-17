import React, { useState, useEffect } from 'react';

interface ScoreEntry {
  _id: string;
  username: string;
  streak: number;
  mode: string;
  gameType: string;
  gen: number;
  createdAt: string;
}

interface LeaderboardGroup {
  _id: {
    gameType: string;
    mode: string;
  };
  topScores: ScoreEntry[];
}

interface LeaderboardProps {
  gen: number;
}

const GAME_TYPES = [
  { id: 'hard', label: 'Hard Mode', icon: '🔥' },
  { id: 'type-quiz', label: 'Type Matchup', icon: '⚔️' },
  { id: 'move-mastery', label: 'Move Mastery', icon: '🧩' },
  { id: 'ability-desc', label: 'Ability Oracle', icon: '🧿' },
  { id: 'pokemon-ability', label: 'Ability Synergy', icon: '🧬' },
];

const Leaderboard: React.FC<LeaderboardProps> = ({ gen }) => {
  const [activeTab, setActiveTab] = useState('hard');
  const [activeSubMode, setActiveSubMode] = useState('');
  const [data, setData] = useState<LeaderboardGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/leaderboard?gen=${gen}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [gen]);

  // Determine sub-modes based on activeTab
  const getSubModes = () => {
    if (activeTab === 'hard') return [];
    if (activeTab === 'type-quiz') return ['easy', 'dual'];
    if (activeTab === 'move-mastery') return ['effective', 'resist'];
    return ['standard'];
  };

  useEffect(() => {
    const modes = getSubModes();
    if (modes.length > 0) setActiveSubMode(modes[0]);
    else setActiveSubMode('');
  }, [activeTab]);

  const renderScoreList = (gameType: string, mode: string) => {
    const group = data.find(g => g._id.gameType === gameType && g._id.mode === mode);
    const scores = group?.topScores || [];

    return (
      <div className="space-y-2">
        {scores.length > 0 ? (
          scores.map((score, index) => (
            <div key={score._id} className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-800 rounded-2xl group hover:border-gray-700 transition-all">
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm ${
                  index === 0 ? 'bg-yellow-500 text-gray-950' : 
                  index === 1 ? 'bg-gray-300 text-gray-950' : 
                  index === 2 ? 'bg-amber-600 text-gray-950' : 'bg-gray-800 text-gray-400'
                }`}>
                  {index + 1}
                </span>
                <span className="font-bold text-white uppercase italic">{score.username}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-yellow-500">{score.streak}</span>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest hidden sm:inline">
                  {new Date(score.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-600 font-bold uppercase tracking-widest text-sm">
            No entries for this gen yet.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="text-center space-y-2">
        <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">
          Hall of <span className="text-blue-500">Fame</span>
        </h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Generation {gen} Rankings</p>
      </header>

      {/* Main Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
        {GAME_TYPES.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-2xl font-bold uppercase tracking-tighter whitespace-nowrap transition-all border-2 flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Sub-Tabs / Mode Selectors */}
        {activeTab !== 'hard' && getSubModes().length > 0 && (
          <div className="flex gap-2 border-b border-gray-800 pb-6">
            {getSubModes().map(mode => (
              <button
                key={mode}
                onClick={() => setActiveSubMode(mode)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeSubMode === mode 
                    ? 'bg-gray-700 text-blue-400' 
                    : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing Database...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {activeTab === 'hard' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] border-l-2 border-red-500 pl-3">Type Matchup</h3>
                  {renderScoreList('type-quiz', 'hard')}
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-purple-500 uppercase tracking-[0.2em] border-l-2 border-purple-500 pl-3">Move Mastery</h3>
                  {renderScoreList('move-mastery', 'hard')}
                </div>
                <div className="space-y-4 lg:col-span-2">
                  <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.2em] border-l-2 border-cyan-500 pl-3">Ability Synergy</h3>
                  {renderScoreList('pokemon-ability', 'hard')}
                </div>
              </div>
            ) : (
              <div>
                {renderScoreList(activeTab, activeSubMode)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
