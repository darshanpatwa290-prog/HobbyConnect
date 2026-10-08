import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  MapPin,
  Clock,
  HeartHandshake,
  MessageSquare,
  Clock3,
  UserCheck,
  RefreshCw,
  Award,
  ChevronRight,
  Eye,
  X,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { IUser, IHobby } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ConnectModal } from './ConnectModal.tsx';

interface Props {
  onStartChat: (userId: string) => void;
  onOpenAuth: () => void;
  onOpenConnections: () => void;
}

export const DiscoverView: React.FC<Props> = ({
  onStartChat,
  onOpenAuth,
  onOpenConnections,
}) => {
  const { user, refreshUser } = useAuth();
  const [users, setUsers] = useState<IUser[]>([]);
  const [hobbies, setHobbies] = useState<IHobby[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHobby, setSelectedHobby] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [onlyMutualMatches, setOnlyMutualMatches] = useState(false);

  // Modals
  const [targetConnectUser, setTargetConnectUser] = useState<IUser | null>(null);
  const [previewUser, setPreviewUser] = useState<IUser | null>(null);
  const [joiningHobbyName, setJoiningHobbyName] = useState<string | null>(null);

  const fetchDiscoverData = async () => {
    setLoading(true);
    try {
      const [usersRes, hobbiesRes] = await Promise.all([
        api.getUsers({
          query: searchQuery || undefined,
          hobby: selectedHobby !== 'All' ? selectedHobby : undefined,
          skillLevel: selectedSkill !== 'All' ? selectedSkill : undefined,
          location: selectedLocation.trim() || undefined,
        }),
        api.getHobbies(),
      ]);
      setUsers(usersRes.users || []);
      setHobbies(hobbiesRes.hobbies || []);
    } catch (err) {
      console.error('Error fetching discover data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoverData();
  }, [user, selectedHobby, selectedSkill]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDiscoverData();
  };

  const handleQuickJoinHobby = async (hobbyName: string) => {
    const found = hobbies.find((h) => h.name.toLowerCase() === hobbyName.toLowerCase());
    if (!found) return;

    setJoiningHobbyName(hobbyName);
    try {
      await api.joinHobby(found._id, 'Intermediate');
      await refreshUser();
      await fetchDiscoverData();
    } catch (err) {
      console.error('Failed to join hobby:', err);
    } finally {
      setJoiningHobbyName(null);
    }
  };

  const displayedUsers = users.filter((u) => {
    if (!onlyMutualMatches) return true;
    return u.sharedHobbyNames && u.sharedHobbyNames.length > 0;
  });

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Find Your Hobby People
          </h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            Collaborate with unidentifiable craft partners based strictly on matched hobbies, skills, and practice goals.
          </p>
        </div>

        {/* Mutual Match Filter Toggle */}
        {user && (
          <button
            type="button"
            onClick={() => setOnlyMutualMatches(!onlyMutualMatches)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 cursor-pointer ${
              onlyMutualMatches
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${onlyMutualMatches ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span>Only Mutual Hobby Matches</span>
          </button>
        )}
      </div>

      {/* SEARCH & FILTERS CARD */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 card-shadow space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by craft handle, hobby, location, or project beta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            {/* Hobby Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Hobby
              </label>
              <select
                value={selectedHobby}
                onChange={(e) => setSelectedHobby(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 text-xs font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="All">All Hobbies</option>
                {hobbies.map((h) => (
                  <option key={h._id} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Level Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Skill Level
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 text-xs font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Mentor">Mentor</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Pacific Northwest"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 text-xs font-medium focus:outline-none focus:border-indigo-600 placeholder:text-gray-400"
              />
            </div>

            {/* Filter Action */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer h-[38px]"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Apply Filter</span>
              </button>

              {(searchQuery || selectedHobby !== 'All' || selectedSkill !== 'All' || selectedLocation || onlyMutualMatches) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedHobby('All');
                    setSelectedSkill('All');
                    setSelectedLocation('');
                    setOnlyMutualMatches(false);
                  }}
                  className="px-3 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-500 text-xs font-medium h-[38px] transition cursor-pointer"
                  title="Clear filters"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* USERS GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="text-xs font-medium">Finding craft collaborators...</span>
        </div>
      ) : displayedUsers.length === 0 ? (
        <div className="p-14 text-center bg-white rounded-2xl border border-gray-200 card-shadow space-y-3">
          <Sparkles className="w-8 h-8 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No craft partners found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {onlyMutualMatches
              ? 'None of the available collaborators share your current profile hobbies. Try clearing "Only Mutual Hobby Matches" or joining more hobbies.'
              : 'Try adjusting your search filters or selecting another category.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedHobby('All');
              setSelectedSkill('All');
              setSelectedLocation('');
              setOnlyMutualMatches(false);
            }}
            className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedUsers.map((target) => {
            const matchScore = target.matchScore || 50;
            const hasMutualHobby = target.sharedHobbyNames && target.sharedHobbyNames.length > 0;

            return (
              <div
                key={target._id}
                className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between card-shadow hover:-translate-y-0.5 hover:border-gray-300 card-shadow-hover transition-all duration-200 group"
              >
                <div className="space-y-4">
                  {/* Card Header: Craft Avatar + Handle + Match Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={target.avatar}
                        alt={target.name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {target.name}
                          </h3>
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          @{target.username}
                        </div>
                      </div>
                    </div>

                    {user && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          hasMutualHobby
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>{matchScore}% Synergy</span>
                      </span>
                    )}
                  </div>

                  {/* Location & Availability */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {target.location || 'Remote'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {target.availability || 'Flexible'}
                    </span>
                  </div>

                  {/* Short Bio / Project Focus */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {target.bio}
                  </p>

                  {/* Mutual Interests / Match Verification */}
                  {hasMutualHobby ? (
                    <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-100 space-y-1.5">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Mutual Craft Match ({target.sharedHobbyNames?.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {target.sharedHobbyNames?.map((name, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 font-medium"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : user ? (
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-[11px]">No mutual hobby yet. Join their craft to collaborate!</span>
                    </div>
                  ) : null}

                  {/* Skills & Hobbies Badges */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Active Craft & Techniques
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {target.hobbies.map((h, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium border border-gray-200/60"
                        >
                          {h.hobbyName}{' '}
                          <span className="text-gray-400 font-normal">({h.skillLevel})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: View Profile & Connect */}
                <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => setPreviewUser(target)}
                    className="flex-1 py-2 px-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-500" />
                    <span>View Craft</span>
                  </button>

                  {!user ? (
                    <button
                      onClick={onOpenAuth}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>Sign In to Match</span>
                    </button>
                  ) : target.relationship === 'connected' ? (
                    <button
                      onClick={() => onStartChat(target._id)}
                      className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Open Chat</span>
                    </button>
                  ) : target.relationship === 'pending_outgoing' ? (
                    <div className="flex-1 py-2 px-3 bg-gray-50 border border-gray-200 text-amber-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5">
                      <Clock3 className="w-3.5 h-3.5" />
                      <span>Request Sent</span>
                    </div>
                  ) : target.relationship === 'pending_incoming' ? (
                    <button
                      onClick={onOpenConnections}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Respond</span>
                    </button>
                  ) : hasMutualHobby ? (
                    <button
                      onClick={() => setTargetConnectUser(target)}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>Connect Partner</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (target.hobbies.length > 0) {
                          handleQuickJoinHobby(target.hobbies[0].hobbyName);
                        }
                      }}
                      disabled={joiningHobbyName !== null}
                      className="flex-1 py-2 px-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Join this collaborator's hobby to unlock connecting"
                    >
                      {joiningHobbyName ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>Join Craft to Connect</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect Modal */}
      <ConnectModal
        targetUser={targetConnectUser}
        isOpen={!!targetConnectUser}
        onClose={() => setTargetConnectUser(null)}
        onSuccess={() => {
          fetchDiscoverData();
        }}
      />

      {/* View Profile Drawer / Modal */}
      {previewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <img
                    src={previewUser.avatar}
                    alt={previewUser.name}
                    className="w-14 h-14 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <h3 className="font-bold text-base text-gray-900">{previewUser.name}</h3>
                    <div className="text-xs text-gray-400 font-mono">@{previewUser.username}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{previewUser.location}</div>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewUser(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-700">Craft Focus & Practice Goals</div>
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {previewUser.bio}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-700">Hobbies & Proficiency</div>
                <div className="space-y-2">
                  {previewUser.hobbies.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50 text-xs"
                    >
                      <span className="font-semibold text-gray-900">{h.hobbyName}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-indigo-700 font-medium">
                        {h.skillLevel} ({h.yearsExperience || 1} yr{h.yearsExperience === 1 ? '' : 's'})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  onClick={() => setPreviewUser(null)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Close
                </button>
                {user && previewUser.relationship === 'connected' ? (
                  <button
                    onClick={() => {
                      const id = previewUser._id;
                      setPreviewUser(null);
                      onStartChat(id);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Open Chat
                  </button>
                ) : user && previewUser.relationship === 'none' ? (
                  <button
                    onClick={() => {
                      const u = previewUser;
                      setPreviewUser(null);
                      setTargetConnectUser(u);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Connect Partner
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
