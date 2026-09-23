import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage = () => {
  const { user, login, loginWithGoogle, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isNotRegistered, setIsNotRegistered] = useState(false);

  const from = location.state?.from?.pathname || '/beranda';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    clearAuthError();
    setIsNotRegistered(false);
    setLoading(true);

    const result = await login(email, password, rememberMe);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(result.message || 'Email atau password salah');
      if (result.notRegistered) {
        setIsNotRegistered(true);
      }
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setErrorMsg('');
    clearAuthError();
    setIsNotRegistered(false);
    try {
      const result = await loginWithGoogle('login');
      if (result?.notRegistered) {
        setErrorMsg(result.message || 'Akun Google belum terdaftar di UNNES Lost & Found.');
        setIsNotRegistered(true);
        setLoading(false);
        return;
      }
      if (result?.error) {
        setErrorMsg(result.error.message || 'Gagal login dengan akun Google');
        setLoading(false);
        return;
      }
      // Untuk mode demo / mock local auth
      if (result?.user) {
        setLoading(false);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menghubungkan ke Google');
      setLoading(false);
    }
  };


  return (
    <div className="container" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        borderRadius: 'var(--radius-xl)',
        padding: '2.25rem 2rem',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-glass)'
      }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(30, 58, 95, 0.22)',
            border: '2.5px solid var(--amber-400)',
            background: '#FAF6EB'
          }}>
            <img 
              src="/logo.png" 
              alt="Logo UNNES Lost & Found" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Masuk ke Akun Anda</h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            UNNES Lost & Found — Universitas Negeri Semarang
          </p>
        </div>

        {(authError || errorMsg) && (
          <div style={{
            padding: '0.85rem 1rem',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.825rem',
            marginBottom: '1.25rem',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{authError || errorMsg}</div>
            </div>
            {(isNotRegistered || (authError && authError.toLowerCase().includes('belum terdaftar'))) && (
              <Link
                to="/daftar"
                className="btn btn-primary btn-sm"
                style={{
                  alignSelf: 'flex-start',
                  fontSize: '0.78rem',
                  textDecoration: 'none',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                Daftar Akun Mahasiswa Sekarang &rarr;
              </Link>
            )}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="btn btn-outline"
          style={{
            width: '100%',
            gap: '0.65rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '0.75rem',
            marginBottom: '1.25rem'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Masuk dengan Akun Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>atau dengan email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Alamat Email:</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="nama@students.unnes.ac.id"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg || authError) {
                    setErrorMsg('');
                    clearAuthError();
                    setIsNotRegistered(false);
                  }
                }}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Kata Sandi:</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg || authError) {
                    setErrorMsg('');
                    clearAuthError();
                    setIsNotRegistered(false);
                  }
                }}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Ingat saya di perangkat ini</span>
            </label>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Tautan reset password telah dikirim ke email UNNES Anda!'); }} style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
              Lupa sandi?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        {/* Link to Register */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Belum punya akun?{' '}
          <Link to="/daftar" style={{ color: 'var(--primary-600)', fontWeight: 700 }}>
            Daftar Mahasiswa
          </Link>
        </div>

      </div>

    </div>
  );
};
