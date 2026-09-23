import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, AlertCircle, GraduationCap, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage = () => {
  const {
    user,
    register,
    loginWithGoogle,
    pendingGoogleUser,
    completeGoogleRegistration,
    cancelPendingGoogle,
    authError,
    clearAuthError,
    validateUnnesEmail
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/beranda', { replace: true });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    nim: '',
    fakultas: 'FMIPA',
    prodi: '',
    phone: ''
  });

  const [googleFormData, setGoogleFormData] = useState({
    full_name: '',
    nim: '',
    fakultas: 'FMIPA',
    prodi: '',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (pendingGoogleUser) {
      setGoogleFormData(prev => ({
        ...prev,
        full_name: pendingGoogleUser.full_name || prev.full_name
      }));
    }
  }, [pendingGoogleUser]);

  // Handle Google OAuth Sign Up Initiation
  const handleGoogleRegister = async () => {
    setLoading(true);
    setErrorMsg('');
    clearAuthError();
    try {
      const res = await loginWithGoogle('register');
      if (res?.error) {
        setErrorMsg(res.error.message || 'Gagal menghubungkan ke akun Google');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menghubungkan ke Google');
    } finally {
      setLoading(false);
    }
  };

  // Handle Complete Step for Google Onboarding
  const handleCompleteGoogle = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    clearAuthError();

    if (!googleFormData.nim || googleFormData.nim.trim().length < 5) {
      setErrorMsg('Mohon masukkan NIM Anda yang valid (minimal 5 karakter).');
      return;
    }
    if (!googleFormData.phone || googleFormData.phone.trim().length < 9) {
      setErrorMsg('Mohon masukkan nomor WhatsApp aktif (minimal 9 digit).');
      return;
    }

    setLoading(true);
    const res = await completeGoogleRegistration({
      nim: googleFormData.nim.trim(),
      fakultas: googleFormData.fakultas,
      prodi: googleFormData.prodi.trim(),
      phone: googleFormData.phone.trim(),
      full_name: googleFormData.full_name.trim()
    });
    setLoading(false);

    if (res.success) {
      alert('Selamat! Pendaftaran akun mahasiswa UNNES berhasil diselesaikan.');
      navigate('/beranda', { replace: true });
    } else {
      setErrorMsg(res.message || 'Gagal melengkapi data mahasiswa');
    }
  };

  // Cancel Google flow
  const handleCancelGoogle = async () => {
    await cancelPendingGoogle();
    setErrorMsg('');
    clearAuthError();
  };

  // Handle Manual Registration Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    clearAuthError();

    // 1. Validasi Domain UNNES di sisi client sebelum dikirim ke DB / Supabase
    const cleanEmail = formData.email.trim().toLowerCase();
    if (!validateUnnesEmail(cleanEmail)) {
      setErrorMsg('Pendaftaran ditolak: Wajib menggunakan email resmi mahasiswa UNNES (@students.unnes.ac.id). Email selain domain UNNES tidak diizinkan.');
      return;
    }

    // 2. Validasi NIM
    if (!formData.nim || formData.nim.trim().length < 5) {
      setErrorMsg('NIM tidak valid. Mohon isi NIM lengkap Anda (minimal 5 karakter).');
      return;
    }

    // 3. Validasi WhatsApp
    if (!formData.phone || formData.phone.trim().length < 9) {
      setErrorMsg('Mohon masukkan nomor WhatsApp aktif (minimal 9 digit) untuk keperluan koordinasi pengembalian barang.');
      return;
    }

    // 4. Validasi Password
    if (formData.password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);
    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      alert('Pendaftaran akun UNNES berhasil! Selamat datang.');
      navigate('/beranda', { replace: true });
    } else {
      setErrorMsg(res.message || 'Gagal mendaftar');
    }
  };

  const activeError = authError || errorMsg;

  // ----------------------------------------------------------------------
  // STEP 2 ONBOARDING: User connected Google but needs NIM, Fakultas, etc.
  // ----------------------------------------------------------------------
  if (pendingGoogleUser) {
    return (
      <div className="container" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '500px',
          borderRadius: 'var(--radius-xl)',
          padding: '2.25rem 2rem',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-glass)'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-700) 0%, var(--teal-600) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 6px 16px rgba(30, 58, 95, 0.3)'
            }}>
              <GraduationCap size={28} />
            </div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--primary-700)',
              background: 'rgba(30, 58, 95, 0.08)',
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)'
            }}>
              Langkah 2: Lengkapi Data Mahasiswa
            </span>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Konfirmasi Data Akademik</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Akun Google UNNES Anda berhasil terhubung. Mohon lengkapi identitas mahasiswa untuk mengaktifkan akun.
            </p>
          </div>

          {/* User Google Preview Card */}
          <div style={{
            background: 'var(--bg-secondary, rgba(0,0,0,0.02))',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}>
            {pendingGoogleUser.avatar_url ? (
              <img
                src={pendingGoogleUser.avatar_url}
                alt="Google Avatar"
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }}
              />
            ) : (
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--primary-800)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.1rem'
              }}>
                {pendingGoogleUser.full_name?.charAt(0) || 'U'}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {pendingGoogleUser.full_name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ wordBreak: 'break-all' }}>{pendingGoogleUser.email}</span>
                <span style={{
                  fontSize: '0.65rem',
                  color: '#15803d',
                  fontWeight: 700,
                  background: '#dcfce7',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px'
                }}>
                  ✓ UNNES Mail
                </span>
              </div>
            </div>
          </div>

          {activeError && (
            <div style={{
              padding: '0.75rem 0.9rem',
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              marginBottom: '1rem',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{activeError}</div>
            </div>
          )}

          <form onSubmit={handleCompleteGoogle} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nama Lengkap Mahasiswa:</label>
              <input
                type="text"
                required
                value={googleFormData.full_name}
                onChange={(e) => {
                  setGoogleFormData(p => ({ ...p, full_name: e.target.value }));
                  if (errorMsg || authError) { setErrorMsg(''); clearAuthError(); }
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.65rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>NIM Mahasiswa:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 4101420001"
                  value={googleFormData.nim}
                  onChange={(e) => {
                    setGoogleFormData(p => ({ ...p, nim: e.target.value }));
                    if (errorMsg || authError) { setErrorMsg(''); clearAuthError(); }
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fakultas:</label>
                <select
                  value={googleFormData.fakultas}
                  onChange={(e) => setGoogleFormData(p => ({ ...p, fakultas: e.target.value }))}
                >
                  {['FMIPA', 'FT', 'FBS', 'FEB', 'FIP', 'FISIP', 'FIK', 'FKK', 'FH', 'Pascasarjana'].map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Program Studi (Opsional):</label>
              <input
                type="text"
                placeholder="Contoh: Ilmu Komputer / Pend. Matematika"
                value={googleFormData.prodi}
                onChange={(e) => setGoogleFormData(p => ({ ...p, prodi: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nomor WhatsApp Aktif:</label>
              <input
                type="tel"
                required
                placeholder="08xxxxxxxxxx"
                value={googleFormData.phone}
                onChange={(e) => {
                  setGoogleFormData(p => ({ ...p, phone: e.target.value }));
                  if (errorMsg || authError) { setErrorMsg(''); clearAuthError(); }
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Digunakan untuk kontak penemuan dan verifikasi barang.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontWeight: 700 }}
            >
              {loading ? 'Menyimpan Profil...' : 'Selesaikan Pendaftaran & Masuk'}
            </button>

            <button
              type="button"
              onClick={handleCancelGoogle}
              disabled={loading}
              className="btn btn-outline"
              style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem' }}
            >
              <ArrowLeft size={16} /> Batal / Gunakan Akun Lain
            </button>
          </form>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // STANDARD REGISTRATION VIEW: Choose Google OAuth or Manual UNNES Email
  // ----------------------------------------------------------------------
  return (
    <div className="container" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        borderRadius: 'var(--radius-xl)',
        padding: '2.25rem 2rem',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-glass)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
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
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Daftar Akun Mahasiswa</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Bergabung dalam ekosistem tolong-menolong kampus UNNES
          </p>
        </div>

        {activeError && (
          <div style={{
            padding: '0.85rem 1rem',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.825rem',
            marginBottom: '1.25rem',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{activeError}</div>
          </div>
        )}

        {/* Google OAuth Register Button */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={loading}
          className="btn btn-outline"
          style={{
            width: '100%',
            gap: '0.65rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '0.75rem',
            marginBottom: '0.35rem'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Daftar dengan Akun Google
        </button>
        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          *Wajib menggunakan Akun Google resmi UNNES (<strong>@students.unnes.ac.id</strong>)
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>atau daftar manual dengan email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nama Lengkap:</label>
            <input
              type="text"
              required
              placeholder="Contoh: Farhan Baihaqi"
              value={formData.full_name}
              onChange={(e) => {
                setFormData(p => ({ ...p, full_name: e.target.value }));
                if (errorMsg || authError) { setErrorMsg(''); clearAuthError(); }
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email Mahasiswa (UNNES Mail):</label>
              <span style={{ fontSize: '0.7rem', color: 'var(--teal-700)', fontWeight: 600 }}>@students.unnes.ac.id</span>
            </div>
            <input
              type="email"
              required
              placeholder="nama@students.unnes.ac.id"
              value={formData.email}
              onChange={(e) => {
                setFormData(p => ({ ...p, email: e.target.value }));
                if (errorMsg || authError) { setErrorMsg(''); clearAuthError(); }
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Domain selain @students.unnes.ac.id akan otomatis ditolak oleh sistem.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>NIM:</label>
              <input
                type="text"
                required
                placeholder="410142..."
                value={formData.nim}
                onChange={(e) => {
                  setFormData(p => ({ ...p, nim: e.target.value }));
                  if (errorMsg || authError) { setErrorMsg(''); clearAuthError(); }
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fakultas:</label>
              <select
                value={formData.fakultas}
                onChange={(e) => setFormData(p => ({ ...p, fakultas: e.target.value }))}
              >
                {['FMIPA', 'FT', 'FBS', 'FEB', 'FIP', 'FISIP', 'FIK', 'FKK', 'FH', 'Pascasarjana'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Program Studi (Opsional):</label>
            <input
              type="text"
              placeholder="Contoh: S1 Ilmu Komputer"
              value={formData.prodi}
              onChange={(e) => setFormData(p => ({ ...p, prodi: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nomor WhatsApp:</label>
            <input
              type="tel"
              required
              placeholder="08xxxxxxxxxx"
              value={formData.phone}
              onChange={(e) => {
                setFormData(p => ({ ...p, phone: e.target.value }));
                if (errorMsg || authError) { setErrorMsg(''); clearAuthError(); }
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Kata Sandi (Minimal 6 karakter):</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => {
                setFormData(p => ({ ...p, password: e.target.value }));
                if (errorMsg || authError) { setErrorMsg(''); clearAuthError(); }
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontWeight: 700 }}
          >
            {loading ? 'Mendaftarkan Akun...' : 'Buat Akun Sekarang'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Sudah punya akun?{' '}
          <Link to="/masuk" style={{ color: 'var(--primary-600)', fontWeight: 700 }}>
            Masuk Disini
          </Link>
        </div>

      </div>

    </div>
  );
};
