import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { api } from '../services/api.ts';
import { IHobby } from '../types/index.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (hobby: IHobby) => void;
}

export const CreateHobbyModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Creative & Arts');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [difficulty, setDifficulty] = useState<string>('All Levels');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError('Name and description are required');
      return;
    }

    setLoading(true);
    setError(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await api.createHobby({
        name: name.trim(),
        category: category as any,
        description: description.trim(),
        tags: tags.length ? tags : [name.trim()],
        bannerImage:
          bannerImage.trim() ||
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        difficulty: difficulty as any,
      });
      onCreated(res.hobby);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create hobby');
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
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Create New Hobby Community</h3>
              <p className="text-xs text-gray-500">Launch a collective for practice and discussion</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Hobby Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Drone Racing, Sourdough Baking, Bonsai..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="Sports & Outdoors">Sports & Outdoors</option>
                <option value="Creative & Arts">Creative & Arts</option>
                <option value="Tech & Gaming">Tech & Gaming</option>
                <option value="Music & Audio">Music & Audio</option>
                <option value="Culinary & Food">Culinary & Food</option>
                <option value="Learning & Science">Learning & Science</option>
                <option value="Lifestyle & Wellness">Lifestyle & Wellness</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="All Levels">All Levels</option>
                <option value="Beginner Friendly">Beginner Friendly</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description *</label>
            <textarea
              rows={3}
              required
              placeholder="What makes this hobby exciting? What will members learn or share?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. FPV, Quadcopters, Solder, Racing"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Banner Image URL (optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition"
            />
          </div>

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
                <span>Creating...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Hobby</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
