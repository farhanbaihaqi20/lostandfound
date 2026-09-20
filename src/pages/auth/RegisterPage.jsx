import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    nim: '',
    fakultas: 'FMIPA',
    prodi: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      alert('Pendaftaran akun UNNES berhasil! Selamat datang.');
      navigate('/beranda');
    } else {
      setErrorMsg(res.message || 'Gagal mendaftar');
    }
  };

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
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--primary-800) 0%, var(--teal-600) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Compass size={26} />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Daftar Akun Mahasiswa</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Bergabung dalam ekosistem tolong-menolong kampus UNNES
          </p>
        </div>

        {errorMsg && (
          <div style={{
            padding: '0.65rem 0.85rem',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            marginBottom: '1rem'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nama Lengkap:</label>
            <input
              type="text"
              required
              placeholder="Farhan Baihaqi"
              value={formData.full_name}
              onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email Mahasiswa (UNNES Mail):</label>
            <input
              type="email"
              required
              placeholder="nama@students.unnes.ac.id"
              value={formData.email}
              onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>NIM:</label>
              <input
                type="text"
                required
                placeholder="410142..."
                value={formData.nim}
                onChange={(e) => setFormData(p => ({ ...p, nim: e.target.value }))}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fakultas:</label>
              <select
                value={formData.fakultas}
                onChange={(e) => setFormData(p => ({ ...p, fakultas: e.target.value }))}
              >
                {['FMIPA', 'FT', 'FBS', 'FEB', 'FIP', 'FISIP', 'FIK', 'FKK', 'FH'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nomor WhatsApp:</label>
            <input
              type="tel"
              required
              placeholder="08xxxxxxxxxx"
              value={formData.phone}
              onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Kata Sandi (Minimal 6 karakter):</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Mendaftarkan...' : 'Buat Akun Sekarang'}
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
