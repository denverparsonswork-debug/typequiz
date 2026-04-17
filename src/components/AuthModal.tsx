import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      login(data.token, data.username);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white text-2xl transition-colors"
        >
          ×
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            {isLogin ? 'Welcome Back' : 'Join the Lab'}
          </h2>
          <p className="text-gray-500 text-sm">
            {isLogin ? 'Access your training profile' : 'Start tracking your competitive progress'}
          </p>
        </div>

        <div className="flex bg-gray-800/50 p-1 rounded-xl">
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${isLogin ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${!isLogin ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-2 tracking-widest">Username</label>
            <input
              type="text"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Trainer Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-2 tracking-widest">Password</label>
            <input
              type="password"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center animate-shake">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-yellow-500 text-[10px] font-bold uppercase tracking-widest">
                <span>⚠️ Security Protocol</span>
              </div>
              <ul className="text-[10px] text-gray-500 space-y-1 list-disc ml-4">
                <li>Do NOT use your main password here.</li>
                <li>Passwords CANNOT be recovered if lost.</li>
                <li>No email is required, keeping you anonymous.</li>
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
          >
            {loading ? 'Processing...' : (isLogin ? 'Enter Lab' : 'Register Now')}
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">
          By continuing, you accept our training terms.
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
