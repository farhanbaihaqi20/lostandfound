import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Footer = () => {
  const location = useLocation();

  // Hide footer on vital interactive application pages & workspace menus
  const hiddenPrefixes = [
    '/pesan',
    '/admin',
    '/lapor',
    '/masuk',
    '/daftar',
    '/beranda',
    '/laporan-saya',
    '/pengaturan',
    '/notifikasi',
    '/profil'
  ];

  const shouldHide = hiddenPrefixes.some(prefix => 
    location.pathname === prefix || location.pathname.startsWith(prefix + '/')
  );

  if (shouldHide) {
    return null;
  }

  return (
    <footer style={{
      backgroundColor: 'var(--bg-card)',
      borderTop: '1px solid var(--border-subtle)',
      marginTop: 'auto',
      padding: '1.25rem 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        fontSize: '0.8rem',
        color: 'var(--ink-500)'
      }}>
        {/* Brand & Copyright */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '24px',
            height: '24px',
            background: 'var(--primary-indigo)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: '0.7rem',
            borderRadius: '4px'
          }}>
            LF
          </div>
          <span style={{ fontWeight: 600, color: 'var(--ink-800)' }}>
            UNNES Lost &amp; Found
          </span>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <span>&copy; {new Date().getFullYear()} Universitas Negeri Semarang</span>
        </div>

        {/* Compact Right Links & System Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--ink-600)', textDecoration: 'none' }} className="footer-compact-link">
            Beranda
          </Link>
          <Link to="/jelajahi" style={{ color: 'var(--ink-600)', textDecoration: 'none' }} className="footer-compact-link">
            Katalog
          </Link>
          <Link to="/lapor/pilih" style={{ color: 'var(--ink-600)', textDecoration: 'none' }} className="footer-compact-link">
            Lapor
          </Link>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '2px 8px',
            borderRadius: '4px',
            background: '#ECFDF5',
            color: '#059669',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.675rem',
            fontWeight: 700
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></span>
            LAYANAN AKTIF
          </div>
        </div>
      </div>

      <style>{`
        .footer-compact-link:hover {
          color: var(--primary-indigo) !important;
          text-decoration: underline !important;
        }
      `}</style>
    </footer>
  );
};
