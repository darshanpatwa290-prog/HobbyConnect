import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Users,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Heart,
  TrendingUp,
  MapPin,
  Flame,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface Props {
  onGoToDiscover: () => void;
  onGoToHobbies: (categoryFilter?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const LandingView: React.FC<Props> = ({
  onGoToDiscover,
  onGoToHobbies,
  onOpenAuth,
}) => {
  const { user } = useAuth();

  const popularHobbies = [
    { name: 'Art & Drawing', icon: '🎨', members: '1,420 members', category: 'Creative & Arts' },
    { name: 'Music & Production', icon: '🎸', members: '2,890 members', category: 'Music & Audio' },
    { name: 'Photography', icon: '📷', members: '3,150 members', category: 'Creative & Arts' },
    { name: 'Fitness & Climbing', icon: '🏋️', members: '4,200 members', category: 'Sports & Outdoors' },
    { name: 'Coding & Game Dev', icon: '💻', members: '5,600 members', category: 'Tech & Gaming' },
    { name: 'Reading & Philosophy', icon: '📚', members: '1,890 members', category: 'Learning & Science' },
    { name: 'Gaming & Strategy', icon: '🎮', members: '6,340 members', category: 'Tech & Gaming' },
    { name: 'Adventure & Outdoors', icon: '🏔️', members: '3,800 members', category: 'Sports & Outdoors' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Choose Your Hobbies',
      desc: "Tell us what you're passionate about, your experience level, and what you want to learn next.",
    },
    {
      num: '02',
      title: 'Discover Your Matches',
      desc: 'Find people with shared interests, complementary skill levels, and compatible availability.',
    },
    {
      num: '03',
      title: 'Connect & Create',
      desc: 'Send connection invites, exchange project ideas in direct chat, and practice together.',
    },
  ];

  const features = [
    {
      title: 'Smart Hobby Matching',
      desc: 'Our synergy algorithm finds collaborators whose skills and experience complement yours perfectly.',
      icon: Sparkles,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Find Practice Partners',
      desc: 'Whether looking for a rock climbing belayer, synth jam partner, or code buddy, connect quickly.',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Build Your Network',
      desc: 'Create and grow personal relationships around shared interests, local meetups, and creative passions.',
      icon: Award,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Real-Time Conversations',
      desc: 'Chat directly, attach topic tags, share technique tips, and coordinate your next session seamlessly.',
      icon: MessageSquare,
      color: 'bg-violet-50 text-violet-600',
    },
  ];

  const stats = [
    { label: 'Hobbyists', value: '10K+' },
    { label: 'Hobbies', value: '500+' },
    { label: 'Connections', value: '25K+' },
    { label: 'Positive Matches', value: '98%' },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 pb-8 sm:pb-16 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Small Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold shadow-xs">
            <span>✨ Find people who share your passion</span>
          </div>

          {/* Large Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.12]">
            Turn Your Hobbies <br />
            <span className="text-indigo-600">Into Real Connections.</span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            Discover people who share your interests, find practice partners, exchange skills, and build meaningful communities around the things you love.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGoToDiscover}
              className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Find My Hobby Match</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onGoToHobbies()}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-sm rounded-xl transition-all cursor-pointer"
            >
              Explore Hobbies
            </button>
          </div>
        </div>

        {/* HERO VISUAL MOCKUP */}
        <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
          <div className="bg-gradient-to-b from-gray-50/80 to-white p-3 sm:p-6 rounded-2xl border border-gray-200/90 shadow-xl">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-6">
              {/* Header inside mockup */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-semibold text-gray-500">
                    Hobby Connect Match Preview
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3 Mutual Hobbies Detected</span>
                </div>
              </div>

              {/* Mockup Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mock Card 1 */}
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100&auto=format&fit=crop&q=80"
                        alt="BrewLab"
                        className="w-11 h-11 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <div className="font-bold text-sm text-gray-900">BrewLab_#481</div>
                        <div className="text-xs text-gray-500">Pacific Northwest • Weekends</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                      94% Match
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    "Coffee brewing nerd (V60 & Espresso) and projecting V6 boulder problems. Looking for crag partners!"
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 font-medium">
                      ☕ Specialty Coffee (Advanced)
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 font-medium">
                      🧗 Bouldering (Intermediate)
                    </span>
                  </div>
                </div>

                {/* Mock Card 2 */}
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100&auto=format&fit=crop&q=80"
                        alt="PatchBay"
                        className="w-11 h-11 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <div className="font-bold text-sm text-gray-900">PatchBay_#812</div>
                        <div className="text-xs text-gray-500">Remote Studio • Friday nights</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                      91% Match
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    "Modular synthesis, ambient sound design & indie game development in Godot. Always down to trade sound patches!"
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 font-medium">
                      🎹 Modular Synth (Mentor)
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 font-medium">
                      🎮 Indie Game Dev (Advanced)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1 — POPULAR HOBBIES */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Explore Categories</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Popular Hobbies</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Browse through trending communities and find enthusiasts already sharing their work.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {popularHobbies.map((hobby, i) => (
            <div
              key={i}
              onClick={() => onGoToHobbies(hobby.category)}
              className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer group text-left"
            >
              <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform">
                {hobby.icon}
              </div>
              <h3 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
                {hobby.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">{hobby.members}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2 — HOW IT WORKS */}
      <section className="bg-gray-50/80 border border-gray-200/80 rounded-3xl p-8 sm:p-12 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Simple Process</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">How Hobby Connect Works</h2>
          <p className="text-sm text-gray-500">
            From discovering your niche to meeting your next collaborator in three easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
              <div className="text-3xl font-black text-indigo-600 font-mono tracking-tight">
                {step.num}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — WHY HOBBY CONNECT */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Core Features</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Why Hobby Connect?</h2>
          <p className="text-sm text-gray-500">
            Designed specifically for creators, learners, and enthusiasts seeking genuine connection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xs transition-all space-y-3"
              >
                <div className={`w-10 h-10 rounded-xl ${feat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-gray-900">{feat.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4 — SOCIAL PROOF / STATS */}
      <section className="py-10 border-y border-gray-200 bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-mono tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — FINAL CTA */}
      <section className="bg-indigo-600 rounded-3xl p-8 sm:p-14 text-center text-white space-y-6 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Your next great connection could start with a hobby.
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base font-normal">
            Join thousands of passionate individuals collaborating, practicing, and building lasting communities.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onGoToDiscover}
            className="px-8 py-3.5 bg-white text-indigo-700 hover:bg-gray-100 font-bold text-sm rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Start Exploring</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
