import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, DEMO_MODE } from '../lib/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // initial /me check
  const toast = useToast();

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      localStorage.removeItem('nh_token');
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const storeToken = (token) => {
    if (token) localStorage.setItem('nh_token', token);
  };

  const login = useCallback(
    async ({ email, password, remember }) => {
      const { data, message } = await api.post('/auth/login', { email, password, remember });
      storeToken(data.token);
      setUser(data.user);
      toast.success(message || 'Login successful');
      return data.user;
    },
    [toast]
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      const { data, message } = await api.post('/auth/register', { name, email, password });
      storeToken(data.token);
      setUser(data.user);
      toast.success(message || 'Account created!');
      return data.user;
    },
    [toast]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    localStorage.removeItem('nh_token');
    setUser(null);
    toast.info('Logged out successfully. See you soon!');
  }, [toast]);

  const updateProfile = useCallback(
    async (payload) => {
      const { data, message } = await api.put('/auth/profile', payload);
      setUser(data.user);
      toast.success(message || 'Profile updated');
      return data.user;
    },
    [toast]
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh, updateProfile, setUser, demoMode: DEMO_MODE }),
    [user, loading, login, register, logout, refresh, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
