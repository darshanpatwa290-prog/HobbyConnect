import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Users,
  CheckCircle,
  Sparkles,
  ArrowRight,
  UserPlus,
  RefreshCw,
  X,
} from 'lucide-react';
import { IHobby, IUser } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface Props {
  onOpenCreateHobby: () => void;
  onOpenAuth: () => void;
  onSelectUserForChat: (userId: string) => void;
  initialCategory?: string;
}

export const HobbiesView: React.FC<Props> = ({
  onOpenCreateHobby,
  onOpenAuth,
  onSelectUserForChat,
  initialCategory,
}) => {
  const { user, refreshUser } = useAuth();
  const [hobbies, setHobbies] = useState<IHobby[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [joiningHobbyId, setJoiningHobbyId] = useState<string | null>(null);

  // Hobby members modal
  const [activeHobbyDetail, setActiveHobbyDetail] = useState<{
    hobby: IHobby;
    members: IUser[];
  } | null>(null);

  const categories = [
    'All',
    'Sports & Outdoors',
    'Creative & Arts',
    'Tech & Gaming',
    'Music & Audio',
    'Culinary & Food',
    'Learning & Science',
    'Lifestyle & Wellness',
  ];

  const fetchHobbies = async () => {
    setLoading(true);
    try {
      const res = await api.getHobbies({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: search.trim() || undefined,
      });
      setHobbies(res.hobbies || []);
    } catch (err) {
      console.error('Fetch hobbies error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHobbies();
  }, [selectedCategory, user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHobbies();
  };

  const handleToggleJoin = async (hobby: IHobby) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setJoiningHobbyId(hobby._id);
    try {
      if (hobby.isJoined) {
        await api.leaveHobby(hobby._id);
      } else {
        await api.joinHobby(hobby._id, 'Intermediate');
      }
      await refreshUser();
      await fetchHobbies();
    } catch (err) {
      console.error('Join/Leave error:', err);
    } finally {
      setJoiningHobbyId(null);
    }
  };

  const handleOpenHobbyMembers = async (hobbyId: string) => {
    try {
      const res = await api.getHobbyById(hobbyId);
      setActiveHobbyDetail({
        hobby: res.hobby,
        members: res.members || [],
      });
    } catch (err) {
      console.error('Error fetching hobby detail:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Hobby Communities & Hubs
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Browse through passion collectives, join hobby groups, meet partners, or create your own community.
          </p>
        </div>
        <button
          onClick={() => {
            if (!user) onOpenAuth();
            else onOpenCreateHobby();
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Custom Hobby
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 card-shadow space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search hobbies by title, description or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition placeholder:text-gray-400"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hobbies Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="text-xs font-medium">Loading hobby communities...</span>
        </div>
      ) : hobbies.length === 0 ? (
        <div className="p-14 text-center bg-white rounded-2xl border border-gray-200 card-shadow space-y-3">
          <Sparkles className="w-8 h-8 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No hobbies found in this category</h3>
          <p className="text-xs text-gray-500">
            Be the first to create one for this interest!
          </p>
          <button
            onClick={onOpenCreateHobby}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Create Hobby Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hobbies.map((hobby) => (
            <div
              key={hobby._id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col justify-between card-shadow hover:-translate-y-0.5 hover:border-gray-300 card-shadow-hover transition-all duration-200 group"
            >
              <div>
                {/* Banner Image */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={hobby.bannerImage}
                    alt={hobby.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-gray-800 shadow-xs">
                    {hobby.category}
                  </div>

                  {/* Difficulty Pill */}
                  <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-indigo-50/95 backdrop-blur-xs text-[10px] font-bold text-indigo-700 border border-indigo-100">
                    {hobby.difficulty}
                  </div>

                  {/* Members Counter */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    <span>{hobby.memberCount || 0} members</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {hobby.name}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {hobby.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hobby.tags?.slice(0, 4).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleOpenHobbyMembers(hobby._id)}
                  className="text-xs text-gray-600 hover:text-indigo-600 font-semibold flex items-center gap-1 transition"
                >
                  <span>View Members</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleToggleJoin(hobby)}
                  disabled={joiningHobbyId === hobby._id}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    hobby.isJoined
                      ? 'bg-emerald-50 hover:bg-rose-50 text-emerald-700 hover:text-rose-700 border border-emerald-200 hover:border-rose-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  {joiningHobbyId === hobby._id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : hobby.isJoined ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Joined</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Join Hobby</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hobby Members Modal */}
      {activeHobbyDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  {activeHobbyDetail.hobby.name}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                    {activeHobbyDetail.members.length} Members
                  </span>
                </h3>
                <p className="text-xs text-gray-500">{activeHobbyDetail.hobby.category}</p>
              </div>
              <button
                onClick={() => setActiveHobbyDetail(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2.5">
              {activeHobbyDetail.members.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No members yet. Be the first to join!
                </div>
              ) : (
                activeHobbyDetail.members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/70"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{member.name}</div>
                        <div className="text-xs text-gray-500">
                          @{member.username} • {member.location}
                        </div>
                      </div>
                    </div>
                    {user && user._id !== member._id && (
                      <button
                        onClick={() => {
                          setActiveHobbyDetail(null);
                          onSelectUserForChat(member._id);
                        }}
                        className="px-3 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
                      >
                        Message
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-right">
              <button
                onClick={() => setActiveHobbyDetail(null)}
                className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
