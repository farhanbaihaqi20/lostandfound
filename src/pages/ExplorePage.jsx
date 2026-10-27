import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, AlertCircle, PackageCheck, Award, RotateCcw, Building2, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { UNNES_BUILDINGS, CATEGORIES } from '../data/initialData';
import { ItemCard } from '../components/ItemCard';

export const ExplorePage = () => {
  const { approvedItems } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('tipe') || 'semua');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('kategori') || 'semua');
  const [buildingFilter, setBuildingFilter] = useState(searchParams.get('lokasi') || searchParams.get('gedung') || 'semua');
  const [onlyBounty, setOnlyBounty] = useState(searchParams.get('hadiah') === 'true' || searchParams.get('bounty') === 'true');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'semua');
  const [sortBy, setSortBy] = useState('terbaru');

  // Filter items
  const filteredItems = approvedItems.filter(item => {
    const qLower = query.toLowerCase();
    const matchesQuery = query === '' ||
      (item.title && item.title.toLowerCase().includes(qLower)) ||
      (item.description && item.description.toLowerCase().includes(qLower)) ||
      (item.location_building && item.location_building.toLowerCase().includes(qLower)) ||
      (item.item_code && item.item_code.toLowerCase().includes(qLower));

    const matchesType = typeFilter === 'semua' || item.type === typeFilter;
    const matchesCategory = categoryFilter === 'semua' || item.category === categoryFilter;
    const matchesBuilding = buildingFilter === 'semua' || 
      (item.location_building && item.location_building.toLowerCase().includes(buildingFilter.toLowerCase()));
    const matchesBounty = !onlyBounty || (item.bounty_amount && item.bounty_amount > 0);
    const matchesStatus = statusFilter === 'semua' ||
      (statusFilter === 'aktif' && item.item_status !== 'dikembalikan') ||
      (statusFilter === 'kembali' && item.item_status === 'dikembalikan');

    return matchesQuery && matchesType && matchesCategory && matchesBuilding && matchesBounty && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'terlama') {
      return new Date(a.created_at || a.date_lost_found) - new Date(b.created_at || b.date_lost_found);
    }
    if (sortBy === 'hadiah') {
      return (b.bounty_amount || 0) - (a.bounty_amount || 0);
    }
    // default: terbaru
    return new Date(b.created_at || b.date_lost_found) - new Date(a.created_at || a.date_lost_found);
  });

  const countTotal = approvedItems.length;
  const countHilang = approvedItems.filter(i => i.type === 'hilang').length;
  const countTemuan = approvedItems.filter(i => i.type === 'temuan').length;
  const countBounty = approvedItems.filter(i => i.bounty_amount > 0).length;

  const handleReset = () => {
    setQuery('');
    setTypeFilter('semua');
    setCategoryFilter('semua');
    setBuildingFilter('semua');
    setOnlyBounty(false);
    setStatusFilter('semua');
    setSortBy('terbaru');
    setSearchParams({});
  };

  const isFiltered = query || typeFilter !== 'semua' || categoryFilter !== 'semua' || buildingFilter !== 'semua' || onlyBounty || statusFilter !== 'semua' || sortBy !== 'terbaru';

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Header (02 Jelajahi — Desktop) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ink-500)'
        }}>
          KATALOG BARANG &bull; UNIVERSITAS NEGERI SEMARANG
        </div>

        <h1 style={{ 
          fontFamily: 'var(--font-serif)', 
          fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)', 
          fontWeight: 700, 
          color: 'var(--ink-900)',
          margin: 0
        }}>
          Katalog Barang Hilang &amp; Temuan
        </h1>

        <p style={{ fontSize: '0.9rem', color: 'var(--ink-700)', maxWidth: '680px', margin: 0 }}>
          Pencarian terbuka barang hilang maupun temuan di seluruh lingkungan kampus UNNES Sekaran.
        </p>
      </div>

      {/* 2. Search & Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Search Input Box */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px'
        }}>
          <Search 
            size={18} 
            color="var(--ink-500)" 
            style={{ position: 'absolute', left: '1rem' }} 
          />
          <input
            type="text"
            placeholder="Cari berdasarkan nama barang, ciri fisik, lokasi, atau kode (#LF-UNNES-xxx)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.85rem 1rem 0.85rem 2.85rem',
              fontSize: '0.9rem',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-sans)',
              color: 'var(--ink-900)'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-500)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem'
              }}
            >
              [HAPUS]
            </button>
          )}
        </div>

        {/* Primary Type Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setTypeFilter('semua')}
            className={`filter-chip ${typeFilter === 'semua' ? 'active' : ''}`}
          >
            SEMUA ({countTotal})
          </button>

          <button
            onClick={() => setTypeFilter('hilang')}
            className={`filter-chip ${typeFilter === 'hilang' ? 'active' : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <AlertCircle size={13} color={typeFilter === 'hilang' ? '#ffffff' : 'var(--danger-500)'} />
            BARANG HILANG ({countHilang})
          </button>

          <button
            onClick={() => setTypeFilter('temuan')}
            className={`filter-chip ${typeFilter === 'temuan' ? 'active' : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <PackageCheck size={13} color={typeFilter === 'temuan' ? '#ffffff' : 'var(--primary-indigo)'} />
            BARANG TEMUAN ({countTemuan})
          </button>

          <button
            onClick={() => setOnlyBounty(!onlyBounty)}
            className={`filter-chip ${onlyBounty ? 'active' : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Award size={13} color={onlyBounty ? '#ffffff' : 'var(--amber-500)'} />
            DENGAN HADIAH ({countBounty})
          </button>

          {isFiltered && (
            <button
              onClick={handleReset}
              style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--tag-lost-text)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              <RotateCcw size={12} /> RESET FILTER
            </button>
          )}
        </div>

        {/* Dropdowns Row (Kategori, Lokasi, Urutkan) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          backgroundColor: 'var(--bg-card)',
          padding: '0.85rem',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)'
        }}>
          {/* Kategori */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: '4px' }}>
              KATEGORI BARANG
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-card-alt)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.825rem',
                color: 'var(--ink-900)'
              }}
            >
              <option value="semua">Semua Kategori</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Lokasi / Gedung */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: '4px' }}>
              FAKULTAS / LOKASI GEDUNG
            </label>
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-card-alt)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.825rem',
                color: 'var(--ink-900)'
              }}
            >
              <option value="semua">Semua Lokasi / Gedung</option>
              {UNNES_BUILDINGS.map(b => (
                <option key={b.id || b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: '4px' }}>
              STATUS BARANG
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-card-alt)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.825rem',
                color: 'var(--ink-900)'
              }}
            >
              <option value="semua">Semua Status</option>
              <option value="aktif">Masih Berlangsung</option>
              <option value="kembali">Sudah Kembali</option>
            </select>
          </div>

          {/* Urutkan */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: '4px' }}>
              URUTKAN BERDASARKAN
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-card-alt)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.825rem',
                color: 'var(--ink-900)'
              }}
            >
              <option value="terbaru">Waktu Laporan (Terbaru)</option>
              <option value="terlama">Waktu Laporan (Terlama)</option>
              <option value="hadiah">Nominal Hadiah Tertinggi</option>
            </select>
          </div>
        </div>

      </div>

      {/* 3. Result Count Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: 'var(--ink-700)',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.65rem'
      }}>
        <span>
          MENAMPILKAN <strong>{filteredItems.length}</strong> BARANG
        </span>
        <span style={{ color: 'var(--ink-500)' }}>
          {statusFilter === 'kembali' ? 'ARSIP SUDAH KEMBALI' : statusFilter === 'aktif' ? 'LAPORAN MASIH BERLANGSUNG' : 'SEMUA STATUS'}
        </span>
      </div>

      {/* 4. Grid of items */}
      {filteredItems.length === 0 ? (
        <div style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-card-alt)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Search size={22} color="var(--ink-500)" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink-900)', margin: '0 0 0.35rem' }}>
              Tidak Ada Barang yang Sesuai
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-700)', maxWidth: '440px', margin: 0 }}>
              Kombinasi kata kunci, kategori, atau lokasi tidak menemukan hasil. Coba atur ulang filter pencarian Anda.
            </p>
          </div>
          <button onClick={handleReset} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
            RESET SEMUA FILTER
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

    </div>
  );
};

