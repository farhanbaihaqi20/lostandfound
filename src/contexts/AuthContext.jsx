import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export const validateUnnesEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  return clean.endsWith('@students.unnes.ac.id') || clean.endsWith('@unnes.ac.id');
};

export const AuthProvider = ({ children }) => {
  // Theme state: locked to 'light' per user preference
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('unnes_lf_theme', 'light');
  }, []);

  const toggleTheme = () => {
    // Dark mode temporarily disabled per user preference
    setTheme('light');
    document.documentElement.setAttribute('data-theme', 'light');
  };

  // User state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('unnes_lf_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && !parsed.id.startsWith('user-admin-') && !parsed.id.startsWith('user-mahasiswa-') && parsed.nim) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [authError, setAuthError] = useState(() => {
    const flash = sessionStorage.getItem('unnes_auth_flash_error');
    if (flash) {
      sessionStorage.removeItem('unnes_auth_flash_error');
      return flash;
    }
    return '';
  });

  const clearAuthError = () => {
    setAuthError('');
    sessionStorage.removeItem('unnes_auth_flash_error');
  };

  // Sync Supabase Auth listener if configured
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }

    const syncUserProfile = async (authUser) => {
      try {
        const email = authUser.email?.toLowerCase() || '';
        const isUnnesEmail = validateUnnesEmail(email);

        // 1. Validasi Domain Email Resmi UNNES
        if (!isUnnesEmail) {
          await supabase.auth.signOut();
          setUser(null);
          setPendingGoogleUser(null);
          localStorage.removeItem('unnes_lf_current_user');
          const errorMsg = `Akses Ditolak: Anda wajib menggunakan Akun Google resmi UNNES (@students.unnes.ac.id). Email pribadi (${email}) tidak diizinkan.`;
          setAuthError(errorMsg);
          sessionStorage.setItem('unnes_auth_flash_error', errorMsg);
          return;
        }

        // 2. Cek apakah user sudah terdaftar di database public.profiles (NIM harus sudah terisi)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        const hasCompletedProfile = Boolean(profile && profile.nim && profile.nim.trim().length > 0);

        const storedAction = sessionStorage.getItem('unnes_oauth_action');
        const isRegisterPage = window.location.pathname.includes('/daftar');
        const oauthAction = storedAction || (isRegisterPage ? 'register' : 'login');

        if (hasCompletedProfile) {
          // Akun sudah terdaftar lengkap -> Langsung masuk
          sessionStorage.removeItem('unnes_oauth_action');
          sessionStorage.removeItem('unnes_auth_flash_error');
          setPendingGoogleUser(null);
          setUser(profile);
          localStorage.setItem('unnes_lf_current_user', JSON.stringify(profile));
        } else {
          // Akun BELUM melengkapi profil mahasiswa (NIM & Fakultas belum ada)
          if (oauthAction === 'login') {
            // Jika user menekan "Masuk" tapi belum pernah mendaftar:
            await supabase.auth.signOut();
            setUser(null);
            setPendingGoogleUser(null);
            localStorage.removeItem('unnes_lf_current_user');
            sessionStorage.removeItem('unnes_oauth_action');
            const notRegMsg = `Akun Google (${email}) belum terdaftar di UNNES Lost & Found. Silakan klik "Daftar Mahasiswa" terlebih dahulu untuk membuat akun.`;
            setAuthError(notRegMsg);
            sessionStorage.setItem('unnes_auth_flash_error', notRegMsg);
          } else {
            // Jika user memilih "Daftar dengan Akun Google":
            // Masuk ke mode pengisian data mahasiswa (NIM, Fakultas, No WA)
            const meta = authUser.user_metadata || {};
            const pending = {
              id: authUser.id,
              email: authUser.email,
              full_name: meta.full_name || meta.name || authUser.email.split('@')[0],
              avatar_url: meta.avatar_url || meta.picture || ''
            };
            setPendingGoogleUser(pending);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error syncing Supabase profile:', err);
      }
    };

    // Periksa sesi aktif di awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserProfile(session.user);
      } else {
        setUser(null);
        localStorage.removeItem('unnes_lf_current_user');
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await syncUserProfile(session.user);
      } else if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setPendingGoogleUser(null);
        localStorage.removeItem('unnes_lf_current_user');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password, rememberMe = true) => {
    setLoading(true);
    clearAuthError();
    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Validasi Domain Email UNNES
      if (!validateUnnesEmail(cleanEmail)) {
        return {
          success: false,
          message: 'Format email tidak valid. Wajib menggunakan akun email resmi UNNES (@students.unnes.ac.id).'
        };
      }

      if (isSupabaseConfigured() && supabase) {
        // 2. Cek di database apakah user sudah punya akun terdaftar
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (!existingProfile || !existingProfile.nim) {
          return {
            success: false,
            notRegistered: true,
            message: 'Akun belum terdaftar di UNNES Lost & Found. Silakan daftar akun mahasiswa terlebih dahulu.'
          };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            return {
              success: false,
              message: 'Kata sandi salah. Silakan periksa kembali kata sandi Anda.'
            };
          }
          throw error;
        }

        setUser(existingProfile);
        if (rememberMe) {
          localStorage.setItem('unnes_lf_current_user', JSON.stringify(existingProfile));
        } else {
          sessionStorage.setItem('unnes_lf_current_user', JSON.stringify(existingProfile));
        }
        return { success: true, user: existingProfile };
      }

      // Jika Supabase belum dikonfigurasi
      return {
        success: false,
        notRegistered: true,
        message: 'Koneksi database belum terhubung. Silakan konfigurasi Supabase terlebih dahulu.'
      };
    } catch (error) {
      return { success: false, message: error.message || 'Gagal masuk akun' };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ email, password, full_name, nim, fakultas, prodi, phone }) => {
    setLoading(true);
    clearAuthError();
    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Validasi Domain Email UNNES
      if (!validateUnnesEmail(cleanEmail)) {
        return {
          success: false,
          message: 'Pendaftaran ditolak: Wajib menggunakan email resmi mahasiswa UNNES (@students.unnes.ac.id).'
        };
      }

      // 2. Validasi NIM
      if (!nim || nim.trim().length < 5) {
        return {
          success: false,
          message: 'NIM tidak valid. Mohon isi NIM lengkap Anda.'
        };
      }

      if (isSupabaseConfigured() && supabase) {
        // Cek apakah email atau NIM sudah ada di profiles
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, email, nim')
          .or(`email.eq.${cleanEmail},nim.eq.${nim.trim()}`)
          .maybeSingle();

        if (existingProfile) {
          if (existingProfile.email === cleanEmail) {
            return {
              success: false,
              message: 'Email mahasiswa ini sudah terdaftar. Silakan langsung masuk ke akun Anda.'
            };
          }
          if (existingProfile.nim === nim.trim()) {
            return {
              success: false,
              message: 'NIM ini sudah terdaftar di sistem UNNES Lost & Found.'
            };
          }
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name, nim: nim.trim(), fakultas, prodi, phone }
          }
        });
        if (error) throw error;

        const newProfile = {
          id: data.user.id,
          email: cleanEmail,
          full_name,
          nim: nim.trim(),
          fakultas,
          prodi: prodi || '',
          phone: phone || '',
          avatar_url: '',
          bio: `Mahasiswa ${fakultas} UNNES`,
          role: cleanEmail.includes('admin') ? 'admin' : 'user'
        };

        const { data: userCreatedProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (userCreatedProfile) {
          const { error: updateErr } = await supabase
            .from('profiles')
            .update({
              full_name,
              nim: nim.trim(),
              fakultas,
              prodi: prodi || '',
              phone: phone || '',
              bio: `Mahasiswa ${fakultas} UNNES`,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.user.id);
          if (updateErr) throw updateErr;
        } else {
          const { error: insertErr } = await supabase
            .from('profiles')
            .insert(newProfile);
          if (insertErr) throw insertErr;
        }

        setUser(newProfile);
        localStorage.setItem('unnes_lf_current_user', JSON.stringify(newProfile));
        return { success: true, user: newProfile };
      }

      // Mock Local Registration
      const newUser = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        full_name,
        role: cleanEmail.includes('admin') ? 'admin' : 'user',
        avatar_url: '',
        bio: `Mahasiswa ${fakultas} UNNES`,
        phone: phone || '',
        nim: nim.trim(),
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

  const loginWithGoogle = async (intent = 'login') => {
    clearAuthError();
    sessionStorage.setItem('unnes_oauth_action', intent);

    if (isSupabaseConfigured() && supabase) {
      return await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: `${window.location.origin}${intent === 'register' ? '/daftar' : '/masuk'}` 
        }
      });
    }

    // Mock Google Flow
    const demoEmail = 'mahasiswa.google@students.unnes.ac.id';
    if (intent === 'register') {
      const pending = {
        id: 'google-user-pending',
        email: demoEmail,
        full_name: 'Farhan Baihaqi',
        avatar_url: ''
      };
      setPendingGoogleUser(pending);
      return { success: true, pending };
    } else {
      const saved = localStorage.getItem('unnes_lf_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nim) {
          setUser(parsed);
          return { success: true, user: parsed };
        }
      }
      return {
        success: false,
        notRegistered: true,
        message: 'Akun Google belum terdaftar di UNNES Lost & Found. Silakan klik Daftar Mahasiswa.'
      };
    }
  };

  const completeGoogleRegistration = async ({ nim, fakultas, prodi, phone, full_name }) => {
    setLoading(true);
    clearAuthError();
    try {
      if (!nim || nim.trim().length < 5) {
        return { success: false, message: 'NIM wajib diisi dengan benar (minimal 5 karakter).' };
      }
      if (!fakultas) {
        return { success: false, message: 'Fakultas wajib dipilih.' };
      }

      const activePending = pendingGoogleUser;
      let activeAuthId = activePending?.id;
      let activeEmail = activePending?.email;
      let activeAvatar = activePending?.avatar_url;

      if (isSupabaseConfigured() && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          activeAuthId = session.user.id;
          activeEmail = session.user.email;
          activeAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || activeAvatar;
        }
      }

      if (!activeAuthId || !activeEmail) {
        return { success: false, message: 'Sesi akun Google tidak ditemukan. Silakan coba kembali.' };
      }

      const completedProfile = {
        id: activeAuthId,
        email: activeEmail.toLowerCase(),
        full_name: full_name || activePending?.full_name || activeEmail.split('@')[0],
        avatar_url: activeAvatar || '',
        nim: nim.trim(),
        fakultas,
        prodi: prodi || '',
        phone: phone || '',
        bio: `Mahasiswa ${fakultas} UNNES`,
        role: activeEmail.includes('admin') ? 'admin' : 'user'
      };

      if (isSupabaseConfigured() && supabase) {
        // Cek apakah profil sudah dibuat otomatis oleh trigger auth.users (handle_new_user)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', activeAuthId)
          .maybeSingle();

        if (existingProfile) {
          // Lakukan UPDATE sesuai policy RLS "Users can update their own profile" (auth.uid() = id)
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              full_name: completedProfile.full_name,
              nim: completedProfile.nim,
              fakultas: completedProfile.fakultas,
              prodi: completedProfile.prodi,
              phone: completedProfile.phone,
              bio: completedProfile.bio,
              avatar_url: completedProfile.avatar_url,
              updated_at: new Date().toISOString()
            })
            .eq('id', activeAuthId);

          if (updateError) throw updateError;
        } else {
          // Jika belum ada, lakukan insert
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(completedProfile);

          if (insertError) throw insertError;
        }
      }

      setUser(completedProfile);
      setPendingGoogleUser(null);
      sessionStorage.removeItem('unnes_oauth_action');
      localStorage.setItem('unnes_lf_current_user', JSON.stringify(completedProfile));
      return { success: true, user: completedProfile };
    } catch (err) {
      return { success: false, message: err.message || 'Gagal menyimpan data profil mahasiswa.' };
    } finally {
      setLoading(false);
    }
  };

  const cancelPendingGoogle = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    setPendingGoogleUser(null);
    setUser(null);
    sessionStorage.removeItem('unnes_oauth_action');
    localStorage.removeItem('unnes_lf_current_user');
  };

  const switchDemoAccount = () => {
    // Mode demo dinonaktifkan: aplikasi menggunakan akun riil Supabase
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
    setPendingGoogleUser(null);
    sessionStorage.removeItem('unnes_oauth_action');
    sessionStorage.removeItem('unnes_auth_flash_error');
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
      pendingGoogleUser,
      completeGoogleRegistration,
      cancelPendingGoogle,
      authError,
      clearAuthError,
      validateUnnesEmail,
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
