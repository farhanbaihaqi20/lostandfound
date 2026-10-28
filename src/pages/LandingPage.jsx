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
import { LostSearchIllustration } from '../components/illustrations/LostSearchIllustration';
import { FoundHandoverIllustration } from '../components/illustrations/FoundHandoverIllustration';

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
            padding: '4px 14px',
            backgroundColor: '#EAE3D7',
            border: '1px solid #D8CEBE',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#475569',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: '#10B981',
              display: 'inline-block' 
            }} />
            <span>LAYANAN PELAPORAN KAMPUS UNNES</span>
          </div>

          {/* Title Row with Flanking Illustrations (Image 3) */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '1.5rem',
            width: '100%'
          }}>
            {/* Left illustration: Guy looking with magnifying glass */}
            <div style={{ display: 'none', flexShrink: 0 }} className="desktop-hero-illus">
              <LostSearchIllustration width={135} height={145} />
            </div>

            {/* Crisp, Natural Title */}
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.1rem, 4.8vw, 3.4rem)',
              fontWeight: 700,
              lineHeight: 1.18,
              letterSpacing: '-0.025em',
              color: 'var(--ink-900)',
              margin: '0.1rem 0',
              flex: 1
            }}>
              Hilang di area kampus? <br />
              <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--primary-indigo)' }}>
                Laporkan &amp; temukan kembali di sini.
              </span>
            </h1>

            {/* Right illustration: People handing over found box */}
            <div style={{ display: 'none', flexShrink: 0 }} className="desktop-hero-illus">
              <FoundHandoverIllustration width={145} height={145} />
            </div>
          </div>

          {/* Functional Subtitle */}
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.925rem, 1.8vw, 1.075rem)',
            color: 'var(--ink-600)',
            lineHeight: 1.55,
            maxWidth: '680px',
            margin: '0 0 0.5rem'
          }}>
            Platform pencatatan barang tertinggal civitas Universitas Negeri Semarang. Terkoneksi ke posko fakultas dengan verifikasi kepemilikan yang aman.
          </p>

          {/* Search Box Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            style={{
              width: '100%',
              maxWidth: '840px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '6px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 8px 30px rgba(44, 30, 20, 0.06)'
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
                padding: '0.7rem 1.5rem', 
                fontSize: '0.825rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                flexShrink: 0,
                borderRadius: '8px',
                backgroundColor: 'var(--primary-indigo)',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 700
              }}
            >
              <Search size={15} strokeWidth={2.5} /> CARI BARANG
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

          {/* Quick Action Dock: Two styled action cards (Image 3) */}
          <div style={{ width: '100%', maxWidth: '840px', marginTop: '0.5rem' }}>
            <div className="hero-action-grid">
              
              {/* Lost Action Card (Soft Rose Tint) */}
              <Link 
                to="/lapor/hilang" 
                className="action-dock-card"
                style={{
                  backgroundColor: '#FFF1F2',
                  border: '1px solid #FECDD3',
                  borderRadius: '14px',
                  padding: '1.25rem 1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  textDecoration: 'none',
                  textAlign: 'left',
                  boxShadow: '0 2px 10px rgba(225, 29, 72, 0.05)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(225, 29, 72, 0.12)';
                  e.currentTarget.style.borderColor = '#FCA5A5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(225, 29, 72, 0.05)';
                  e.currentTarget.style.borderColor = '#FECDD3';
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: '#FFE4E6',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <AlertCircle size={22} strokeWidth={2.2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                      Saya Kehilangan Barang
                    </span>
                    <ArrowRight size={16} color="var(--ink-400)" />
                  </div>
                  <p style={{ fontSize: '0.815rem', color: 'var(--ink-600)', margin: '0.2rem 0 0', lineHeight: 1.45 }}>
                    Catat ciri barang yang tertinggal agar civitas &amp; petugas posko bisa mencocokkan.
                  </p>
                </div>
                <div style={{ display: 'none', flexShrink: 0 }} className="desktop-card-thumb">
                  <LostSearchIllustration width={60} height={55} />
                </div>
              </Link>

              {/* Found Action Card (Soft Blue Tint) */}
              <Link 
                to="/lapor/temuan" 
                className="action-dock-card"
                style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '14px',
                  padding: '1.25rem 1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  textDecoration: 'none',
                  textAlign: 'left',
                  boxShadow: '0 2px 10px rgba(59, 130, 246, 0.05)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.12)';
                  e.currentTarget.style.borderColor = '#93C5FD';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(59, 130, 246, 0.05)';
                  e.currentTarget.style.borderColor = '#BFDBFE';
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: '#DBEAFE',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={22} strokeWidth={2.2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                      Saya Menemukan Barang
                    </span>
                    <ArrowRight size={16} color="var(--ink-400)" />
                  </div>
                  <p style={{ fontSize: '0.815rem', color: 'var(--ink-600)', margin: '0.2rem 0 0', lineHeight: 1.45 }}>
                    Amankan barang milik orang lain &amp; titipkan ke posko fakultas terdekat.
                  </p>
                </div>
                <div style={{ display: 'none', flexShrink: 0 }} className="desktop-card-thumb">
                  <FoundHandoverIllustration width={65} height={55} />
                </div>
              </Link>

            </div>
          </div>

          {/* Micro-Trust Bar (Image 3) */}
          <div style={{ width: '100%', maxWidth: '840px' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              padding: '0.85rem 1.5rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              fontSize: '0.8rem',
              color: 'var(--ink-600)',
              boxShadow: '0 2px 10px rgba(44, 30, 20, 0.03)'
            }}>
              <div className="trust-item">
                <EyeOff size={16} style={{ color: 'var(--primary-indigo)', flexShrink: 0 }} />
                <span><strong>Privasi Terjaga:</strong> Foto identitas disensor untuk umum</span>
              </div>
              <div className="trust-divider" />
              <div className="trust-item">
                <ShieldCheck size={16} style={{ color: 'var(--primary-indigo)', flexShrink: 0 }} />
                <span><strong>Blind-Test:</strong> Klaim kepemilikan anti asal ambil</span>
              </div>
              <div className="trust-divider" />
              <div className="trust-item">
                <FileCheck2 size={16} style={{ color: 'var(--primary-indigo)', flexShrink: 0 }} />
                <span><strong>Resmi:</strong> Serah terima dengan Berita Acara (BAST)</span>
              </div>
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
