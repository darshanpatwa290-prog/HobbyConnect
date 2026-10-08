import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  onNavigate: (tab: 'landing' | 'discover' | 'hobbies' | 'connections' | 'messages' | 'feed') => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-gray-200 bg-gray-50/70 text-gray-600 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-gray-200">
          {/* Left Column: Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-indigo-100" />
              </div>
              <span className="font-bold text-base text-gray-900 tracking-tight">Hobby Connect</span>
            </div>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Find your people. Share your passion. A modern platform connecting hobbyists through shared interests, skill swaps, and real-time community chat.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-gray-900 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('discover')}
                  className="hover:text-indigo-600 transition-colors text-left"
                >
                  Discover
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('hobbies')}
                  className="hover:text-indigo-600 transition-colors text-left"
                >
                  Hobbies Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('discover')}
                  className="hover:text-indigo-600 transition-colors text-left"
                >
                  Matches
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('feed')}
                  className="hover:text-indigo-600 transition-colors text-left"
                >
                  Community Feed
                </button>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-gray-900 uppercase tracking-wider">Community</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('connections')}
                  className="hover:text-indigo-600 transition-colors text-left"
                >
                  My Network
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('messages')}
                  className="hover:text-indigo-600 transition-colors text-left"
                >
                  Direct Messages
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('feed')}
                  className="hover:text-indigo-600 transition-colors text-left"
                >
                  Events & Meetups
                </button>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-gray-900 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('landing')}
                  className="hover:text-indigo-600 transition-colors text-left"
                >
                  About
                </button>
              </li>
              <li>
                <span className="hover:text-indigo-600 transition-colors cursor-pointer">
                  Contact
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-600 transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-600 transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Developer Credit */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            &copy; 2026 Hobby Connect. All rights reserved.
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400">Crafted with care</span>
            <span>•</span>
            <span className="font-semibold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200/80 inline-flex items-center gap-1.5">
              <span>Developed by Darshan Patwa</span>
              <span className="text-gray-400 font-normal">|</span>
              <a
                href="mailto:darshanpatwa290@gmail.com"
                className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2 transition-colors"
              >
                darshanpatwa290@gmail.com
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
