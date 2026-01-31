import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiFetch } from '@/utils/apiClient';
import { useSocket } from '@/context/SocketContext';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'warden' | 'management' | 'maintenance';
  hostel: string;
  block: string;
  room: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  room?: string;
  hostel?: string;
  block?: string;
  role?: 'student' | 'warden';
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null; user: UserProfile | null }>;
  signup: (data: SignupData) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();

  // Hydrate user from stored token on app load
  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('authToken') : null;
    if (!token) return;

    setIsLoading(true);
    apiFetch<{ user: any }>('/api/auth/me')
      .then(res => {
        const u = res.user;
        setUser({
          ...u,
          createdAt: new Date(u.createdAt),
        });
      })
      .catch(() => {
        window.localStorage.removeItem('authToken');
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Listen for real-time user updates
  useEffect(() => {
    if (!socket || !user) return;

    const handleUserUpdate = (updatedUser: any) => {
      const mapped = {
        ...updatedUser,
        createdAt: new Date(updatedUser.createdAt),
      };

      if (mapped.id === user.id) {
        setUser(mapped);
      }
    };

    socket.on('user:updated', handleUserUpdate);

    return () => {
      socket.off('user:updated', handleUserUpdate);
    };
  }, [socket, user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const res = await apiFetch<{ token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('authToken', res.token);
      }

      const u = res.user;
      const mapped: UserProfile = {
        ...u,
        createdAt: new Date(u.createdAt),
      };
      setUser(mapped);
      setIsLoading(false);
      return { error: null, user: mapped };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err instanceof Error ? err : new Error('Login failed'), user: null };
    }
  };

  const signup = async (data: SignupData) => {
    setIsLoading(true);

    try {
      const res = await apiFetch<{ token: string; user: any }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          room: data.room,
          hostel: data.hostel,
          block: data.block,
          role: data.role,
        }),
      });

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('authToken', res.token);
      }

      const u = res.user;
      const mapped: UserProfile = {
        ...u,
        createdAt: new Date(u.createdAt),
      };
      setUser(mapped);
      setIsLoading(false);
      return { error: null };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err instanceof Error ? err : new Error('Signup failed') };
    }
  };

  const logout = async () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('authToken');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      await apiFetch('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (user) {
        setUser({ ...user, ...updates });
      }
    } catch (e) {
      console.error('Failed to update profile', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
