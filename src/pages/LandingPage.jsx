import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  Award, 
  Building2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ItemCard } from '../components/ItemCard';
import { UNNES_BUILDINGS } from '../data/initialData';

export const LandingPage = () => {
  const { approvedItems, items } = useData();
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [activeTab, setActiveTab] = useState('semua'); // 'semua' | 'hilang' | 'temuan'

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.append('q', searchKeyword.trim());
    if (selectedLocation) params.append('lokasi', selectedLocation);
    navigate(`/jelajahi?${params.toString()}`);
  };

  const handleQuickSearch = (keyword) => {
    navigate(`/jelajahi?q=${encodeURIComponent(keyword)}`);
  };

  // Filter items for tab
  const filteredRecentItems = approvedItems
    .filter(item => {
      if (activeTab === 'hilang') return item.type === 'hilang';
      if (activeTab === 'temuan') return item.type === 'temuan';
      return true;
    })
    .slice(0, 6);

  const countHilang = approvedItems.filter(i => i.type === 'hilang').length;
  const countTemuan = approvedItems.filter(i => i.type === 'temuan').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }} className="pb-mobile-nav">
      
      {/* 1. Hero Section (01 Beranda — Desktop) */}
      <section style={{
        padding: '3.5rem 0 2.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-canvas)'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '860px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          
          {/* Monospace Archival Label */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-700)',
            backgroundColor: 'var(--bg-card)',
            padding: '4px 12px',
            borderRadius: '4px',
            border: '1px solid var(--border-subtle)'
          }}>
            ARSIP BARANG HILANG &amp; TEMUAN KAMPUS
          </div>

          {/* Fraunces Headline */}
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.4rem, 5.5vw, 3.75rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            color: 'var(--ink-900)',
            margin: '0.2rem 0'
          }}>
            Hilang di kampus,<br />
            <span style={{ fontStyle: 'italic', fontWeight: 400 }}>ditemukan di sini.</span>
          </h1>

          {/* Editorial Subtext */}
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.95rem, 1.8vw, 1.125rem)',
            color: 'var(--ink-700)',
            lineHeight: 1.6,
            maxWidth: '680px',
            margin: '0 0 0.5rem'
          }}>
            Platform terbuka civitas Universitas Negeri Semarang untuk mencatat, melacak, dan mengembalikan barang tercecer dengan aman dan transparan.
          </p>

          {/* Search Box Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            style={{
              width: '100%',
              maxWidth: '780px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.75rem' }}>
              <Search size={18} color="var(--ink-500)" style={{ flexShrink: 0 }} />
              <input 
                type="text" 
                placeholder="Cari nama barang, nomor seri, atau kata kunci..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  background: 'transparent',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem',
                  color: 'var(--ink-900)',
                  padding: '8px 0'
                }}
              />
            </div>

            <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--border-subtle)', display: 'none' }} className="d-md-block" />

            <div style={{ flex: '0 1 200px', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0 0.5rem' }}>
              <Building2 size={16} color="var(--ink-500)" style={{ flexShrink: 0 }} />
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                  color: selectedLocation ? 'var(--ink-900)' : 'var(--ink-500)',
                  width: '100%',
                  cursor: 'pointer'
                }}
              >
                <option value="">Semua Fakultas / Lokasi</option>
                {UNNES_BUILDINGS.map(b => (
                  <option key={b.id || b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-dark"
              style={{ 
                padding: '0.65rem 1.4rem', 
                fontSize: '0.825rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                flexShrink: 0
              }}
            >
              <Search size={15} strokeWidth={2.5} /> CARI BARANG
            </button>
          </form>

          {/* Quick Search Ticker */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            fontSize: '0.75rem',
            color: 'var(--ink-500)',
            marginTop: '0.25rem'
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Pencarian populer:</span>
            {['KTM UNNES', 'Helm KYT', 'Kunci Honda', 'Jaket Parka', 'Flashdisk Sandisk', 'Kacamata'].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQuickSearch(tag)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'var(--ink-700)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                className="hover-tag-btn"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 2. Dua Kartu Pilihan Utama (SAYA KEHILANGAN vs SAYA MENEMUKAN) */}
      <section className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Card 1: Saya Kehilangan Barang */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '4px solid #DC2626',
            borderRadius: '6px',
            padding: '2rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-lost">
                <AlertCircle size={12} strokeWidth={2.5} /> KATEGORI 01
              </span>
            </div>

            <div>
              <h2 style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: '1.45rem', 
                fontWeight: 700, 
                color: 'var(--ink-900)',
                margin: '0 0 0.4rem'
              }}>
                Saya Kehilangan Barang
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-700)', lineHeight: 1.55, margin: 0 }}>
                Laporkan barang Anda yang tertinggal atau tercecer di lingkungan kampus agar civitas dan posko dapat membantu menemukan dengan cepat.
              </p>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <Link 
                to="/lapor/hilang" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: '#DC2626',
                  textDecoration: 'none',
                  border: '1px solid #FCA5A5',
                  backgroundColor: '#FEF2F2',
                  padding: '8px 14px',
                  borderRadius: '4px',
                  transition: 'background 0.15s ease'
                }}
              >
                BUAT LAPORAN KEHILANGAN <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 2: Saya Menemukan Barang */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '4px solid #2563EB',
            borderRadius: '6px',
            padding: '2rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-found">
                <Sparkles size={12} strokeWidth={2.5} /> KATEGORI 02
              </span>
            </div>

            <div>
              <h2 style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: '1.45rem', 
                fontWeight: 700, 
                color: 'var(--ink-900)',
                margin: '0 0 0.4rem'
              }}>
                Saya Menemukan Barang
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-700)', lineHeight: 1.55, margin: 0 }}>
                Pegang barang milik orang lain? Catat ciri-cirinya tanpa membocorkan detail sensitif agar dapat diklaim oleh pemilik sah melalui blind-test.
              </p>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <Link 
                to="/lapor/temuan" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: '#2563EB',
                  textDecoration: 'none',
                  border: '1px solid #93C5FD',
                  backgroundColor: '#EFF6FF',
                  padding: '8px 14px',
                  borderRadius: '4px',
                  transition: 'background 0.15s ease'
                }}
              >
                LAPORKAN BARANG TEMUAN <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section: Barang Terbaru Dilaporkan */}
      <section className="container">
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-500)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ARSIP TERBARU KAMPUS
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink-900)', margin: '0.2rem 0' }}>
              Barang Terbaru Dilaporkan
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-700)', margin: 0 }}>
              Arsip data barang yang baru saja dicatat oleh civitas UNNES hari ini.
            </p>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('semua')}
              className={`filter-chip ${activeTab === 'semua' ? 'active' : ''}`}
            >
              SEMUA ({approvedItems.length})
            </button>
            <button
              onClick={() => setActiveTab('hilang')}
              className={`filter-chip ${activeTab === 'hilang' ? 'active' : ''}`}
            >
              BARANG HILANG ({countHilang})
            </button>
            <button
              onClick={() => setActiveTab('temuan')}
              className={`filter-chip ${activeTab === 'temuan' ? 'active' : ''}`}
            >
              BARANG TEMUAN ({countTemuan})
            </button>
          </div>
        </div>

        {/* Item Grid */}
        {filteredRecentItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px'
          }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--ink-700)' }}>
              Belum ada arsip untuk kategori ini.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredRecentItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Link to Explore */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link 
            to="/jelajahi" 
            className="btn btn-secondary"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            LIHAT SEMUA ARSIP DI JELAJAHI <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 4. Program Hadiah Banner (01 Beranda — Desktop) */}
      <section className="container">
        <div style={{
          backgroundColor: '#FFFDF5',
          border: '1px solid #FEF08A',
          borderRadius: '6px',
          padding: '2.5rem 2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <span className="badge badge-bounty" style={{ width: 'fit-content' }}>
              <Award size={12} strokeWidth={2.5} /> PROGRAM APRESIASI RESMI
            </span>
            <h2 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '1.85rem', 
              fontWeight: 700, 
              color: 'var(--ink-900)', 
              margin: 0,
              lineHeight: 1.25
            }}>
              Hargai Kejujuran dengan Imbalan Terbuka
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-700)', lineHeight: 1.6, margin: 0 }}>
              Beri apresiasi bagi civitas penemu yang mengembalikan barang berharga Anda. Transparan, aman, dan memicu budaya kejujuran di seluruh fakultas UNNES.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--ink-700)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#CA8A04" />
                <span>Nominal imbalan tercatat resmi di arsip barang</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#CA8A04" />
                <span>Serah terima di Posko Keamanan atau Gedung Rektorat</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#CA8A04" />
                <span>Tercatat dalam Berita Acara Serah Terima digital</span>
              </div>
            </div>

            <Link 
              to="/jelajahi?hadiah=true" 
              className="btn btn-dark btn-sm"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginTop: '0.5rem'
              }}
            >
              LIHAT BARANG DENGAN HADIAH <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Statistik & Metrik Arsip Kampus */}
      <section className="container">
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '2.5rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '2.4rem', 
              fontWeight: 700, 
              color: 'var(--ink-900)',
              lineHeight: 1
            }}>
              {(items?.length || 9) + 142}
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink-900)', marginTop: '0.5rem' }}>
              Total Arsip Tercatat
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '2px' }}>
              Periode Tahun Akademik Ini
            </div>
          </div>

          <div>
            <div style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '2.4rem', 
              fontWeight: 700, 
              color: '#059669',
              lineHeight: 1
            }}>
              89%
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink-900)', marginTop: '0.5rem' }}>
              Tingkat Pengembalian
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '2px' }}>
              Berhasil Verifikasi &amp; Diambil
            </div>
          </div>

          <div>
            <div style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '2.4rem', 
              fontWeight: 700, 
              color: '#2563EB',
              lineHeight: 1
            }}>
              12 Posko
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink-900)', marginTop: '0.5rem' }}>
              Titik Pengambilan Aktif
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '2px' }}>
              Tersebar di Seluruh Fakultas
            </div>
          </div>

          <div>
            <div style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '2.4rem', 
              fontWeight: 700, 
              color: 'var(--ink-900)',
              lineHeight: 1
            }}>
              &lt; 24 Jam
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink-900)', marginTop: '0.5rem' }}>
              Rata-rata Respon Posko
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '2px' }}>
              Verifikasi Blind-Test Cepat
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .hover-tag-btn:hover {
          background-color: var(--border-subtle) !important;
        }
      `}</style>
    </div>
  );
};

