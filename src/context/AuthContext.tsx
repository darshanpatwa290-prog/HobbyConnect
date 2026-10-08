import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IUser } from '../types/index.ts';
import { api, getToken, setToken, removeToken } from '../services/api.ts';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  login: (loginValue: string, pass: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  demoLogin: (username: string) => Promise<void>;
  logout: () => void;
  updateProfile: (payload: Partial<IUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
  pendingIncomingCount: number;
  unreadMessagesCount: number;
  refreshCounters: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingIncomingCount, setPendingIncomingCount] = useState<number>(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  const refreshCounters = useCallback(async () => {
    if (!getToken()) {
      setPendingIncomingCount(0);
      setUnreadMessagesCount(0);
      return;
    }
    try {
      const [connRes, msgRes] = await Promise.all([
        api.getConnections().catch(() => ({ totalPendingIncoming: 0 })),
        api.getConversations().catch(() => ({ conversations: [] })),
      ]);

      setPendingIncomingCount(connRes.totalPendingIncoming || 0);

      const totalUnread = (msgRes.conversations || []).reduce(
        (sum: number, c: any) => sum + (c.unreadCount || 0),
        0
      );
      setUnreadMessagesCount(totalUnread);
    } catch {
      // ignore counter background fail
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      setUser(res.user);
      await refreshCounters();
    } catch (err) {
      console.warn('Failed to validate session token:', err);
      removeToken();
      setTokenState(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refreshCounters]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Periodic polling for badge counters when user is logged in
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      refreshCounters();
    }, 10000);
    return () => clearInterval(interval);
  }, [user, refreshCounters]);

  const login = async (loginVal: string, pass: string) => {
    const res = await api.login({ login: loginVal, password: pass });
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    await refreshCounters();
  };

  const register = async (payload: any) => {
    const res = await api.register(payload);
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    await refreshCounters();
  };

  const demoLogin = async (username: string) => {
    const res = await api.demoLogin(username);
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    await refreshCounters();
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
    setPendingIncomingCount(0);
    setUnreadMessagesCount(0);
  };

  const updateProfile = async (payload: Partial<IUser>) => {
    const res = await api.updateProfile(payload);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
        refreshUser,
        pendingIncomingCount,
        unreadMessagesCount,
        refreshCounters,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
