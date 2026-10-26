import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, ExternalLink, Clock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--ink-900)',
      color: '#D6D3D1',
      borderTop: '2px solid var(--ink-700)',
      marginTop: 'auto',
      padding: '3.5rem 0 2rem'
    }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Top Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          alignItems: 'flex-start'
        }}>
          
          {/* Brand & Address Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '340px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: '#FAF8F5',
                color: 'var(--ink-900)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: '0.85rem',
                borderRadius: '4px'
              }}>
                LF
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem', color: '#FAF8F5', letterSpacing: '-0.01em' }}>
                  UNNES Lost & Found
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#A8A29E', letterSpacing: '0.06em' }}>
                  UNIVERSITAS NEGERI SEMARANG
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.825rem', color: '#A8A29E', lineHeight: 1.6, margin: 0 }}>
              Sistem Terbuka Pencatatan & Pengembalian Barang Tercecer Civitas Kampus berbasis gotong royong dan verifikasi blind-test yang aman.
            </p>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.75rem', color: '#78716C', marginTop: '0.25rem' }}>
              <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#A8A29E' }} />
              <span>Gedung Rektorat Lt. 1, Kampus Sekaran, Gunungpati, Kota Semarang, Jawa Tengah 50229</span>
            </div>
          </div>

          {/* Navigasi Arsip */}
          <div>
            <h4 style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              letterSpacing: '0.08em', 
              color: '#FAF8F5',
              textTransform: 'uppercase',
              marginBottom: '1rem' 
            }}>
              ARSIP & NAVIGASI
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.825rem' }}>
              <li>
                <Link to="/" style={{ color: '#D6D3D1', textDecoration: 'none' }} className="footer-link">
                  Beranda Utama
                </Link>
              </li>
              <li>
                <Link to="/jelajahi" style={{ color: '#D6D3D1', textDecoration: 'none' }} className="footer-link">
                  Jelajahi Semua Arsip
                </Link>
              </li>
              <li>
                <Link to="/lapor/pilih" style={{ color: '#D6D3D1', textDecoration: 'none' }} className="footer-link">
                  Buat Laporan Baru
                </Link>
              </li>
              <li>
                <Link to="/pesan" style={{ color: '#D6D3D1', textDecoration: 'none' }} className="footer-link">
                  Obrolan & Verifikasi
                </Link>
              </li>
            </ul>
          </div>

          {/* SOP & Verifikasi */}
          <div>
            <h4 style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              letterSpacing: '0.08em', 
              color: '#FAF8F5',
              textTransform: 'uppercase',
              marginBottom: '1rem' 
            }}>
              SOP & PRIVASI KAMPUS
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.825rem' }}>
              <li style={{ color: '#A8A29E', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={14} color="#60A5FA" /> Verifikasi Blind-Test
              </li>
              <li style={{ color: '#A8A29E', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} color="#FBBF24" /> Sensor Foto Dokumen Otomatis
              </li>
              <li>
                <span style={{ color: '#A8A29E' }}>Posko Pengambilan Tersebar di 8 Fakultas</span>
              </li>
              <li>
                <Link to="/admin" style={{ color: '#93C5FD', textDecoration: 'none' }} className="footer-link">
                  Panel Petugas Posko & Admin &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Posko & Hotline */}
          <div>
            <h4 style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              letterSpacing: '0.08em', 
              color: '#FAF8F5',
              textTransform: 'uppercase',
              marginBottom: '1rem' 
            }}>
              STATUS OPERASIONAL
            </h4>
            <div style={{ 
              background: '#1E293B', 
              border: '1px solid #334155', 
              borderRadius: '4px', 
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                <span>ARSIP KAMPUS: AKTIF</span>
              </div>
              <div style={{ color: '#94A3B8' }}>
                Jam Operasional Posko:<br />
                Senin - Jumat (08.00 - 16.00 WIB)
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid #292524',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.75rem',
          color: '#78716C'
        }}>
          <div>
            &copy; {new Date().getFullYear()} UNNES Lost & Found &mdash; Redesign Arsip Kampus.
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#A8A29E' }}>
            UNIVERSITAS NEGERI SEMARANG &bull; REPOSITORY ARSIP TERBUKA
          </div>
        </div>

      </div>

      <style>{`
        .footer-link:hover {
          color: #FAF8F5 !important;
          text-decoration: underline !important;
        }
      `}</style>
    </footer>
  );
};
