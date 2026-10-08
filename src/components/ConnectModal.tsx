import React, { useState } from 'react';
import { X, Send, HeartHandshake } from 'lucide-react';
import { IUser } from '../types/index.ts';
import { api } from '../services/api.ts';

interface Props {
  targetUser: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ConnectModal: React.FC<Props> = ({ targetUser, isOpen, onClose, onSuccess }) => {
  const [introMessage, setIntroMessage] = useState('');
  const [hobbyContext, setHobbyContext] = useState(
    targetUser?.hobbies?.[0]?.hobbyName || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.sendConnectionRequest(
        targetUser._id,
        introMessage.trim() || undefined,
        hobbyContext || undefined
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send connection request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Partner Up with {targetUser.name}</h3>
              <p className="text-xs text-gray-500 font-mono">@{targetUser.username} • {targetUser.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* User Preview */}
          <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <img
              src={targetUser.avatar}
              alt={targetUser.name}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900">{targetUser.name}</div>
              <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{targetUser.bio}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {targetUser.hobbies.map((h, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white text-gray-700 border border-gray-200 font-medium"
                  >
                    {h.hobbyName} • {h.skillLevel}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Shared Hobby Context Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mutual Hobby Collaboration Topic *
            </label>
            <select
              value={hobbyContext}
              onChange={(e) => setHobbyContext(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              {targetUser.hobbies.map((h, idx) => (
                <option key={idx} value={h.hobbyName}>
                  {h.hobbyName} ({h.skillLevel})
                </option>
              ))}
            </select>
          </div>

          {/* Custom Intro Message */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Practice Goal or Collaboration Note
            </label>
            <textarea
              rows={3}
              placeholder={`Hi ${targetUser.name}, noticed you're practicing ${
                hobbyContext || 'this craft'
              }! Looking for a collaborator to swap techniques and practice together.`}
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition resize-none placeholder:text-gray-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {loading ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
