import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Bike, 
  ArrowRight, 
  Users,
  Search
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { AdminNavTabs } from '../../components/AdminNavTabs';
import { getRunnerStatusInfo } from '../../data/initialData';

export const AdminDashboard = () => {
  const { items, claims, orders, foundReports, stats } = useData();
  const { user } = useAuth();

  const pendingItems = items.filter(i => i.post_status === 'menunggu_review');
  const pendingClaims = claims.filter(c => c.status === 'menunggu_admin');
  const pendingFoundReports = (foundReports || []).filter(r => r.status === 'menunggu_review');
  const activeOrders = orders.filter(o => o.status !== 'selesai' && o.status !== 'dibatalkan');

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Unified Admin Sub-Navigation Tabs */}
      <AdminNavTabs />

      {/* Top Banner */}
      <div style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        background: '#0f172a',
        border: '1px solid #1e293b',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.15)'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <ShieldCheck size={17} /> PANEL KENDALI MODERASI &amp; POSKO UNNES
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
            Selamat Bertugas, {user?.full_name || 'Admin UNNES'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem', lineHeight: 1.5 }}>
            Kelola persetujuan postingan mahasiswa, verifikasi klaim blind test, dan koordinasi shift runner.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/admin/moderasi" className="btn btn-sm" style={{ background: '#f59e0b', color: '#ffffff', border: '1px solid #f59e0b', gap: '0.35rem', fontWeight: 700 }}>
            <Clock size={15} /> Review Laporan ({pendingItems.length})
          </Link>
          <Link to="/admin/klaim" className="btn btn-sm" style={{ background: '#4f46e5', color: '#ffffff', border: '1px solid #4f46e5', gap: '0.35rem', fontWeight: 700 }}>
            <ShieldCheck size={15} /> Verifikasi Klaim ({pendingClaims.length})
          </Link>
          <Link to="/admin/laporan-temuan" className="btn btn-sm" style={{ background: '#059669', color: '#ffffff', border: '1px solid #059669', gap: '0.35rem', fontWeight: 700 }}>
            <Search size={15} /> Laporan Temuan ({pendingFoundReports.length})
          </Link>
          <Link to="/admin/pesanan" className="btn btn-sm" style={{ background: '#0284c7', color: '#ffffff', border: '1px solid #0284c7', gap: '0.35rem', fontWeight: 700 }}>
            <Bike size={15} /> Jasa Runner ({activeOrders.length})
          </Link>
          <Link to="/admin/pengguna" className="btn btn-sm" style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', gap: '0.35rem', fontWeight: 600 }}>
            <Users size={15} /> Kelola Admin
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Metric 1: Pending Posts */}
        <Link to="/admin/moderasi" className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--ink-700)', fontWeight: 700 }}>Laporan Menunggu ACC</span>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ink-900)', fontFamily: 'var(--font-mono)' }}>
            {pendingItems.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}>
            Tinjau postingan baru <ArrowRight size={13} />
          </div>
        </Link>

        {/* Metric 2: Pending Claims */}
        <Link to="/admin/klaim" className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderLeft: '4px solid #4f46e5', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--ink-700)', fontWeight: 700 }}>Klaim Butuh Verifikasi</span>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="#4f46e5" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ink-900)', fontFamily: 'var(--font-mono)' }}>
            {pendingClaims.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}>
            Cocokkan Blind Test <ArrowRight size={13} />
          </div>
        </Link>

        {/* Metric 3: Active Orders */}
        <Link to="/admin/pesanan" className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderLeft: '4px solid #059669', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--ink-700)', fontWeight: 700 }}>Jasa Runner Aktif</span>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bike size={18} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ink-900)', fontFamily: 'var(--font-mono)' }}>
            {activeOrders.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}>
            Kelola &amp; Tugaskan Runner <ArrowRight size={13} />
          </div>
        </Link>

        {/* Metric 4: Total Returned */}
        <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--ink-700)', fontWeight: 700 }}>Barang Sah Dikembalikan</span>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ink-900)', fontFamily: 'var(--font-mono)' }}>
            {stats.totalReturned}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>
            Dengan Digital BAST resmi
          </div>
        </div>

      </div>

      {/* Action Queues: 3 Columns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
        
        {/* Queue 1: Pending Post Approvals */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--ink-900)' }}>
              <Clock size={17} color="#f59e0b" /> Antrean Postingan ({pendingItems.length})
            </h2>
            <Link to="/admin/moderasi" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b', textDecoration: 'none' }}>
              Kelola Semua &rarr;
            </Link>
          </div>

          {pendingItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--ink-500)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={28} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
              Semua laporan user telah dimoderasi.
            </div>
          ) : (
            pendingItems.slice(0, 3).map(item => (
              <div key={item.id} style={{ padding: '0.75rem', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>#{item.item_code}</span>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink-900)' }}>{item.title}</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--ink-500)' }}>Oleh: {item.user_name} • {item.location_building}</div>
                </div>
                <Link to="/admin/moderasi" className="btn btn-dark btn-sm" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                  Review
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Queue 2: Pending Claims */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--ink-900)' }}>
              <ShieldCheck size={17} color="#4f46e5" /> Antrean Klaim ({pendingClaims.length})
            </h2>
            <Link to="/admin/klaim" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4f46e5', textDecoration: 'none' }}>
              Kelola Semua &rarr;
            </Link>
          </div>

          {pendingClaims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--ink-500)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={28} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
              Tidak ada klaim yang menunggu verifikasi.
            </div>
          ) : (
            pendingClaims.slice(0, 3).map(c => (
              <div key={c.id} style={{ padding: '0.75rem', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4f46e5', fontFamily: 'var(--font-mono)' }}>#{c.item_code}</span>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink-900)' }}>{c.item_title}</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--ink-500)' }}>Pengklaim: {c.claimer_name} (Skor: {c.blind_test_score}%)</div>
                </div>
                <Link to="/admin/klaim" className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                  Verifikasi
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Queue 3: Active Runner Orders */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--ink-900)' }}>
              <Bike size={17} color="#059669" /> Pesanan Jasa Runner ({activeOrders.length})
            </h2>
            <Link to="/admin/pesanan" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', textDecoration: 'none' }}>
              Kelola Semua &rarr;
            </Link>
          </div>

          {activeOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--ink-500)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={28} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
              Tidak ada pesanan runner yang aktif.
            </div>
          ) : (
            activeOrders.slice(0, 3).map(o => {
              const statusInfo = getRunnerStatusInfo(o.status);
              return (
                <div key={o.id} style={{ padding: '0.75rem', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', borderLeft: `3px solid ${statusInfo.border || '#059669'}` }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', fontFamily: 'var(--font-mono)' }}>#{o.item_code}</span>
                      <span className={`badge ${statusInfo.badgeClass}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem', fontWeight: 700 }}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: '2px', color: 'var(--ink-900)' }}>{o.item_title}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--ink-500)' }}>Pemesan: {o.requester_name} • Antar ke: {o.delivery_location}</div>
                  </div>
                  <Link to="/admin/pesanan" className="btn btn-teal btn-sm" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                    Atur
                  </Link>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
