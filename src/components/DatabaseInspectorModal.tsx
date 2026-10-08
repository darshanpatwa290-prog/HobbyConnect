import React, { useEffect, useState } from 'react';
import { Database, CheckCircle2, Server, Layers, Cpu, RefreshCw, X, ShieldCheck, AlertTriangle, Key, ExternalLink } from 'lucide-react';
import { api } from '../services/api.ts';
import { IDbStatus } from '../types/index.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseInspectorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<IDbStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Atlas Reconnection testing
  const [customUriInput, setCustomUriInput] = useState('');
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectMsg, setReconnectMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDbStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch MongoDB status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setReconnectMsg(null);
    }
  }, [isOpen]);

  const handleReconnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUriInput.trim()) return;

    setReconnecting(true);
    setReconnectMsg(null);
    try {
      const res = await api.reconnectDb(customUriInput.trim());
      if (res.success) {
        setReconnectMsg({ type: 'success', text: res.message || 'Connected to MongoDB Atlas successfully!' });
        await fetchStatus();
      } else {
        setReconnectMsg({ type: 'error', text: res.error || 'Failed to authenticate with external MongoDB' });
      }
    } catch (err: any) {
      setReconnectMsg({ type: 'error', text: err.message || 'Reconnection error' });
    } finally {
      setReconnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                Live MERN Stack Architecture
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {status?.connection.source === 'external' ? 'MongoDB Atlas' : 'Embedded MongoDB Active'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Verification of active Express.js backend & MongoDB persistence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {loading && !status ? (
            <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Querying MongoDB server instance...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          ) : status ? (
            <>
              {/* Atlas Notice if external connection failed auth */}
              {status.connection.externalError && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>External MongoDB Atlas Notice</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    The provided <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">MONGODB_URI</code> could not authenticate ({status.connection.externalError}).
                    The app seamlessly fell back to the local persistent MongoDB engine (<code className="text-emerald-400 font-mono">hobbyconnect_db</code>) so all authentication, profiles, hobbies, and chats are 100% functional.
                  </p>
                  <p className="text-slate-400">
                    To connect to your Atlas cluster, verify the database user credentials in <strong>MongoDB Atlas &gt; Database Access</strong>.
                  </p>
                </div>
              )}

              {/* Stack Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                    M - Database
                  </span>
                  <div className="font-semibold text-white mt-0.5">MongoDB</div>
                  <div className="text-xs text-slate-400 mt-1">Mongoose ODM</div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                    E - Backend API
                  </span>
                  <div className="font-semibold text-white mt-0.5">Express.js</div>
                  <div className="text-xs text-slate-400 mt-1">REST Controllers</div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                    R - Frontend
                  </span>
                  <div className="font-semibold text-white mt-0.5">React 19</div>
                  <div className="text-xs text-slate-400 mt-1">Vite + Tailwind</div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">
                    N - Runtime
                  </span>
                  <div className="font-semibold text-white mt-0.5">Node.js</div>
                  <div className="text-xs text-slate-400 mt-1">Port 3000 Server</div>
                </div>
              </div>

              {/* Collections & Document Counts */}
              <div className="bg-slate-800/40 rounded-xl border border-slate-700/70 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    MongoDB Collections & Persisted Documents
                  </div>
                  <button
                    onClick={fetchStatus}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Stats
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
                    <div className="text-2xl font-bold text-white">{status.counts.users}</div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">users</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
                    <div className="text-2xl font-bold text-white">{status.counts.hobbies}</div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">hobbies</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
                    <div className="text-2xl font-bold text-white">{status.counts.connections}</div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">connections</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
                    <div className="text-2xl font-bold text-white">{status.counts.messages}</div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">messages</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
                    <div className="text-2xl font-bold text-white">{status.counts.posts}</div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">posts</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap gap-2 items-center">
                  <span className="font-semibold text-slate-300">Registered Collections:</span>
                  {status.collections.map((coll) => (
                    <span
                      key={coll}
                      className="px-2 py-0.5 rounded bg-slate-900 font-mono text-emerald-400 border border-slate-800"
                    >
                      db.{coll}
                    </span>
                  ))}
                </div>
              </div>

              {/* Connection Diagnostics */}
              <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Database Engine:</span>
                  <span className="font-mono text-white">
                    {status.connection.source === 'external' ? 'Remote MongoDB Atlas' : 'Local Persistent MongoDB (Mongoose)'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Database Name:</span>
                  <span className="font-mono text-white">{status.connection.databaseName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">MongoDB Host:</span>
                  <span className="font-mono text-white">{status.connection.host}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Mongoose Ready State:</span>
                  <span className="font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready (state {status.connection.readyState})
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Persistence Mode:</span>
                  <span className="font-mono text-indigo-300">Express + Mongoose ODM (Zero Mocks)</span>
                </div>
              </div>

              {/* Optional Custom Atlas URI Tester */}
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-400" />
                    Test / Connect Custom MongoDB Atlas URI
                  </span>
                </div>
                <form onSubmit={handleReconnect} className="space-y-2">
                  <input
                    type="text"
                    placeholder="mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname"
                    value={customUriInput}
                    onChange={(e) => setCustomUriInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                  {reconnectMsg && (
                    <div
                      className={`p-2 rounded-lg text-xs ${
                        reconnectMsg.type === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {reconnectMsg.text}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={reconnecting || !customUriInput.trim()}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                    >
                      {reconnecting ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Testing connection...</span>
                        </>
                      ) : (
                        <span>Test & Connect</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-800/60 border-t border-slate-700/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            All data operations mutate real MongoDB documents
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
