import React, { useState } from 'react';
import { X, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Form states
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(loginValue, password);
      } else {
        await register({
          name,
          username,
          email,
          password,
          bio: 'Passionate hobbyist looking for practice partners!',
          location: location || 'San Francisco, CA',
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSwitch = async (uname: string) => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(uname);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-gray-900">
              {mode === 'login' ? 'Sign In to Hobby Connect' : 'Create an Account'}
            </h3>
            <p className="text-xs text-gray-500">
              {mode === 'login'
                ? 'Welcome back! Connect with your hobby circle'
                : 'Join communities and find practice partners'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Quick Demo Switcher Section */}
          <div className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Quick 1-Click Demo Profiles
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Instant login as pre-configured accounts to evaluate 2-sided matchmaking and real-time chat:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDemoSwitch('brewlab_481')}
                disabled={loading}
                className="flex items-center gap-2 p-2 rounded-lg bg-white hover:bg-indigo-50/50 border border-gray-200 hover:border-indigo-200 text-left transition group"
              >
                <img
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=60&auto=format&fit=crop&q=80"
                  alt="BrewLab"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-900 group-hover:text-indigo-600">BrewLab_#481</div>
                  <div className="text-[10px] text-gray-500 truncate">Coffee & Climbing</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSwitch('patchbay_812')}
                disabled={loading}
                className="flex items-center gap-2 p-2 rounded-lg bg-white hover:bg-indigo-50/50 border border-gray-200 hover:border-indigo-200 text-left transition group"
              >
                <img
                  src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=60&auto=format&fit=crop&q=80"
                  alt="PatchBay"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-900 group-hover:text-indigo-600">PatchBay_#812</div>
                  <div className="text-[10px] text-gray-500 truncate">Synths & GameDev</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSwitch('cragbeta_309')}
                disabled={loading}
                className="flex items-center gap-2 p-2 rounded-lg bg-white hover:bg-indigo-50/50 border border-gray-200 hover:border-indigo-200 text-left transition group"
              >
                <img
                  src="https://images.unsplash.com/photo-1522163182402-834f871fd851?w=60&auto=format&fit=crop&q=80"
                  alt="CragBeta"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-900 group-hover:text-indigo-600">CragBeta_#309</div>
                  <div className="text-[10px] text-gray-500 truncate">Bouldering V8</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSwitch('claystudio_640')}
                disabled={loading}
                className="flex items-center gap-2 p-2 rounded-lg bg-white hover:bg-indigo-50/50 border border-gray-200 hover:border-indigo-200 text-left transition group"
              >
                <img
                  src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=60&auto=format&fit=crop&q=80"
                  alt="ClayStudio"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-900 group-hover:text-indigo-600">ClayStudio_#640</div>
                  <div className="text-[10px] text-gray-500 truncate">Ceramics & Plants</div>
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Or {mode === 'login' ? 'continue with password' : 'create new credentials'}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Lee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. jordan_maker"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Austin, TX"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </>
            )}

            {mode === 'login' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email or Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="alex_brew or alex@hobbyconnect.dev"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition"
                />
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Create Account
                </>
              )}
            </button>
          </form>

          {/* Toggle login/register */}
          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
            {mode === 'login' ? (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2 ml-1"
                >
                  Register here
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2 ml-1"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
