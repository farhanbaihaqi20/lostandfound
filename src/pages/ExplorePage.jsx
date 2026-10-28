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
      
      {/* Search & Filter Bar (Image 2) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Search Input Box */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(44, 30, 20, 0.04)'
        }}>
          <Search 
            size={18} 
            color="var(--ink-500)" 
            style={{ position: 'absolute', left: '1.25rem' }} 
          />
          <input
            type="text"
            placeholder="Cari berdasarkan nama barang, ciri fisik, lokasi, atau kode (#LF-UNNES-xxx)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.95rem 1rem 0.95rem 3.25rem',
              fontSize: '0.925rem',
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
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-500)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              [HAPUS]
            </button>
          )}
        </div>

        {/* Primary Type Filter Tabs (Image 2: Pills) */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setTypeFilter('semua')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1.1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: '9999px',
              border: typeFilter === 'semua' ? '1px solid var(--primary-indigo)' : '1px solid var(--border-color)',
              backgroundColor: typeFilter === 'semua' ? 'var(--primary-indigo)' : '#FFFFFF',
              color: typeFilter === 'semua' ? '#FFFFFF' : 'var(--ink-700)',
              cursor: 'pointer',
              boxShadow: typeFilter === 'semua' ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            SEMUA ({countTotal})
          </button>

          <button
            onClick={() => setTypeFilter('hilang')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1.1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: '9999px',
              border: typeFilter === 'hilang' ? '1px solid var(--danger-500)' : '1px solid var(--border-color)',
              backgroundColor: typeFilter === 'hilang' ? 'var(--danger-500)' : '#FFFFFF',
              color: typeFilter === 'hilang' ? '#FFFFFF' : 'var(--ink-700)',
              cursor: 'pointer',
              boxShadow: typeFilter === 'hilang' ? '0 2px 8px rgba(225, 29, 72, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <AlertCircle size={13} color={typeFilter === 'hilang' ? '#ffffff' : 'var(--danger-500)'} />
            BARANG HILANG ({countHilang})
          </button>

          <button
            onClick={() => setTypeFilter('temuan')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1.1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: '9999px',
              border: typeFilter === 'temuan' ? '1px solid var(--primary-indigo)' : '1px solid var(--border-color)',
              backgroundColor: typeFilter === 'temuan' ? 'var(--primary-indigo)' : '#FFFFFF',
              color: typeFilter === 'temuan' ? '#FFFFFF' : 'var(--ink-700)',
              cursor: 'pointer',
              boxShadow: typeFilter === 'temuan' ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <PackageCheck size={13} color={typeFilter === 'temuan' ? '#ffffff' : 'var(--primary-indigo)'} />
            BARANG TEMUAN ({countTemuan})
          </button>

          <button
            onClick={() => setOnlyBounty(!onlyBounty)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1.1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: '9999px',
              border: onlyBounty ? '1px solid var(--amber-500)' : '1px solid var(--border-color)',
              backgroundColor: onlyBounty ? 'var(--amber-500)' : '#FFFFFF',
              color: onlyBounty ? '#FFFFFF' : 'var(--ink-700)',
              cursor: 'pointer',
              boxShadow: onlyBounty ? '0 2px 8px rgba(245, 158, 11, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
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
                fontWeight: 700,
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

        {/* Dropdowns Row (Kategori, Lokasi, Status, Urutkan) - Image 2 White Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          backgroundColor: '#FFFFFF',
          padding: '1.15rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 12px rgba(44, 30, 20, 0.04)'
        }}>
          {/* Kategori */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: '6px' }}>
              KATEGORI BARANG
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#FAF7F2',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                color: 'var(--ink-900)',
                cursor: 'pointer'
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
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: '6px' }}>
              FAKULTAS / LOKASI GEDUNG
            </label>
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#FAF7F2',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                color: 'var(--ink-900)',
                cursor: 'pointer'
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
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: '6px' }}>
              STATUS BARANG
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#FAF7F2',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                color: 'var(--ink-900)',
                cursor: 'pointer'
              }}
            >
              <option value="semua">Semua Status</option>
              <option value="aktif">Masih Berlangsung</option>
              <option value="kembali">Sudah Kembali</option>
            </select>
          </div>

          {/* Urutkan */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: '6px' }}>
              URUTKAN BERDASARKAN
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#FAF7F2',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                color: 'var(--ink-900)',
                cursor: 'pointer'
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

