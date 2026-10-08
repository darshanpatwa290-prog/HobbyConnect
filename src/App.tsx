import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LandingView } from './components/LandingView.tsx';
import { DiscoverView } from './components/DiscoverView.tsx';
import { HobbiesView } from './components/HobbiesView.tsx';
import { ConnectionsView } from './components/ConnectionsView.tsx';
import { MessagesView } from './components/MessagesView.tsx';
import { CommunityFeedView } from './components/CommunityFeedView.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { CreateHobbyModal } from './components/CreateHobbyModal.tsx';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'landing' | 'discover' | 'hobbies' | 'connections' | 'messages' | 'feed'>('landing');
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [hobbyCategoryFilter, setHobbyCategoryFilter] = useState<string | undefined>(undefined);

  // Modals
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login',
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateHobbyOpen, setIsCreateHobbyOpen] = useState(false);

  const handleStartChatWithUser = (userId: string) => {
    setSelectedChatUserId(userId);
    setActiveTab('messages');
  };

  const handleGoToHobbiesWithCategory = (category?: string) => {
    setHobbyCategoryFilter(category);
    setActiveTab('hobbies');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={(mode = 'login') => setAuthModalState({ isOpen: true, mode })}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenCreateHobby={() => setIsCreateHobbyOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'landing' && (
          <LandingView
            onGoToDiscover={() => setActiveTab('discover')}
            onGoToHobbies={handleGoToHobbiesWithCategory}
            onOpenAuth={(mode = 'register') => setAuthModalState({ isOpen: true, mode })}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverView
            onStartChat={handleStartChatWithUser}
            onOpenAuth={() => setAuthModalState({ isOpen: true, mode: 'login' })}
            onOpenConnections={() => setActiveTab('connections')}
          />
        )}

        {activeTab === 'hobbies' && (
          <HobbiesView
            initialCategory={hobbyCategoryFilter}
            onOpenCreateHobby={() => setIsCreateHobbyOpen(true)}
            onOpenAuth={() => setAuthModalState({ isOpen: true, mode: 'login' })}
            onSelectUserForChat={handleStartChatWithUser}
          />
        )}

        {activeTab === 'connections' && (
          <ConnectionsView
            onStartChat={handleStartChatWithUser}
            onOpenDiscover={() => setActiveTab('discover')}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesView
            initialUserId={selectedChatUserId}
            onSelectUser={(userId) => setSelectedChatUserId(userId)}
          />
        )}

        {activeTab === 'feed' && (
          <CommunityFeedView
            onOpenAuth={() => setAuthModalState({ isOpen: true, mode: 'login' })}
            onSelectUserForChat={handleStartChatWithUser}
          />
        )}
      </main>

      {/* Modern SaaS Footer */}
      <Footer onNavigate={(tab) => setActiveTab(tab)} />

      {/* Modals */}
      <AuthModal
        isOpen={authModalState.isOpen}
        defaultMode={authModalState.mode}
        onClose={() => setAuthModalState({ isOpen: false, mode: 'login' })}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <CreateHobbyModal
        isOpen={isCreateHobbyOpen}
        onClose={() => setIsCreateHobbyOpen(false)}
        onCreated={() => {
          setActiveTab('hobbies');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
