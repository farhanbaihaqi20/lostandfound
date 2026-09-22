import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, AlertCircle, Sparkles, Award, RotateCcw } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { UNNES_BUILDINGS, CATEGORIES } from '../data/initialData';
import { ItemCard } from '../components/ItemCard';

export const ExplorePage = () => {
  const { approvedItems } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('tipe') || 'semua');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('kategori') || 'semua');
  const [buildingFilter, setBuildingFilter] = useState(searchParams.get('gedung') || 'semua');
  const [onlyBounty, setOnlyBounty] = useState(searchParams.get('bounty') === 'true');

  // Filter items
  const filteredItems = approvedItems.filter(item => {
    const matchesQuery = query === '' ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.location_building.toLowerCase().includes(query.toLowerCase()) ||
      item.item_code.toLowerCase().includes(query.toLowerCase());

    const matchesType = typeFilter === 'semua' || item.type === typeFilter;
    const matchesCategory = categoryFilter === 'semua' || item.category === categoryFilter;
    const matchesBuilding = buildingFilter === 'semua' || item.location_building.toLowerCase().includes(buildingFilter.toLowerCase());
    const matchesBounty = !onlyBounty || (item.bounty_amount && item.bounty_amount > 0);

    return matchesQuery && matchesType && matchesCategory && matchesBuilding && matchesBounty;
  });

  const handleReset = () => {
    setQuery('');
    setTypeFilter('semua');
    setCategoryFilter('semua');
    setBuildingFilter('semua');
    setOnlyBounty(false);
    setSearchParams({});
  };

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Jelajahi Katalog Barang UNNES</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Cari dan temukan barang yang hilang maupun ditemukan di seluruh lingkungan kampus.
        </p>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Cari berdasarkan nama barang, ciri fisik, atau kode (#LF-UNNES-xxx)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.85rem 1rem 0.85rem 2.75rem',
            fontSize: '0.95rem',
            borderRadius: 'var(--radius-lg)'
          }}
        />
        <Search 
          size={18} 
          color="var(--text-muted)" 
          style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} 
        />
      </div>

      {/* Filter Tabs (Semua / Hilang / Temuan / Hadiah) */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setTypeFilter('semua')}
          className={`btn btn-sm ${typeFilter === 'semua' ? 'btn-primary' : 'btn-outline'}`}
        >
          Semua ({approvedItems.length})
        </button>

        <button
          onClick={() => setTypeFilter('hilang')}
          className={`btn btn-sm ${typeFilter === 'hilang' ? 'btn-primary' : 'btn-outline'}`}
          style={{ gap: '0.35rem' }}
        >
          <AlertCircle size={14} color={typeFilter === 'hilang' ? '#fff' : 'var(--danger)'} />
          Barang Hilang
        </button>

        <button
          onClick={() => setTypeFilter('temuan')}
          className={`btn btn-sm ${typeFilter === 'temuan' ? 'btn-primary' : 'btn-outline'}`}
          style={{ gap: '0.35rem' }}
        >
          <Sparkles size={14} color={typeFilter === 'temuan' ? '#fff' : 'var(--success)'} />
          Barang Temuan
        </button>

        <button
          onClick={() => setOnlyBounty(!onlyBounty)}
          className={`btn btn-sm ${onlyBounty ? 'btn-accent' : 'btn-outline'}`}
          style={{ gap: '0.35rem' }}
        >
          <Award size={14} color={onlyBounty ? '#fff' : 'var(--amber-600)'} />
          Ada Hadiah / Bounty
        </button>

        {(query || typeFilter !== 'semua' || categoryFilter !== 'semua' || buildingFilter !== 'semua' || onlyBounty) && (
          <button
            onClick={handleReset}
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 'auto', gap: '0.3rem', fontSize: '0.775rem' }}
          >
            <RotateCcw size={13} /> Reset Filter
          </button>
        )}
      </div>

      {/* Visual Category Quick Filter Chips */}
      <div style={{
        display: 'flex',
        gap: '0.65rem',
        overflowX: 'auto',
        paddingBottom: '0.35rem',
        paddingTop: '0.2rem'
      }}>
        <button
          type="button"
          onClick={() => setCategoryFilter('semua')}
          className="glass-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            border: categoryFilter === 'semua' ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
            background: categoryFilter === 'semua' ? 'var(--primary-50)' : 'var(--bg-glass-card)',
            color: categoryFilter === 'semua' ? 'var(--primary-800)' : 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'all 0.2s ease'
          }}
        >
          <Sparkles size={14} color={categoryFilter === 'semua' ? 'var(--primary-600)' : 'var(--text-muted)'} />
          Semua Kategori
        </button>

        {CATEGORIES.map(cat => {
          const isSelected = categoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(isSelected ? 'semua' : cat.id)}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.3rem 0.85rem 0.3rem 0.4rem',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
                background: isSelected ? 'var(--primary-50)' : 'var(--bg-glass-card)',
                color: isSelected ? 'var(--primary-800)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
            >
              <img 
                src={cat.image} 
                alt={cat.name} 
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid rgba(0,0,0,0.06)'
                }}
              />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Dropdown Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        
        {/* Kategori Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="semua">Semua Kategori</option>
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Gedung UNNES Dropdown */}
        <select
          value={buildingFilter}
          onChange={(e) => setBuildingFilter(e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="semua">Semua Lokasi / Gedung UNNES</option>
          {UNNES_BUILDINGS.map(b => (
            <option key={b.id} value={b.name}>{b.name}</option>
          ))}
        </select>

      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <span>Menampilkan <strong>{filteredItems.length}</strong> barang</span>
      </div>

      {/* Grid of items */}
      {filteredItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <Search size={44} color="var(--text-muted)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Tidak ada barang ditemukan</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>
            Coba gunakan kata kunci pencarian yang lebih umum atau atur ulang filter lokasi dan kategori Anda.
          </p>
          <button onClick={handleReset} className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

    </div>
  );
};
