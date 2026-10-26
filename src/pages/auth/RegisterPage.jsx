import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, AlertCircle, GraduationCap, ArrowLeft, Lock, Phone } from 'lucide-react';
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

  const handleCancelGoogle = async () => {
    await cancelPendingGoogle();
    setErrorMsg('');
    clearAuthError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    clearAuthError();

    const cleanEmail = formData.email.trim().toLowerCase();
    if (!validateUnnesEmail(cleanEmail)) {
      setErrorMsg('Pendaftaran ditolak: Wajib menggunakan email resmi mahasiswa UNNES (@students.unnes.ac.id). Email selain domain UNNES tidak diizinkan.');
      return;
    }

    if (!formData.nim || formData.nim.trim().length < 5) {
      setErrorMsg('NIM tidak valid. Mohon isi NIM lengkap Anda (minimal 5 karakter).');
      return;
    }

    if (!formData.phone || formData.phone.trim().length < 9) {
      setErrorMsg('Mohon masukkan nomor WhatsApp aktif (minimal 9 digit) untuk keperluan koordinasi pengembalian barang.');
      return;
    }

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

  return (
    <div style={{
      minHeight: 'calc(100vh - 65px)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
      backgroundColor: 'var(--bg-canvas)'
    }}>
      
      {/* Left Column: Dark Navy Editorial Panel (Figma 07 Daftar) */}
      <div style={{
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
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
            backgroundColor: 'var(--primary-indigo)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: '0.95rem',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)'
          }}>
            LF
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.1rem', color: '#FFFFFF' }}>
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
            color: '#818CF8',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}>
            DAFTAR AKUN &bull; CIVITAS AKADEMIKA
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 700,
            lineHeight: 1.2,
            color: '#FFFFFF',
            margin: '0 0 1.25rem'
          }}>
            &ldquo;Satu akun. Satu kampus saling menjaga.&rdquo;
          </h2>
          <p style={{
            fontSize: '0.95rem',
            color: '#94A3B8',
            lineHeight: 1.65,
            margin: 0
          }}>
            Bergabunglah dengan ribuan mahasiswa dan civitas Universitas Negeri Semarang dalam menjaga integritas, keamanan barang berharga, dan budaya tolong-menolong di kampus.
          </p>
        </div>

        {/* Bottom Bar */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#64748B' }}>
          UNIVERSITAS NEGERI SEMARANG &bull; UNNES LOST &amp; FOUND
        </div>
      </div>

      {/* Right Column: Slate Form Panel */}
      <div style={{
        backgroundColor: 'var(--bg-card-alt)',
        padding: '3rem 2.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Header */}
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 700, color: 'var(--ink-900)', margin: '0 0 0.35rem' }}>
              {pendingGoogleUser ? 'Lengkapi Data Mahasiswa' : 'Daftar Akun Mahasiswa'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-700)', margin: 0 }}>
              {pendingGoogleUser 
                ? 'Konfirmasi identitas akademik untuk mengaktifkan akun.' 
                : 'Khusus civitas aktif Universitas Negeri Semarang (@students.unnes.ac.id).'}
            </p>
          </div>

          {activeError && (
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              borderRadius: '4px',
              fontSize: '0.825rem',
              border: '1px solid #FCA5A5',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{activeError}</div>
            </div>
          )}

          {/* Conditional: Pending Google User Onboarding Form */}
          {pendingGoogleUser ? (
            <form onSubmit={handleCompleteGoogle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  NAMA LENGKAP MAHASISWA
                </label>
                <input
                  type="text"
                  required
                  value={googleFormData.full_name}
                  onChange={(e) => setGoogleFormData(p => ({ ...p, full_name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    NIM MAHASISWA *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 410142..."
                    value={googleFormData.nim}
                    onChange={(e) => setGoogleFormData(p => ({ ...p, nim: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: '#FFFFFF',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    FAKULTAS
                  </label>
                  <select
                    value={googleFormData.fakultas}
                    onChange={(e) => setGoogleFormData(p => ({ ...p, fakultas: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: '#FFFFFF',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.875rem'
                    }}
                  >
                    {['FMIPA', 'FT', 'FBS', 'FEB', 'FIP', 'FISIP', 'FIK', 'FKK', 'FH', 'Pascasarjana'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  PROGRAM STUDI (OPSIONAL)
                </label>
                <input
                  type="text"
                  placeholder="Misal: S1 Ilmu Komputer"
                  value={googleFormData.prodi}
                  onChange={(e) => setGoogleFormData(p => ({ ...p, prodi: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  NOMOR WHATSAPP AKTIF *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08xxxxxxxxxx"
                  value={googleFormData.phone}
                  onChange={(e) => setGoogleFormData(p => ({ ...p, phone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.875rem'
                  }}
                />
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
                {loading ? 'MENYIMPAN...' : 'SELESAIKAN PENDAFTARAN & MASUK'}
              </button>

              <button
                type="button"
                onClick={handleCancelGoogle}
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.8rem' }}
              >
                Batal / Gunakan Akun Lain
              </button>
            </form>
          ) : (
            <>
              {/* Google OAuth Register */}
              <button
                type="button"
                onClick={handleGoogleRegister}
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
                Daftar dengan Akun Google UNNES
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-500)' }}>ATAU DAFTAR MANUAL</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              </div>

              {/* Manual Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    NAMA LENGKAP MAHASISWA
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Farhan Baihaqi"
                    value={formData.full_name}
                    onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: '#FFFFFF',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    EMAIL RESMI (@students.unnes.ac.id)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@students.unnes.ac.id"
                    value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: '#FFFFFF',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      NIM MAHASISWA
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="410142..."
                      value={formData.nim}
                      onChange={(e) => setFormData(p => ({ ...p, nim: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: '#FFFFFF',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      FAKULTAS
                    </label>
                    <select
                      value={formData.fakultas}
                      onChange={(e) => setFormData(p => ({ ...p, fakultas: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: '#FFFFFF',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.875rem'
                      }}
                    >
                      {['FMIPA', 'FT', 'FBS', 'FEB', 'FIP', 'FISIP', 'FIK', 'FKK', 'FH', 'Pascasarjana'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      WHATSAPP AKTIF
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="08xxxxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: '#FFFFFF',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      KATA SANDI
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: '#FFFFFF',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
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
                  {loading ? 'MENDAFTARKAN...' : 'BUAT AKUN SEKARANG'}
                </button>
              </form>

              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--ink-700)', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                Sudah memiliki akun?{' '}
                <Link to="/masuk" style={{ color: 'var(--ink-900)', fontWeight: 700, textDecoration: 'underline' }}>
                  Masuk Disini
                </Link>
              </div>
            </>
          )}

        </div>
      </div>

    </div>
  );
};
