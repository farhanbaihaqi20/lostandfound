import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  MapPin,
  ChevronDown,
  Award,
  ShieldCheck,
  EyeOff,
  FileCheck2,
  Layers,
  X,
  PackageCheck,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ItemCard } from '../components/ItemCard';
import { UNNES_BUILDINGS } from '../data/initialData';
import { sortItemsByPriority } from '../lib/itemSorting';

const POPULAR_TAGS = ['KTM / Dompet', 'Kunci Motor', 'Helm', 'Jaket / Hoodie', 'Flashdisk', 'Botol Minum'];

export const LandingPage = () => {
  const { approvedItems } = useData();
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [activeTab, setActiveTab] = useState('semua'); // 'semua' | 'hilang' | 'temuan'
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  const locationRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocationModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setShowLocationModal(false);
  };

  // Filter items for tab (10 items gives clean full rows in 5-col desktop & 2-col mobile)
  const filteredRecentItems = sortItemsByPriority(approvedItems)
    .filter(item => {
      if (activeTab === 'hilang') return item.type === 'hilang';
      if (activeTab === 'temuan') return item.type === 'temuan';
      return true;
    })
    .slice(0, 10);

  const countHilang = approvedItems.filter(i => i.type === 'hilang').length;
  const countTemuan = approvedItems.filter(i => i.type === 'temuan').length;
  const countKembali = approvedItems.filter(i => i.item_status === 'dikembalikan').length;

  return (
    <div className="landing-page-wrap pb-mobile-nav">
      
      {/* HERO SECTION: Balanced, Minimalist & Focused */}
      <section className="hero-section">
        <div className="container hero-container">
          
          {/* Official Campus Pill */}
          <div className="hero-official-badge">
            <span className="hero-pulse-dot" />
            <span>Layanan Resmi Lost &amp; Found Kampus UNNES</span>
          </div>

          {/* Proportional Headline & Description */}
          <div className="hero-title-group">
            <h1 className="hero-main-title">
              Hilang di area kampus?{' '}
              <span className="hero-highlight-title">
                Laporkan &amp; temukan kembali di sini.
              </span>
            </h1>
            <p className="hero-subtitle">
              Pusat pencatatan terpadu dan aman bagi seluruh civitas Universitas Negeri Semarang untuk mengembalikan barang tertinggal.
            </p>
          </div>

          {/* Unified Compact Search Bar (Positioned directly below headline & description) */}
          <div className="hero-search-wrapper">
            <form onSubmit={handleSearchSubmit} className="hero-search-bar-compact">
              {/* Text Input Field */}
              <div className="search-input-field">
                <Search size={17} className="search-icon-left" />
                <input 
                  type="text" 
                  placeholder="Cari barang hilang atau temuan..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  aria-label="Cari nama barang"
                />
                {searchKeyword && (
                  <button 
                    type="button" 
                    onClick={() => setSearchKeyword('')} 
                    className="search-clear-btn"
                    aria-label="Hapus kata kunci"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="search-bar-divider" />

              {/* Compact Location Filter Button */}
              <div className="search-location-wrapper" ref={locationRef}>
                <button
                  type="button"
                  onClick={() => setShowLocationModal(!showLocationModal)}
                  className={`search-location-btn ${selectedLocation ? 'is-selected' : ''}`}
                  title={selectedLocation || 'Semua Lokasi / Fakultas'}
                  aria-label="Filter lokasi"
                >
                  <MapPin size={13} className="location-btn-icon" />
                  <span className="location-btn-text">
                    {selectedLocation ? selectedLocation.replace(/^Gedung\s+/, '').split(' (')[0] : 'Lokasi'}
                  </span>
                  <ChevronDown size={12} className={`location-btn-chevron ${showLocationModal ? 'open' : ''}`} />
                </button>

                {/* Desktop Dropdown Popover */}
                {showLocationModal && !isMobile && (
                  <div className="location-dropdown-desktop">
                    <div className="location-dropdown-header">
                      <span>Pilih Lokasi Kampus</span>
                      {selectedLocation && (
                        <button 
                          type="button" 
                          onClick={() => handleSelectLocation('')}
                          className="location-reset-btn"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <div className="location-dropdown-list">
                      <button
                        type="button"
                        onClick={() => handleSelectLocation('')}
                        className={`location-item-btn ${!selectedLocation ? 'active' : ''}`}
                      >
                        <span>Semua Lokasi / Fakultas</span>
                        {!selectedLocation && <span className="location-check">✓</span>}
                      </button>
                      {UNNES_BUILDINGS.map(b => (
                        <button
                          key={b.id || b.name}
                          type="button"
                          onClick={() => handleSelectLocation(b.name)}
                          className={`location-item-btn ${selectedLocation === b.name ? 'active' : ''}`}
                        >
                          <span>{b.name}</span>
                          {selectedLocation === b.name && <span className="location-check">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Search Submit Button */}
              <button type="submit" className="search-submit-btn" aria-label="Cari barang">
                <Search size={14} strokeWidth={2.5} />
                <span className="search-submit-text">Cari</span>
              </button>
            </form>

            {/* Quick Popular Keywords Row */}
            <div className="search-tags-row">
              <span className="search-tags-label">Sering dicari:</span>
              <div className="search-tags-chips">
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
            </div>
          </div>

          {/* Mobile Bottom Sheet for Location Filter via Portal */}
          {showLocationModal && isMobile && typeof document !== 'undefined' && createPortal(
            <div 
              className="location-sheet-backdrop"
              onClick={() => setShowLocationModal(false)}
            >
              <div 
                className="location-sheet-mobile"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="location-sheet-handle" />
                <div className="location-sheet-header">
                  <div>
                    <h3 className="location-sheet-title">Pilih Lokasi Kampus</h3>
                    <p className="location-sheet-sub">Saring barang berdasarkan gedung atau fakultas</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowLocationModal(false)}
                    className="location-sheet-close"
                    aria-label="Tutup"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="location-sheet-list">
                  <button
                    type="button"
                    onClick={() => handleSelectLocation('')}
                    className={`location-sheet-item ${!selectedLocation ? 'active' : ''}`}
                  >
                    <span>Semua Lokasi / Fakultas</span>
                    {!selectedLocation && <span className="location-check">✓</span>}
                  </button>
                  {UNNES_BUILDINGS.map(b => (
                    <button
                      key={b.id || b.name}
                      type="button"
                      onClick={() => handleSelectLocation(b.name)}
                      className={`location-sheet-item ${selectedLocation === b.name ? 'active' : ''}`}
                    >
                      <span>{b.name}</span>
                      {selectedLocation === b.name && <span className="location-check">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Micro-Trust Bar (Subtle, Compact & Fully Responsive) */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <EyeOff size={14} className="trust-icon" />
              <span>Sensor Privasi Publik</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <ShieldCheck size={14} className="trust-icon" />
              <span>Verifikasi Posko Fakultas</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <FileCheck2 size={14} className="trust-icon" />
              <span>Berita Acara Digital (BAST)</span>
            </div>
          </div>

          {/* Desktop Hero Activity Strip (900-1100px wide distribution, reduces dead whitespace) */}
          <div className="hero-activity-strip">
            <button
              type="button"
              onClick={() => {
                setActiveTab('temuan');
                document.querySelector('.catalog-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="activity-strip-item"
              title="Lihat barang temuan di posko kampus"
            >
              <div className="activity-strip-badge temuan">
                <PackageCheck size={14} />
                <span>{countTemuan} Barang</span>
              </div>
              <div className="activity-strip-text">
                <strong>Temuan Baru di Posko</strong>
                <span>Diamankan petugas posko fakultas</span>
              </div>
              <ArrowRight size={13} className="activity-strip-arrow" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('hilang');
                document.querySelector('.catalog-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="activity-strip-item"
              title="Lihat laporan kehilangan aktif"
            >
              <div className="activity-strip-badge hilang">
                <AlertCircle size={14} />
                <span>{countHilang} Laporan</span>
              </div>
              <div className="activity-strip-text">
                <strong>Sedang Dicari Civitas</strong>
                <span>Laporan aktif dalam pencarian</span>
              </div>
              <ArrowRight size={13} className="activity-strip-arrow" />
            </button>

            <Link
              to="/jelajahi?status=dikembalikan"
              className="activity-strip-item"
              title="Lihat riwayat barang yang berhasil diserahkan"
            >
              <div className="activity-strip-badge kembali">
                <CheckCircle2 size={14} />
                <span>{countKembali} Sukses</span>
              </div>
              <div className="activity-strip-text">
                <strong>Telah Diserahterimakan</strong>
                <span>Verifikasi BAST digital resmi</span>
              </div>
              <ArrowRight size={13} className="activity-strip-arrow" />
            </Link>
          </div>

        </div>
      </section>

      {/* SECTION: KATALOG BARANG TERBARU DILAPORKAN (Fokus Utama Homepage) */}
      <section className="container catalog-section">
        {/* Header & Tabs */}
        <div className="catalog-header-bar">
          <div className="catalog-header-text">
            <div className="catalog-section-eyebrow">
              KATALOG KAMPUS TERBARU
            </div>
            <h2 className="catalog-section-heading">
              Barang Terbaru Dilaporkan
            </h2>
            <p className="catalog-section-desc">
              Laporan aktif dari civitas akademika UNNES yang telah diverifikasi petugas.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="catalog-filter-tabs">
            <button
              onClick={() => setActiveTab('semua')}
              className={`filter-chip ${activeTab === 'semua' ? 'active' : ''}`}
            >
              Semua ({approvedItems.length})
            </button>
            <button
              onClick={() => setActiveTab('hilang')}
              className={`filter-chip ${activeTab === 'hilang' ? 'active' : ''}`}
            >
              Hilang ({countHilang})
            </button>
            <button
              onClick={() => setActiveTab('temuan')}
              className={`filter-chip ${activeTab === 'temuan' ? 'active' : ''}`}
            >
              Temuan ({countTemuan})
            </button>
          </div>
        </div>

        {/* Item Grid (Strictly 2 Columns on Mobile, 3-4 Columns on Desktop) */}
        {filteredRecentItems.length === 0 ? (
          <div className="catalog-empty-state">
            <p>Belum ada laporan barang untuk kategori ini.</p>
            <Link to="/lapor/pilih" className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
              Buat Laporan Baru
            </Link>
          </div>
        ) : (
          <div className="catalog-grid">
            {filteredRecentItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Link to Explore Page */}
        <div className="catalog-footer-actions">
          <div className="catalog-counter-text">
            Menampilkan {filteredRecentItems.length} dari {approvedItems.length} laporan aktif
          </div>
          <Link 
            to="/jelajahi" 
            className="btn btn-secondary catalog-all-btn"
          >
            <span>Lihat Semua Barang</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* SECTION: STATISTIK & APRESIASI KEJUJURAN */}
      <section className="container impact-section">
        <div className="impact-dual-container">
          
          {/* Card A: Statistik Aktivitas Kampus */}
          <div className="stats-card-box">
            <div>
              <div className="stats-eyebrow">
                <Layers size={13} color="var(--primary-indigo)" />
                TRANSPARANSI KAMPUS
              </div>
              <h3 className="stats-title">
                Aktivitas Laporan Terkini
              </h3>
              <p className="stats-desc">
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
                <div className="stat-quad-sub">Diamankan posko</div>
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
              <h3 className="bounty-title">
                Hargai Kejujuran dengan Apresiasi Terbuka
              </h3>
              <p className="bounty-desc">
                Pemilik barang dapat menyertakan imbalan sukarela sebagai tanda terima kasih kepada civitas yang mengembalikan barang berharga Anda.
              </p>

              <div className="bounty-features-list">
                <div className="bounty-feature-item">
                  <span className="bounty-check">✓</span>
                  <span>Nominal imbalan tertera transparan di halaman barang</span>
                </div>
                <div className="bounty-feature-item">
                  <span className="bounty-check">✓</span>
                  <span>Serah terima aman &amp; dicatat dengan BAST digital</span>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: '0.5rem' }}>
              <Link 
                to="/jelajahi?hadiah=true" 
                className="btn btn-dark btn-sm bounty-cta-btn"
              >
                <span>Lihat Barang dengan Hadiah</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
