import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, ExternalLink, Clock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--ink-900)',
      color: '#E2E8F0',
      borderTop: '1px solid #1E293B',
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
                background: 'var(--primary-indigo)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: '0.85rem',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
              }}>
                LF
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                  UNNES Lost & Found
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#94A3B8', letterSpacing: '0.06em' }}>
                  UNIVERSITAS NEGERI SEMARANG
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.825rem', color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
              Sistem Terbuka Pencatatan & Pengembalian Barang Tercecer Civitas Kampus berbasis gotong royong dan verifikasi blind-test yang aman.
            </p>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
              <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#94A3B8' }} />
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
              color: '#FFFFFF',
              textTransform: 'uppercase',
              marginBottom: '1rem' 
            }}>
              KATALOG &amp; NAVIGASI
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.825rem' }}>
              <li>
                <Link to="/" style={{ color: '#CBD5E1', textDecoration: 'none' }} className="footer-link">
                  Beranda Utama
                </Link>
              </li>
              <li>
                <Link to="/jelajahi" style={{ color: '#CBD5E1', textDecoration: 'none' }} className="footer-link">
                  Jelajahi Semua Barang
                </Link>
              </li>
              <li>
                <Link to="/lapor/pilih" style={{ color: '#CBD5E1', textDecoration: 'none' }} className="footer-link">
                  Buat Laporan Baru
                </Link>
              </li>
              <li>
                <Link to="/pesan" style={{ color: '#CBD5E1', textDecoration: 'none' }} className="footer-link">
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
              color: '#FFFFFF',
              textTransform: 'uppercase',
              marginBottom: '1rem' 
            }}>
              SOP & PRIVASI KAMPUS
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.825rem' }}>
              <li style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={14} color="#818CF8" /> Verifikasi Blind-Test
              </li>
              <li style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} color="#FBBF24" /> Sensor Foto Dokumen Otomatis
              </li>
              <li>
                <span style={{ color: '#94A3B8' }}>Posko Pengambilan Tersebar di 8 Fakultas</span>
              </li>
              <li>
                <Link to="/admin" style={{ color: '#A5B4FC', textDecoration: 'none' }} className="footer-link">
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
              color: '#FFFFFF',
              textTransform: 'uppercase',
              marginBottom: '1rem' 
            }}>
              STATUS OPERASIONAL
            </h4>
            <div style={{ 
              background: '#0B1120', 
              border: '1px solid #1E293B', 
              borderRadius: '6px', 
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                <span>LAYANAN KAMPUS: AKTIF</span>
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
          borderTop: '1px solid #1E293B',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.75rem',
          color: '#64748B'
        }}>
          <div>
            &copy; {new Date().getFullYear()} UNNES Lost &amp; Found &mdash; Platform Informasi Barang Hilang.
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#94A3B8' }}>
            UNIVERSITAS NEGERI SEMARANG &bull; LOST &amp; FOUND KAMPUS
          </div>
        </div>

      </div>

      <style>{`
        .footer-link:hover {
          color: #FFFFFF !important;
          text-decoration: underline !important;
        }
      `}</style>
    </footer>
  );
};
