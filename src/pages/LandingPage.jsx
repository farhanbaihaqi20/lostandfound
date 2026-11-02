import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  AlertCircle,
  Building2,
  Award,
  ShieldCheck,
  EyeOff,
  FileCheck2,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ItemCard } from '../components/ItemCard';
import { UNNES_BUILDINGS } from '../data/initialData';

const POPULAR_TAGS = ['KTM / Dompet', 'Kunci Motor', 'Helm', 'Jaket / Hoodie', 'Flashdisk', 'Botol Minum'];

export const LandingPage = () => {
  const { approvedItems } = useData();
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

  const handleTagClick = (tag) => {
    const cleanWord = tag.split('/')[0].trim();
    setSearchKeyword(cleanWord);
    navigate(`/jelajahi?q=${encodeURIComponent(cleanWord)}`);
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
  const countKembali = approvedItems.filter(i => i.item_status === 'dikembalikan').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }} className="pb-mobile-nav">
      
      {/* 1. Hero Section: Unified & Functional Campus Hub (Image 3) */}
      <section style={{
        padding: '3rem 0 2.25rem',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'transparent'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '980px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          
          {/* Official Campus Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '4px 12px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--ink-700)',
            letterSpacing: '0.02em',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
          }}>
            <span style={{ 
              width: '7px', 
              height: '7px', 
              borderRadius: '50%', 
              backgroundColor: '#10B981',
              display: 'inline-block' 
            }} />
            <span>Layanan Resmi Lost &amp; Found Kampus UNNES</span>
          </div>

          {/* Proper, Harmonious Title */}
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(2.2rem, 4.5vw, 3.3rem)',
            fontWeight: 800,
            lineHeight: 1.18,
            letterSpacing: '-0.035em',
            color: 'var(--ink-900)',
            margin: '0.2rem 0 0.5rem',
            textAlign: 'center'
          }}>
            Hilang di area kampus? <br />
            <span style={{ 
              color: 'var(--primary-indigo)',
              fontWeight: 800
            }}>
              Laporkan &amp; temukan kembali di sini.
            </span>
          </h1>

          {/* Search Box Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            style={{
              width: '100%',
              maxWidth: '840px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '6px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{ flex: '1 1 260px', display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0 0.85rem' }}>
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

            <div className="search-divider" />

            <div style={{ flex: '0 1 210px', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0 0.5rem' }}>
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
                padding: '0.7rem 1.4rem', 
                fontSize: '0.85rem',
                letterSpacing: '0.02em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                flexShrink: 0,
                borderRadius: '8px',
                backgroundColor: 'var(--primary-indigo)',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 600
              }}
            >
              <Search size={15} strokeWidth={2.5} /> Cari Barang
            </button>
          </form>

          {/* Quick Popular Keywords Row */}
          <div className="search-tags-row">
            <span>Sering dicari:</span>
            {POPULAR_TAGS.map(tag => (
              <button 
                key={tag}
                type="button"
                className="search-tag-chip"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Quick Action Dock: Dua Tombol Aksi Utama yang Rapi & Proporsional */}
          <div style={{ width: '100%', maxWidth: '840px', marginTop: '0.25rem' }}>
            <div className="hero-action-grid">
              
              {/* Lost Action Card */}
              <Link 
                to="/lapor/hilang" 
                className="action-dock-card action-dock-lost"
              >
                <div className="action-dock-icon lost">
                  <AlertCircle size={20} strokeWidth={2.2} />
                </div>
                <div className="action-dock-content">
                  <div className="action-dock-header">
                    <span className="action-dock-title">
                      Saya Kehilangan Barang
                    </span>
                    <ArrowRight size={16} className="action-dock-arrow" />
                  </div>
                  <p className="action-dock-desc">
                    Catat ciri &amp; pantau barang tertinggal
                  </p>
                </div>
              </Link>

              {/* Found Action Card */}
              <Link 
                to="/lapor/temuan" 
                className="action-dock-card action-dock-found"
              >
                <div className="action-dock-icon found">
                  <Sparkles size={20} strokeWidth={2.2} />
                </div>
                <div className="action-dock-content">
                  <div className="action-dock-header">
                    <span className="action-dock-title">
                      Saya Menemukan Barang
                    </span>
                    <ArrowRight size={16} className="action-dock-arrow" />
                  </div>
                  <p className="action-dock-desc">
                    Titipkan &amp; amankan ke posko fakultas
                  </p>
                </div>
              </Link>

            </div>
          </div>

          {/* Jaminan Layanan & Verifikasi Terpadu */}
          <div style={{
            width: '100%',
            maxWidth: '840px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            padding: '0.4rem 0.5rem',
            fontSize: '0.785rem',
            color: 'var(--ink-500)',
            marginTop: '0.25rem'
          }}>
            <div className="trust-item">
              <EyeOff size={15} style={{ color: 'var(--primary-indigo)', flexShrink: 0 }} />
              <span>Sensor Privasi Publik</span>
            </div>
            <span style={{ color: 'var(--border-color)', userSelect: 'none' }}>•</span>
            <div className="trust-item">
              <ShieldCheck size={15} style={{ color: 'var(--primary-indigo)', flexShrink: 0 }} />
              <span>Verifikasi Posko Fakultas</span>
            </div>
            <span style={{ color: 'var(--border-color)', userSelect: 'none' }}>•</span>
            <div className="trust-item">
              <FileCheck2 size={15} style={{ color: 'var(--primary-indigo)', flexShrink: 0 }} />
              <span>Berita Acara Digital (BAST)</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Section: Barang Terbaru Dilaporkan (Immediate Catalog) */}
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
              KATALOG KAMPUS TERBARU
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', fontWeight: 700, color: 'var(--ink-900)', margin: '0.15rem 0' }}>
              Barang Terbaru Dilaporkan
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-600)', margin: 0 }}>
              Daftar laporan aktif dari civitas UNNES yang diverifikasi posko fakultas.
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
            padding: '3.5rem 1rem',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px'
          }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--ink-700)', margin: 0 }}>
              Belum ada laporan barang untuk kategori ini.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/lapor/pilih" className="btn btn-secondary btn-sm">
                Buat Laporan Baru
              </Link>
            </div>
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
        <div style={{ textAlign: 'center', marginTop: '2.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-500)', marginBottom: '0.75rem' }}>
            Menampilkan {filteredRecentItems.length} dari {approvedItems.length} laporan aktif
          </div>
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
            LIHAT SEMUA BARANG <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 3. Section: Harmonisasi Statistik & Apresiasi Kejujuran */}
      <section className="container">
        <div className="impact-dual-container">
          
          {/* Card A: Statistik Aktivitas Kampus */}
          <div className="stats-card-box">
            <div>
              <div style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.7rem', 
                color: 'var(--ink-500)', 
                letterSpacing: '0.08em', 
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <Layers size={13} color="var(--primary-indigo)" />
                TRANSPARANSI KAMPUS
              </div>
              <h3 style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: '1.35rem', 
                fontWeight: 700, 
                color: 'var(--ink-900)', 
                margin: '0.3rem 0 0.25rem' 
              }}>
                Aktivitas Laporan Terkini
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--ink-600)', margin: 0, lineHeight: 1.5 }}>
                Pencatatan terbuka dan terpantau untuk seluruh civitas fakultas di lingkungan Universitas Negeri Semarang.
              </p>
            </div>

            <div className="stats-grid-quad">
              <div className="stat-quad-item">
                <div className="stat-quad-num" style={{ color: 'var(--ink-900)' }}>
                  {approvedItems.length}
                </div>
                <div className="stat-quad-label">Total Laporan</div>
                <div className="stat-quad-sub">Barang di katalog</div>
              </div>

              <div className="stat-quad-item">
                <div className="stat-quad-num" style={{ color: 'var(--danger-500)' }}>
                  {countHilang}
                </div>
                <div className="stat-quad-label">Barang Hilang</div>
                <div className="stat-quad-sub">Sedang dicari</div>
              </div>

              <div className="stat-quad-item">
                <div className="stat-quad-num" style={{ color: 'var(--primary-indigo)' }}>
                  {countTemuan}
                </div>
                <div className="stat-quad-label">Barang Temuan</div>
                <div className="stat-quad-sub">Diamankan di posko</div>
              </div>

              <div className="stat-quad-item">
                <div className="stat-quad-num" style={{ color: 'var(--accent-green)' }}>
                  {countKembali}
                </div>
                <div className="stat-quad-label">Sudah Kembali</div>
                <div className="stat-quad-sub">Sukses diserahterimakan</div>
              </div>
            </div>
          </div>

          {/* Card B: Program Apresiasi Kejujuran */}
          <div className="bounty-card-compact">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <span className="badge badge-bounty" style={{ width: 'fit-content' }}>
                <Award size={12} strokeWidth={2.5} /> PROGRAM APRESIASI
              </span>
              <h3 style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: '1.45rem', 
                fontWeight: 700, 
                color: 'var(--ink-900)', 
                margin: 0,
                lineHeight: 1.3
              }}>
                Hargai Kejujuran dengan Apresiasi Terbuka
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-700)', lineHeight: 1.55, margin: 0 }}>
                Pemilik barang dapat menyertakan imbalan sukarela sebagai tanda terima kasih kepada civitas yang mengembalikan barang berharga Anda.
              </p>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.4rem', 
                fontFamily: 'var(--font-sans)', 
                fontSize: '0.8rem', 
                color: 'var(--ink-700)',
                marginTop: '0.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--tag-bounty-ink)', fontWeight: 800 }}>✓</span>
                  <span>Nominal imbalan tertera transparan di halaman barang</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--tag-bounty-ink)', fontWeight: 800 }}>✓</span>
                  <span>Serah terima aman &amp; dicatat dengan BAST digital</span>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: '0.5rem' }}>
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
                  gap: '0.45rem'
                }}
              >
                LIHAT BARANG DENGAN HADIAH <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
