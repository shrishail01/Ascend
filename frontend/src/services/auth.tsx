import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from './axios';
import { toast } from 'sonner';
import { db } from './dexie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  plan: 'Free' | 'Premium' | 'Admin';
  linkedInUrl?: string;
  currentRole?: string;
  targetRole?: string;
  featureUsage?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginWithRedirect: (options?: { redirectUrl?: string; initialView?: string }) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateUser: (updatedUser: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Context Provider managing user sessions, JWT refreshes, and offline synchronization.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalView, setModalView] = useState<'login' | 'signup'>('login');

  // Input states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const refreshSession = async () => {
    try {
      const res = await api.post('/auth/refresh');
      setAccessToken(res.data.accessToken);
      const userRes = await api.get('/users/me');
      setUser(userRes.data);
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await refreshSession();
      setIsLoading(false);
    };
    initAuth();

    const handleAuthExpired = () => {
      setShowModal(true);
      setModalView('login');
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  // Sync offline resume drafts when back online
  useEffect(() => {
    const syncOfflineDrafts = async () => {
      if (navigator.onLine && user) {
        const drafts = await db.resumeDrafts.toArray();
        if (drafts.length > 0) {
          toast.info(`Syncing ${drafts.length} offline drafts...`);
          for (const draft of drafts) {
            try {
              await api.post('/resumes', {
                id: draft.id === 'new' ? undefined : draft.id,
                title: draft.title,
                template: draft.template,
                content: draft.content,
              });
              await db.resumeDrafts.delete(draft.id);
            } catch (err) {
              console.error('Failed to sync draft:', draft.id, err);
            }
          }
          toast.success('Offline drafts synchronized successfully!');
        }
      }
    };

    window.addEventListener('online', syncOfflineDrafts);
    if (user) syncOfflineDrafts();
    return () => window.removeEventListener('online', syncOfflineDrafts);
  }, [user]);

  const loginWithRedirect = (options?: { redirectUrl?: string; initialView?: string }) => {
    setModalView(options?.initialView === 'signup' ? 'signup' : 'login');
    setShowModal(true);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    setAccessToken(null);
    setUser(null);
    setShowModal(false);
    toast.success('Logged out successfully.');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and Password are required.');
      return;
    }
    setAuthLoading(true);
    try {
      if (modalView === 'login') {
        const res = await api.post('/auth/login', { email, password });
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        setShowModal(false);
        toast.success('Logged in successfully!');
      } else {
        if (!firstName || !lastName) {
          toast.error('First Name and Last Name are required.');
          setAuthLoading(false);
          return;
        }
        const res = await api.post('/auth/signup', { firstName, lastName, email, password });
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        setShowModal(false);
        toast.success('Account registered successfully!');
      }
      setPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Authentication failed.');
    }
    setAuthLoading(false);
  };

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithRedirect, logout, refreshSession, updateUser }}>
      {children}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
          <Card className="max-w-md w-full glass-panel border border-border/50 p-6 rounded-3xl relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <CardContent className="space-y-6 pt-6">
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
                  <Sparkles className="h-6 w-6 text-white animate-pulse" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  {modalView === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  {modalView === 'login'
                    ? 'Enter your credentials to access your dashboard and tools.'
                    : 'Sign up to start optimizing your resume and tracking applications.'}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {modalView === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">First Name</label>
                      <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" className="rounded-xl border-border/50 bg-muted/10" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Name</label>
                      <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className="rounded-xl border-border/50 bg-muted/10" />
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john.doe@example.com" className="rounded-xl border-border/50 bg-muted/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="rounded-xl border-border/50 bg-muted/10" />
                </div>

                <Button type="submit" disabled={authLoading} className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white border-0 font-bold glow-hover rounded-xl shadow-lg mt-2">
                  {authLoading ? (
                    <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Processing...</>
                  ) : modalView === 'login' ? (
                    'Sign In'
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <div className="text-center pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setModalView(modalView === 'login' ? 'signup' : 'login')}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  {modalView === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
