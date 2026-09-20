import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Bike, 
  Award, 
  ArrowRight, 
  AlertCircle,
  FileText,
  Users
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

export const AdminDashboard = () => {
  const { items, claims, orders, stats } = useData();
  const { user } = useAuth();

  const pendingItems = items.filter(i => i.post_status === 'menunggu_review');
  const pendingClaims = claims.filter(c => c.status === 'menunggu_admin');
  const activeOrders = orders.filter(o => o.status !== 'selesai' && o.status !== 'dibatalkan');

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 100%)',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--amber-400)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            <ShieldCheck size={18} /> PANEL KENDALI MODERASI & POSKO UNNES
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
            Selamat Bertugas, {user?.full_name || 'Admin UNNES'}
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
            Kelola persetujuan postingan mahasiswa, verifikasi klaim blind test, dan koordinasi shift runner.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/admin/moderasi" className="btn btn-accent btn-sm" style={{ gap: '0.35rem' }}>
            <Clock size={15} /> Review Laporan ({pendingItems.length})
          </Link>
          <Link to="/admin/klaim" className="btn btn-outline btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)', gap: '0.35rem' }}>
            <ShieldCheck size={15} /> Verifikasi Klaim ({pendingClaims.length})
          </Link>
          <Link to="/admin/pengguna" className="btn btn-outline btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)', gap: '0.35rem' }}>
            <Users size={15} /> Kelola Admin
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Metric 1: Pending Posts */}
        <Link to="/admin/moderasi" className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--amber-500)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Laporan Menunggu ACC</span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} color="var(--amber-600)" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {pendingItems.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--amber-600)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
            Tinjau postingan baru <ArrowRight size={13} />
          </div>
        </Link>

        {/* Metric 2: Pending Claims */}
        <Link to="/admin/klaim" className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary-600)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Klaim Butuh Verifikasi</span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="var(--primary-700)" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {pendingClaims.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
            Cocokkan Blind Test <ArrowRight size={13} />
          </div>
        </Link>

        {/* Metric 3: Active Orders */}
        <Link to="/admin/pesanan" className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--teal-600)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Jasa Runner Berjalan</span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bike size={18} color="var(--teal-600)" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {activeOrders.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
            Kelola pesanan antar <ArrowRight size={13} />
          </div>
        </Link>

        {/* Metric 4: Total Returned */}
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--success)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Barang Sah Dikembalikan</span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} color="var(--success)" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.totalReturned}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Dengan Digital BAST resmi
          </div>
        </div>

      </div>

      {/* Two Columns: Action Queues */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Queue: Pending Post Approvals */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={18} color="var(--amber-600)" /> Antrean Postingan ({pendingItems.length})
            </h2>
            <Link to="/admin/moderasi" style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--primary-600)' }}>
              Kelola Semua
            </Link>
          </div>

          {pendingItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={32} color="var(--success)" style={{ margin: '0 auto 0.5rem' }} />
              Semua laporan user telah dimoderasi.
            </div>
          ) : (
            pendingItems.slice(0, 3).map(item => (
              <div key={item.id} style={{ padding: '0.75rem', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-700)' }}>#{item.item_code}</span>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Oleh: {item.user_name} • {item.location_building}</div>
                </div>
                <Link to="/admin/moderasi" className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
                  Review
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Right Queue: Pending Claims */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="var(--primary-600)" /> Antrean Klaim Blind Test ({pendingClaims.length})
            </h2>
            <Link to="/admin/klaim" style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--primary-600)' }}>
              Kelola Semua
            </Link>
          </div>

          {pendingClaims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={32} color="var(--success)" style={{ margin: '0 auto 0.5rem' }} />
              Tidak ada klaim yang menunggu verifikasi.
            </div>
          ) : (
            pendingClaims.slice(0, 3).map(c => (
              <div key={c.id} style={{ padding: '0.75rem', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-700)' }}>#{c.item_code}</span>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{c.item_title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pengklaim: {c.claimer_name} (Skor: {c.blind_test_score}%)</div>
                </div>
                <Link to="/admin/klaim" className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem' }}>
                  Verifikasi
                </Link>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};
