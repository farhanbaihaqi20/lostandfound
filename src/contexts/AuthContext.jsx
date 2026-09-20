import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS } from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('unnes_lf_theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('unnes_lf_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // User state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('unnes_lf_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    // Default demo user: Farhan Baihaqi (Student)
    return INITIAL_USERS[1];
  });

  const [loading, setLoading] = useState(false);

  // Sync Supabase Auth listener if configured
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch or create profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser(profile);
          localStorage.setItem('unnes_lf_current_user', JSON.stringify(profile));
        } else {
          const newProfile = {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            role: session.user.email.includes('admin') ? 'admin' : 'user',
            avatar_url: session.user.user_metadata?.avatar_url || '',
            bio: 'Mahasiswa Universitas Negeri Semarang',
            phone: '',
            nim: '',
            fakultas: 'FMIPA',
            prodi: ''
          };
          setUser(newProfile);
          localStorage.setItem('unnes_lf_current_user', JSON.stringify(newProfile));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password, rememberMe = true) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return { success: true, user: data.user };
      }

      // Mock Local Auth
      const foundUser = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      const loggedUser = foundUser || {
        id: `user-${Date.now()}`,
        email,
        full_name: email.split('@')[0].toUpperCase(),
        role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        bio: 'Civitas Akademika UNNES',
        phone: '',
        nim: '4101422999',
        fakultas: 'FMIPA',
        prodi: 'Ilmu Komputer'
      };

      setUser(loggedUser);
      if (rememberMe) {
        localStorage.setItem('unnes_lf_current_user', JSON.stringify(loggedUser));
      } else {
        sessionStorage.setItem('unnes_lf_current_user', JSON.stringify(loggedUser));
      }
      return { success: true, user: loggedUser };
    } catch (error) {
      return { success: false, message: error.message || 'Gagal masuk akun' };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ email, password, full_name, nim, fakultas, prodi, phone }) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name, nim, fakultas, prodi, phone }
          }
        });
        if (error) throw error;
        return { success: true, user: data.user };
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email,
        full_name,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        bio: 'Mahasiswa UNNES yang aktif',
        phone: phone || '',
        nim: nim || '',
        fakultas: fakultas || 'FMIPA',
        prodi: prodi || 'Ilmu Komputer'
      };

      setUser(newUser);
      localStorage.setItem('unnes_lf_current_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, message: error.message || 'Gagal mendaftarkan akun' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured() && supabase) {
      return await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
    }

    // Seamless Mock Google login
    const googleUser = {
      id: 'google-user-01',
      email: 'mahasiswa.google@students.unnes.ac.id',
      full_name: 'Farhan Baihaqi (Google)',
      role: 'user',
      avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      bio: 'Akun terhubung via Akun Google UNNES Mail.',
      phone: '085712345678',
      nim: '4101422001',
      fakultas: 'FMIPA',
      prodi: 'Teknik Informatika'
    };
    setUser(googleUser);
    localStorage.setItem('unnes_lf_current_user', JSON.stringify(googleUser));
    return { success: true, user: googleUser };
  };

  const switchDemoAccount = (role) => {
    const targetUser = role === 'admin' ? INITIAL_USERS[0] : INITIAL_USERS[1];
    setUser(targetUser);
    localStorage.setItem('unnes_lf_current_user', JSON.stringify(targetUser));
  };

  const updateProfile = (updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields, updated_at: new Date().toISOString() };
      localStorage.setItem('unnes_lf_current_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('unnes_lf_current_user');
    sessionStorage.removeItem('unnes_lf_current_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin: user?.role === 'admin',
      loading,
      theme,
      toggleTheme,
      login,
      register,
      loginWithGoogle,
      switchDemoAccount,
      updateProfile,
      logout
    }}>
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
