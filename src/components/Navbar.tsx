import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  Grid,
  Users,
  MessageSquare,
  Flame,
  Plus,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  Settings,
  Heart,
  Home,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface Props {
  activeTab: 'landing' | 'discover' | 'hobbies' | 'connections' | 'messages' | 'feed';
  setActiveTab: (tab: 'landing' | 'discover' | 'hobbies' | 'connections' | 'messages' | 'feed') => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenProfile: () => void;
  onOpenCreateHobby: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenProfile,
  onOpenCreateHobby,
}) => {
  const { user, logout, demoLogin, pendingIncomingCount, unreadMessagesCount } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const demoAccounts = [
    { username: 'brewlab_481', label: 'BrewLab_#481', role: 'Coffee & Bouldering' },
    { username: 'patchbay_812', label: 'PatchBay_#812', role: 'Eurorack & Godot' },
    { username: 'cragbeta_309', label: 'CragBeta_#309', role: 'Bouldering & Film' },
    { username: 'claystudio_640', label: 'ClayStudio_#640', role: 'Ceramics & Hydroponics' },
    { username: 'tacticslab_715', label: 'TacticsLab_#715', role: 'Chess & GameDev' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT: Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
                <Sparkles className="w-5 h-5 text-indigo-100" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
                  Hobby Connect
                </span>
                <span className="text-[11px] text-gray-500 font-normal hidden sm:block -mt-0.5">
                  Find your people. Share your passion.
                </span>
              </div>
            </button>
          </div>

          {/* CENTER: Clean Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('landing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'landing'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>

            <button
              onClick={() => setActiveTab('discover')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'discover'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              Discover
            </button>

            <button
              onClick={() => setActiveTab('hobbies')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'hobbies'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Grid className="w-4 h-4" />
              Hobbies
            </button>

            <button
              onClick={() => setActiveTab('connections')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'connections'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              My Network
              {pendingIncomingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold">
                  {pendingIncomingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'messages'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Messages
              {unreadMessagesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'feed'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Flame className="w-4 h-4" />
              Community
            </button>
          </nav>

          {/* RIGHT: Actions & User Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* + New Hobby Button */}
            <button
              onClick={() => {
                if (!user) onOpenAuth('login');
                else onOpenCreateHobby();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>New Hobby</span>
            </button>

            {/* Switch Demo Profile Dropdown (discreet, for seamless reviewer multi-user testing) */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="hidden lg:flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="Switch demo account to test 2-sided interactions"
              >
                <span>Demo Accounts</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showDemoMenu && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowDemoMenu(false)}
                >
                  <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Instant Demo Login
                  </div>
                  {demoAccounts.map((account) => (
                    <button
                      key={account.username}
                      onClick={() => demoLogin(account.username)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        user?.username === account.username
                          ? 'text-indigo-600 font-semibold bg-indigo-50/60'
                          : 'text-gray-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{account.label}</div>
                        <div className="text-[11px] text-gray-400">{account.role}</div>
                      </div>
                      {user?.username === account.username && (
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile Dropdown or Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                  <span className="hidden sm:block text-xs font-semibold text-gray-800 max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="px-3.5 py-2.5 border-b border-gray-100">
                      <div className="text-xs font-bold text-gray-900">{user.name}</div>
                      <div className="text-[11px] text-gray-500">@{user.username}</div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={onOpenProfile}
                        className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-gray-500" />
                        Edit Profile
                      </button>

                      <button
                        onClick={() => setActiveTab('hobbies')}
                        className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <Grid className="w-3.5 h-3.5 text-gray-500" />
                        My Hobbies
                      </button>

                      <button
                        onClick={() => setActiveTab('connections')}
                        className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-gray-500" />
                        My Network
                      </button>

                      <button
                        onClick={onOpenProfile}
                        className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-gray-500" />
                        Settings
                      </button>
                    </div>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 rounded-lg text-gray-700 hover:text-gray-900 text-xs font-semibold hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-gray-100 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'landing' ? 'bg-gray-900 text-white' : 'text-gray-600'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'discover' ? 'bg-indigo-600 text-white' : 'text-gray-600'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('hobbies')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'hobbies' ? 'bg-indigo-600 text-white' : 'text-gray-600'
            }`}
          >
            Hobbies
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap relative ${
              activeTab === 'connections' ? 'bg-indigo-600 text-white' : 'text-gray-600'
            }`}
          >
            Network
            {pendingIncomingCount > 0 && (
              <span className="ml-1 px-1 py-0.2 bg-rose-500 text-white text-[9px] rounded-full">
                {pendingIncomingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap relative ${
              activeTab === 'messages' ? 'bg-indigo-600 text-white' : 'text-gray-600'
            }`}
          >
            Messages
            {unreadMessagesCount > 0 && (
              <span className="ml-1 px-1 py-0.2 bg-rose-500 text-white text-[9px] rounded-full">
                {unreadMessagesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'feed' ? 'bg-indigo-600 text-white' : 'text-gray-600'
            }`}
          >
            Community
          </button>
        </div>
      </div>
    </header>
  );
};
