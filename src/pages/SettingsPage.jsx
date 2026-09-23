import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Sun, 
  Moon, 
  ShieldAlert, 
  LogOut, 
  Check, 
  Navigation, 
  Eye, 
  EyeOff, 
  ArrowDownUp, 
  Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage = () => {
  const { theme, toggleTheme, logout, user, isAdmin } = useAuth();

  // Floating Bottom Nav Settings
  const [bottomNavCollapsed, setBottomNavCollapsed] = useState(() => {
    try {
      return localStorage.getItem('unnes_bottom_nav_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [autoHideNav, setAutoHideNav] = useState(() => {
    try {
      return localStorage.getItem('unnes_bottom_nav_autohide') === 'true';
    } catch {
      return false;
    }
  });

  const toggleBottomNavCollapsed = (collapsed) => {
    setBottomNavCollapsed(collapsed);
    try {
      localStorage.setItem('unnes_bottom_nav_collapsed', String(collapsed));
      window.dispatchEvent(new CustomEvent('unnes_bottom_nav_change', { detail: { isCollapsed: collapsed } }));
    } catch {
      // ignore
    }
  };

  const toggleAutoHideNav = (enabled) => {
    setAutoHideNav(enabled);
    try {
      localStorage.setItem('unnes_bottom_nav_autohide', String(enabled));
      window.dispatchEvent(new CustomEvent('unnes_bottom_nav_change', { detail: { autoHide: enabled } }));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleNavChange = (e) => {
      if (e.detail?.isCollapsed !== undefined) {
        setBottomNavCollapsed(e.detail.isCollapsed);
      }
      if (e.detail?.autoHide !== undefined) {
        setAutoHideNav(e.detail.autoHide);
      }
    };
    window.addEventListener('unnes_bottom_nav_change', handleNavChange);
    return () => window.removeEventListener('unnes_bottom_nav_change', handleNavChange);
  }, []);

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

      {/* Pengaturan Navigasi Bawah Mengambang */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Navigation size={18} color="var(--primary-600)" /> Navigasi Bawah Mengambang
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Atur keterlihatan bilah menu bawah agar tidak menghalangi tampilan saat membaca konten.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Status Visibilitas Navigasi */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {bottomNavCollapsed ? <EyeOff size={18} color="var(--text-muted)" /> : <Eye size={18} color="var(--primary-600)" />}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Status Navigasi Bawah</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {bottomNavCollapsed ? 'Sedang disembunyikan (hanya tombol pemicu)' : 'Sedang ditampilkan penuh'}
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleBottomNavCollapsed(!bottomNavCollapsed)}
              className={`btn btn-sm ${bottomNavCollapsed ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
            >
              {bottomNavCollapsed ? 'Tampilkan' : 'Sembunyikan'}
            </button>
          </div>

          {/* Opsi Auto-Hide saat Scroll */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ArrowDownUp size={18} color="var(--amber-500)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Sembunyikan Otomatis saat Gulir Layar</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Navigasi otomatis turun saat scroll ke bawah dan naik saat scroll ke atas
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleAutoHideNav(!autoHideNav)}
              className={`btn btn-sm ${autoHideNav ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
            >
              {autoHideNav ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>

          {/* Petunjuk Gestur Pengguna */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              padding: '0.75rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-50)',
              border: '1px solid var(--primary-200)',
              fontSize: '0.775rem',
              color: 'var(--primary-900)',
              lineHeight: 1.5
            }}
          >
            <Smartphone size={18} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Gestur Cepat Layar Sentuh:</strong> Anda dapat langsung menggeser/mengusap (*swipe down*) bilah navigasi ke bawah untuk menyembunyikannya, dan mengetuk atau menggeser ke atas (*swipe up*) tombol <em>"Buka Navigasi"</em> untuk memunculkannya kembali.
            </div>
          </div>
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
