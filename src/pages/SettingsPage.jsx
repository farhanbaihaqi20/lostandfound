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
  Smartphone,
  ShieldCheck
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
    <div style={{ background: 'var(--bg-canvas)', minHeight: 'calc(100vh - 72px)', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.08em', color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            KONFIGURASI SISTEM
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600, color: 'var(--ink-900)', margin: '0 0 0.35rem' }}>
            Pengaturan &amp; Kebijakan
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-700)', margin: 0 }}>
            Kustomisasi preferensi navigasi perangkat, serta syarat dan ketentuan layanan UNNES Lost &amp; Found.
          </p>
        </div>

        {/* Tampilan Tema: Terkunci ke Mode Terang */}
        <div className="archive-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.06em', color: 'var(--ink-500)', textTransform: 'uppercase' }}>
              TEMA TAMPILAN
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink-900)', marginTop: '0.2rem' }}>
              Mode Terang (Slate Light)
            </div>
          </div>
          <span className="badge badge-verified" style={{ fontSize: '0.75rem' }}>
            <Check size={13} /> Aktif
          </span>
        </div>

        {/* Pengaturan Navigasi Bawah Mengambang */}
        <div className="archive-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.06em', color: 'var(--ink-500)', textTransform: 'uppercase' }}>
              NAVIGASI MOBILE
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-700)', marginTop: '0.2rem', marginBottom: 0 }}>
              Konfigurasi bilah menu bawah pada perangkat layar sentuh agar menjelajah katalog lebih leluasa.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Status Visibilitas Navigasi */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '2px',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {bottomNavCollapsed ? <EyeOff size={18} color="var(--ink-500)" /> : <Eye size={18} color="var(--ink-900)" />}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--ink-900)' }}>Status Navigasi Bawah</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>
                    {bottomNavCollapsed ? 'Sedang diciutkan (tombol pemicu ringkas)' : 'Sedang ditampilkan penuh'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleBottomNavCollapsed(!bottomNavCollapsed)}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                {bottomNavCollapsed ? 'Tampilkan' : 'Ciutkan'}
              </button>
            </div>

            {/* Opsi Auto-Hide saat Scroll */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '2px',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ArrowDownUp size={18} color="var(--ink-700)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--ink-900)' }}>Sembunyikan Otomatis saat Gulir</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>
                    Navigasi turun saat scroll ke bawah, muncul saat scroll ke atas
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleAutoHideNav(!autoHideNav)}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                {autoHideNav ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="archive-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--tag-lost-ink)', fontWeight: 600, fontSize: '0.9rem' }}>
            <ShieldAlert size={17} /> Penolakan Tanggung Jawab (Disclaimer SOP)
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--ink-700)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ margin: 0 }}>
              1. Platform <strong>UNNES Lost &amp; Found</strong> bertindak sebagai media publikasi informasi dan fasilitator verifikasi blind test antara penemu dan pemilik barang.
            </p>
            <p style={{ margin: 0 }}>
              2. Untuk penyerahan mandiri tanpa Jasa Runner Resmi, kondisi fisik barang dan keselamatan pertemuan menjadi tanggung jawab kedua belah pihak.
            </p>
            <p style={{ margin: 0 }}>
              3. Seluruh serah terima barang wajib mengesahkan dokumen Berita Acara Serah Terima (BAST) digital yang disediakan platform.
            </p>
          </div>
        </div>

        {/* Logout */}
        <div>
          <button 
            onClick={logout} 
            className="btn-secondary"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.8rem', 
              padding: '0.6rem 1.15rem',
              color: 'var(--tag-lost-ink)',
              borderColor: 'var(--tag-lost-border)'
            }}
          >
            <LogOut size={15} /> KELUAR DARI AKUN
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
