import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
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
    <div style={{
      minHeight: 'calc(100vh - 65px)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
      backgroundColor: 'var(--bg-canvas)'
    }}>
      
      {/* Left Column: Dark Navy Editorial Panel (Figma 06 Masuk) */}
      <div style={{
        backgroundColor: '#0F172A',
        color: '#FAF8F5',
        padding: '4rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        {/* Top Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#FAF8F5',
            color: 'var(--ink-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: '0.95rem',
            borderRadius: '4px'
          }}>
            LF
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.1rem', color: '#FAF8F5' }}>
              UNNES Lost &amp; Found
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#94A3B8', letterSpacing: '0.06em' }}>
              UNIVERSITAS NEGERI SEMARANG
            </div>
          </div>
        </div>

        {/* Center Editorial Quote */}
        <div style={{ maxWidth: '440px', margin: '3rem 0' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: '#60A5FA',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}>
            ARSIP MASUK &bull; SSO CIVITAS
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 700,
            lineHeight: 1.2,
            color: '#FAF8F5',
            margin: '0 0 1.25rem'
          }}>
            &ldquo;Setiap barang punya jalan pulang.&rdquo;
          </h2>
          <p style={{
            fontSize: '0.95rem',
            color: '#94A3B8',
            lineHeight: 1.65,
            margin: 0
          }}>
            Portal arsip resmi Universitas Negeri Semarang. Masuk menggunakan akun SSO UNNES atau email mahasiswa terdaftar untuk mengklaim atau melaporkan barang.
          </p>
        </div>

        {/* Bottom Bar */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#64748B' }}>
          KAMPUS SEKARAN &bull; SISTEM ARSIP TERBUKA
        </div>
      </div>

      {/* Right Column: Parchment Form */}
      <div style={{
        backgroundColor: 'var(--bg-card-alt)',
        padding: '4rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 700, color: 'var(--ink-900)', margin: '0 0 0.35rem' }}>
              Masuk ke Akun
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-700)', margin: 0 }}>
              Gunakan email mahasiswa UNNES atau akun Google Anda.
            </p>
          </div>

          {(authError || errorMsg) && (
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              borderRadius: '4px',
              fontSize: '0.825rem',
              border: '1px solid #FCA5A5',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{authError || errorMsg}</div>
              </div>
              {(isNotRegistered || (authError && authError.toLowerCase().includes('belum terdaftar'))) && (
                <Link
                  to="/daftar"
                  style={{
                    color: '#DC2626',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    fontSize: '0.78rem'
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
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              padding: '0.75rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--ink-900)',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Masuk dengan Akun Google UNNES
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-500)' }}>ATAU DENGAN EMAIL</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                ALAMAT EMAIL MAHASISWA
              </label>
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
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.875rem'
                  }}
                />
                <Mail size={16} color="var(--ink-500)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                KATA SANDI
              </label>
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
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.875rem'
                  }}
                />
                <Lock size={16} color="var(--ink-500)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--ink-700)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Tautan reset kata sandi telah dikirim ke email mahasiswa Anda!'); }} style={{ color: 'var(--ink-900)', fontWeight: 600, textDecoration: 'underline' }}>
                Lupa sandi?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-dark"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.825rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginTop: '0.5rem'
              }}
            >
              {loading ? 'MEMVERIFIKASI...' : 'MASUK KE ARSIP'}
            </button>
          </form>

          {/* Switcher to Register */}
          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--ink-700)', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            Belum memiliki akun mahasiswa?{' '}
            <Link to="/daftar" style={{ color: 'var(--ink-900)', fontWeight: 700, textDecoration: 'underline' }}>
              Daftar Disini
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};
