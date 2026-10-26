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
          
          {/* Refined Archival Brand Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--primary-indigo)',
            backgroundColor: 'var(--primary-50)',
            padding: '5px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--primary-200)',
            boxShadow: '0 1px 3px rgba(79, 70, 229, 0.08)'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-indigo)' }}></span>
            SISTEM REPOSITORI RESMI &bull; UNIVERSITAS NEGERI SEMARANG
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
              maxWidth: '820px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '6px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)'
            }}
          >
            <div style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0 0.85rem' }}>
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
                  fontSize: '0.925rem',
                  color: 'var(--ink-900)',
                  padding: '10px 0'
                }}
              />
            </div>

            <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-subtle)', display: 'none' }} className="d-md-block" />

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
              className="btn btn-primary"
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
          <div className="archive-card" style={{
            padding: '2rem',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-lost" style={{ fontSize: '0.68rem', padding: '3px 8px', letterSpacing: '0.04em' }}>
                <AlertCircle size={12} strokeWidth={2.5} /> KATEGORI 01 &bull; KEHILANGAN
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>FORM ARSIP</span>
            </div>

            <div>
              <h2 style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                color: 'var(--ink-900)',
                margin: '0 0 0.5rem'
              }}>
                Saya Kehilangan Barang
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-700)', lineHeight: 1.6, margin: 0 }}>
                Barang Anda tertinggal di fakultas, perpustakaan, atau area kampus? Catat laporannya agar petugas posko &amp; civitas dapat mencocokkannya.
              </p>
            </div>

            {/* Micro Feature List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--ink-600)', background: 'var(--bg-surface-alt)', padding: '0.75rem 1rem', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ color: 'var(--danger-500)', fontWeight: 700 }}>&bull;</span> Notifikasi otomatis saat ditemukan barang identik
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ color: 'var(--danger-500)', fontWeight: 700 }}>&bull;</span> Dilindungi verifikasi blind-test anti klaim fiktif
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <Link 
                to="/lapor/hilang" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: 'var(--danger-700)',
                  textDecoration: 'none',
                  border: '1px solid var(--danger-300)',
                  backgroundColor: 'var(--danger-50)',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(244, 63, 94, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--danger-600)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--danger-50)';
                  e.currentTarget.style.color = 'var(--danger-700)';
                }}
              >
                BUAT LAPORAN KEHILANGAN <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 2: Saya Menemukan Barang */}
          <div className="archive-card" style={{
            padding: '2rem',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-found" style={{ fontSize: '0.68rem', padding: '3px 8px', letterSpacing: '0.04em' }}>
                <Sparkles size={12} strokeWidth={2.5} /> KATEGORI 02 &bull; PENEMUAN
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>POSKO KAMPUS</span>
            </div>

            <div>
              <h2 style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                color: 'var(--ink-900)',
                margin: '0 0 0.5rem'
              }}>
                Saya Menemukan Barang
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-700)', lineHeight: 1.6, margin: 0 }}>
                Mengamankan barang milik orang lain di kampus? Catat kategori dan titipkan di posko fakultas terdekat agar dapat diambil pemilik sah.
              </p>
            </div>

            {/* Micro Feature List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--ink-600)', background: 'var(--bg-surface-alt)', padding: '0.75rem 1rem', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ color: 'var(--primary-indigo)', fontWeight: 700 }}>&bull;</span> Sensor otomatis foto dokumen untuk privasi
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ color: 'var(--primary-indigo)', fontWeight: 700 }}>&bull;</span> Serah terima resmi dengan Digital BAST kampus
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <Link 
                to="/lapor/temuan" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: 'var(--primary-700)',
                  textDecoration: 'none',
                  border: '1px solid var(--primary-300)',
                  backgroundColor: 'var(--primary-50)',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(79, 70, 229, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-indigo)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-50)';
                  e.currentTarget.style.color = 'var(--primary-700)';
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

