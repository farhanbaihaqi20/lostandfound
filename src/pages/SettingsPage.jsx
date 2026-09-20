import React from 'react';
import { 
  Settings, 
  Sun, 
  Moon, 
  ShieldAlert, 
  LogOut, 
  HelpCircle, 
  Lock, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage = () => {
  const { theme, toggleTheme, logout, user, isAdmin, switchDemoAccount } = useAuth();

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.5rem', maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Pengaturan & Kebijakan</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Kustomisasi tampilan, privasi akun, dan syarat ketentuan platform UNNES.
        </p>
      </div>

      {/* Tampilan (Dark / Light Mode) */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          Tampilan Aplikasi
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div
            onClick={() => theme === 'dark' && toggleTheme()}
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: theme === 'light' ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
              background: 'var(--bg-surface)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sun size={20} color="#f59e0b" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Mode Terang</span>
            </div>
            {theme === 'light' && <Check size={18} color="var(--primary-600)" />}
          </div>

          <div
            onClick={() => theme === 'light' && toggleTheme()}
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: theme === 'dark' ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
              background: 'var(--bg-surface)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Moon size={20} color="#60a5fa" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Mode Gelap</span>
            </div>
            {theme === 'dark' && <Check size={18} color="var(--primary-600)" />}
          </div>
        </div>
      </div>

      {/* Demo Switcher Quick Action */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Mode Testing / Demo Role</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Fitur ini memudahkan Anda menguji kedua sudut pandang: sebagai Mahasiswa pelapor maupun Admin Posko yang memverifikasi.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => switchDemoAccount('user')}
            className={`btn btn-sm ${!isAdmin ? 'btn-primary' : 'btn-outline'}`}
          >
            🎓 Masuk Sebagai Mahasiswa
          </button>
          <button 
            onClick={() => switchDemoAccount('admin')}
            className={`btn btn-sm ${isAdmin ? 'btn-primary' : 'btn-outline'}`}
          >
            🛡️ Masuk Sebagai Admin Posko
          </button>
        </div>
      </div>

      {/* Legal Disclaimer Box (Sesuai Blueprint Bab 6) */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontWeight: 700, fontSize: '0.95rem' }}>
          <ShieldAlert size={18} /> Penolakan Tanggung Jawab (Disclaimer Hukum)
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p>
            1. Pihak <strong>UNNES Lost & Found</strong> bertindak semata-mata sebagai media publikasi informasi dan fasilitator komunikasi antara penemu dan pemilik barang.
          </p>
          <p>
            2. Untuk penyerahan barang yang dilakukan secara mandiri (langsung) tanpa menggunakan Jasa Runner Resmi, segala bentuk kesepakatan, kondisi fisik barang, dan keamanan selama pertemuan menjadi tanggung jawab penuh kedua belah pihak.
          </p>
          <p>
            3. Kami sangat merekomendasikan penyerahan barang mandiri dilakukan di area publik kampus yang ramai dan terpantau (seperti Pos Satpam Fakultas, Kantin Utama Simpang Tujuh, atau Gedung Rektorat).
          </p>
          <p>
            4. Pihak platform hanya bertanggung jawab atas keamanan barang selama barang berada dalam penanganan langsung oleh Runner Resmi kami yang teridentifikasi.
          </p>
        </div>
      </div>

      {/* Logout */}
      <div>
        <button 
          onClick={logout} 
          className="btn btn-danger btn-sm"
          style={{ gap: '0.4rem' }}
        >
          <LogOut size={16} /> Keluar dari Akun
        </button>
      </div>

    </div>
  );
};
