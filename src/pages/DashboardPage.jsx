import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  Bike, 
  MapPin, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Award,
  BellRing,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { UNNES_BUILDINGS, CATEGORIES, getRunnerStatusInfo } from '../data/initialData';
import { ItemCard } from '../components/ItemCard';
import { RunnerOrderModal } from '../components/RunnerOrderModal';

export const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const { approvedItems, items, orders } = useData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('semua');
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [showRunnerModal, setShowRunnerModal] = useState(false);

  // Time greeting in Indonesian
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  // User's own items
  const myReports = items.filter(i => i.user_id === user?.id);
  const myPendingReports = myReports.filter(i => i.post_status === 'menunggu_review');

  // Active Runner order for this user
  const activeOrder = orders.find(o => 
    o.requester_id === user?.id && o.status !== 'selesai' && o.status !== 'dibatalkan'
  );

  // Filtered nearby items
  const displayItems = approvedItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location_building.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBuilding = selectedBuilding === 'semua' || item.location_building.includes(selectedBuilding);
    const matchesCategory = selectedCategory === 'semua' || item.category === selectedCategory;

    return matchesSearch && matchesBuilding && matchesCategory;
  });

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* 1. Top Header Profile Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {user ? (
            user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name} 
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-600)' }}
              />
            ) : (
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--teal-600) 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 700
              }}>
                {(user.full_name || user.email || 'U')[0].toUpperCase()}
              </div>
            )
          ) : (
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-800) 0%, var(--teal-600) 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 800,
              boxShadow: '0 4px 10px rgba(30, 58, 95, 0.25)'
            }}>
              U
            </div>
          )}
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{getGreeting()},</span>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.2 }}>
              {user?.full_name || 'Civitas Akademika UNNES'}
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--teal-600)', fontWeight: 600 }}>
              {user ? (user.fakultas ? `${user.fakultas} UNNES` : 'Mahasiswa UNNES') : 'Portal Terpadu Barang Hilang & Temuan'}
            </span>
          </div>
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => {
              if (!user) {
                navigate('/masuk', { state: { from: { pathname: '/beranda' } } });
                return;
              }
              setShowRunnerModal(true);
            }} 
            className="btn btn-accent btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <Bike size={16} /> Pesan Runner
          </button>
        </div>
      </div>

      {/* 2. Notice if user has pending review reports */}
      {myPendingReports.length > 0 && (
        <div style={{
          background: 'var(--warning-bg)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          fontSize: '0.85rem',
          color: 'var(--amber-700)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} style={{ flexShrink: 0 }} />
            <span>
              Anda memiliki <strong>{myPendingReports.length} laporan</strong> yang sedang ditinjau oleh Admin Posko UNNES.
            </span>
          </div>
          <Link to="/profil" style={{ fontWeight: 700, textDecoration: 'underline', whiteSpace: 'nowrap' }}>
            Lihat Status
          </Link>
        </div>
      )}

      {/* Active Runner Tracker Widget if any */}
      {activeOrder && (() => {
        const statusInfo = getRunnerStatusInfo(activeOrder.status);
        return (
          <div className="glass-panel" style={{
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            borderLeft: `4px solid ${statusInfo.border || 'var(--teal-600)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span className={`badge ${statusInfo.badgeClass}`} style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  {statusInfo.label}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{activeOrder.item_code}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Antar ke: {activeOrder.delivery_location}
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                Runner: {activeOrder.runner_name || 'Menunggu penugasan tim'} • {activeOrder.runner_notes || statusInfo.description}
              </div>
            </div>
            <Link to="/profil" className="btn btn-outline btn-sm">
              Cek Detail
            </Link>
          </div>
        );
      })()}

      {/* 3. Search Bar with Glassmorphic Input */}
      <div style={{ position: 'relative' }}>
        <input 
          type="text"
          placeholder="Cari barang hilang, merk, lokasi gedung di UNNES..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.85rem 1rem 0.85rem 2.75rem',
            fontSize: '0.95rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
        <Search 
          size={18} 
          color="var(--text-muted)" 
          style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} 
        />
      </div>

      {/* 4. Quick Actions Grid (Matching the Dribbble Reference) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        <Link 
          to={user ? "/lapor/hilang" : "/masuk"}
          state={!user ? { from: { pathname: '/lapor/hilang' } } : undefined}
          className="glass-card"
          style={{
            padding: '0.9rem 0.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.4rem',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertCircle size={20} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Lapor Hilang</span>
        </Link>

        <Link 
          to={user ? "/lapor/temuan" : "/masuk"}
          state={!user ? { from: { pathname: '/lapor/temuan' } } : undefined}
          className="glass-card"
          style={{
            padding: '0.9rem 0.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.4rem',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={20} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Lapor Temuan</span>
        </Link>

        <div 
          onClick={() => {
            if (!user) {
              navigate('/masuk', { state: { from: { pathname: '/beranda' } } });
              return;
            }
            setShowRunnerModal(true);
          }}
          className="glass-card"
          style={{
            padding: '0.9rem 0.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.4rem',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--amber-100)',
            color: 'var(--amber-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bike size={20} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Jasa Runner</span>
        </div>

        <Link 
          to={user ? "/profil" : "/masuk"}
          state={!user ? { from: { pathname: '/profil' } } : undefined}
          className="glass-card"
          style={{
            padding: '0.9rem 0.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.4rem',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-100)',
            color: 'var(--primary-800)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={20} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Laporan Saya</span>
        </Link>
      </div>

      {/* 5. Rewards / Bounty Banner Promo Card (Matching Dribbble Reference) */}
      <div 
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f1f38 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 8px 20px rgba(30, 58, 95, 0.25)'
        }}
      >
        <div>
          <span style={{
            background: 'rgba(245, 158, 11, 0.25)',
            color: 'var(--amber-400)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.7rem',
            fontWeight: 700,
            display: 'inline-block',
            marginBottom: '0.4rem'
          }}>
            Program Hadiah UNNES
          </span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
            Dapatkan Hadiah untuk Temuan Barang
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
            Beberapa barang kehilangan menyediakan imbalan hingga Rp 100.000 untuk penemu jujur.
          </p>
        </div>

        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, var(--amber-400) 0%, var(--amber-500) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: 'var(--shadow-glow-amber)'
        }}>
          <Award size={28} color="#fff" />
        </div>
      </div>

      {/* 6. Filter Chips: Gedung UNNES & Kategori */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Barang di Sekitar Kampus</h2>
          <Link to="/jelajahi" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-600)' }}>
            Lihat Semua ({approvedItems.length})
          </Link>
        </div>

        {/* Building Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
          <button
            onClick={() => setSelectedBuilding('semua')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.775rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              background: selectedBuilding === 'semua' ? 'var(--primary-800)' : 'var(--bg-surface)',
              color: selectedBuilding === 'semua' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-light)'
            }}
          >
            Semua Gedung
          </button>
          {['FMIPA', 'FT', 'FBS', 'FEB', 'Masjid Ulul Albab', 'Perpustakaan'].map(b => (
            <button
              key={b}
              onClick={() => setSelectedBuilding(b)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.775rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: selectedBuilding === b ? 'var(--primary-800)' : 'var(--bg-surface)',
                color: selectedBuilding === b ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-light)'
              }}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* 7. Grid of items */}
      {displayItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <MapPin size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
          <p style={{ fontWeight: 600 }}>Tidak ada barang yang cocok dengan filter lokasi ini.</p>
          <button 
            onClick={() => { setSelectedBuilding('semua'); setSelectedCategory('semua'); setSearchQuery(''); }}
            className="btn btn-outline btn-sm"
            style={{ marginTop: '0.75rem' }}
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}>
          {displayItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Modal Pesan Runner */}
      <RunnerOrderModal
        isOpen={showRunnerModal}
        onClose={() => setShowRunnerModal(false)}
        onSuccess={() => alert('Pesanan Jasa Runner UNNES berhasil dibuat! Runner terdekat akan menghubungi Anda.')}
      />

    </div>
  );
};
