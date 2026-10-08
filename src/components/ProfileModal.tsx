import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Award, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { IHobby, IUserHobby } from '../types/index.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');
  const [hobbies, setHobbies] = useState<IUserHobby[]>([]);
  const [allHobbies, setAllHobbies] = useState<IHobby[]>([]);

  // Add hobby helper state
  const [selectedHobbyId, setSelectedHobbyId] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Mentor'>('Intermediate');
  const [years, setYears] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setAvailability(user.availability || '');
      setHobbies(user.hobbies ? [...user.hobbies] : []);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      api.getHobbies().then((res) => {
        setAllHobbies(res.hobbies || []);
        if (res.hobbies && res.hobbies.length > 0) {
          setSelectedHobbyId(res.hobbies[0]._id);
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleAddHobby = () => {
    if (!selectedHobbyId) return;
    const found = allHobbies.find((h) => h._id === selectedHobbyId);
    if (!found) return;

    if (hobbies.some((h) => h.hobbyName.toLowerCase() === found.name.toLowerCase())) {
      setError(`"${found.name}" is already in your profile hobbies.`);
      return;
    }

    setHobbies([
      ...hobbies,
      {
        hobbyId: found._id,
        hobbyName: found.name,
        skillLevel: selectedSkill,
        yearsExperience: Number(years) || 1,
      },
    ]);
    setError(null);
  };

  const handleRemoveHobby = (index: number) => {
    setHobbies(hobbies.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile({
        name,
        avatar,
        bio,
        location,
        availability,
        hobbies,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Edit Profile & Hobbies</h3>
              <p className="text-xs text-gray-500">Update your interests, bio, and skill proficiencies</p>
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
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium">
              Profile updated successfully!
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Avatar Image URL</label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Availability & Practice Times
            </label>
            <input
              type="text"
              placeholder="e.g. Weekends, Thursday evenings, Remote sessions"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition"
            />
          </div>

          {/* Hobbies Section */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                My Hobbies & Skill Levels
              </span>
              <span className="text-[11px] text-gray-500 font-medium">{hobbies.length} added</span>
            </div>

            {/* List of Current Hobbies */}
            <div className="space-y-2">
              {hobbies.map((h, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200/80"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">{h.hobbyName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                      {h.skillLevel}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {h.yearsExperience || 1} yr{h.yearsExperience === 1 ? '' : 's'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveHobby(idx)}
                    className="p-1 text-gray-400 hover:text-rose-600 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Hobby Form */}
            <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-200 space-y-2">
              <div className="text-[11px] font-semibold text-gray-700">Add a hobby to profile:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={selectedHobbyId}
                  onChange={(e) => setSelectedHobbyId(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-indigo-600"
                >
                  {allHobbies.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-indigo-600"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Mentor">Mentor</option>
                </select>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    placeholder="Yrs"
                    className="w-16 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddHobby}
                    className="flex-1 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>
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
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
