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

      {/* Top Operational Status Banner */}
      <div style={{
        padding: '1.75rem',
        borderRadius: '8px',
        background: '#0f172a',
        border: '1px solid #1e293b',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.12)'
      }}>
        <div style={{ maxWidth: '580px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#818cf8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <ShieldCheck size={16} /> Posko Utama Rektorat UNNES &bull; Pusat Kendali
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.25, margin: '0 0 0.35rem' }}>
            Selamat Bertugas, {user?.full_name || 'Petugas Posko'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.55 }}>
            Kelola verifikasi postingan mahasiswa, validasi klaim blind test barang temuan, dan monitor pengantaran runner di kampus.
          </p>
        </div>

        {/* Live Operational Status Widget */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '0.9rem 1.25rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
              <span>Shift Aktif &bull; Posko Siaga</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {pendingItems.length + pendingClaims.length > 0 
                ? `${pendingItems.length + pendingClaims.length} laporan/klaim butuh tindakan` 
                : 'Semua antrean saat ini bersih'}
            </span>
          </div>

          <Link 
            to="/lapor/temuan"
            className="btn btn-sm"
            style={{
              background: 'var(--primary-indigo)',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 0.95rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            + Catat Temuan Posko
          </Link>
        </div>
      </div>

      {/* 4 Professional Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
        
        {/* Metric 1: Pending Posts */}
        <Link to="/admin/moderasi" className="archive-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textDecoration: 'none', transition: 'all 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-500)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                LAPORAN MENUNGGU ACC
              </span>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--ink-900)', fontFamily: 'var(--font-mono)', lineHeight: 1.1, marginTop: '4px' }}>
                {pendingItems.length}
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={19} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#D97706', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
            <span>{pendingItems.length > 0 ? 'Tinjau postingan baru' : 'Semua postingan bersih'}</span>
            <ArrowRight size={13} />
          </div>
        </Link>

        {/* Metric 2: Pending Claims */}
        <Link to="/admin/klaim" className="archive-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textDecoration: 'none', transition: 'all 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-500)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                KLAIM BUTUH VERIFIKASI
              </span>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--ink-900)', fontFamily: 'var(--font-mono)', lineHeight: 1.1, marginTop: '4px' }}>
                {pendingClaims.length}
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={19} color="var(--primary-indigo)" />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--primary-indigo)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
            <span>Cocokkan Blind Test</span>
            <ArrowRight size={13} />
          </div>
        </Link>

        {/* Metric 3: Active Orders */}
        <Link to="/admin/pesanan" className="archive-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textDecoration: 'none', transition: 'all 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-500)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                JASA RUNNER AKTIF
              </span>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--ink-900)', fontFamily: 'var(--font-mono)', lineHeight: 1.1, marginTop: '4px' }}>
                {activeOrders.length}
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bike size={19} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
            <span>Kelola &amp; Tugaskan Runner</span>
            <ArrowRight size={13} />
          </div>
        </Link>

        {/* Metric 4: Total Returned */}
        <div className="archive-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-500)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                BARANG SAH DIKEMBALIKAN
              </span>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--ink-900)', fontFamily: 'var(--font-mono)', lineHeight: 1.1, marginTop: '4px' }}>
                {stats.totalReturned}
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={19} color="#10B981" />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
            Dengan Digital BAST resmi
          </div>
        </div>

      </div>

      {/* Action Queues: 3 Structured Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Queue 1: Pending Post Approvals */}
        <div className="archive-card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink-900)', margin: 0 }}>
              <Clock size={16} color="#D97706" /> Antrean Postingan ({pendingItems.length})
            </h2>
            <Link to="/admin/moderasi" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-indigo)', textDecoration: 'none' }}>
              Kelola Semua &rarr;
            </Link>
          </div>

          {pendingItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--ink-500)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
              <div>Semua postingan telah selesai dimoderasi.</div>
            </div>
          ) : (
            pendingItems.slice(0, 3).map(item => (
              <div key={item.id} style={{ padding: '0.85rem', background: 'var(--bg-surface-alt)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D97706', fontFamily: 'var(--font-mono)' }}>#{item.item_code}</span>
                    <span className="badge badge-review" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>REVIEW</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '2px' }}>Oleh: {item.user_name} &bull; {item.location_building}</div>
                </div>
                <Link to="/admin/moderasi" className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', whiteSpace: 'nowrap' }}>
                  Tinjau &rarr;
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Queue 2: Pending Claims */}
        <div className="archive-card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink-900)', margin: 0 }}>
              <ShieldCheck size={16} color="var(--primary-indigo)" /> Antrean Klaim ({pendingClaims.length})
            </h2>
            <Link to="/admin/klaim" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-indigo)', textDecoration: 'none' }}>
              Kelola Semua &rarr;
            </Link>
          </div>

          {pendingClaims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--ink-500)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
              <div>Tidak ada klaim yang menunggu verifikasi.</div>
            </div>
          ) : (
            pendingClaims.slice(0, 3).map(c => (
              <div key={c.id} style={{ padding: '0.85rem', background: 'var(--bg-surface-alt)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-indigo)', fontFamily: 'var(--font-mono)' }}>#{c.item_code}</span>
                    <span className="badge badge-bounty" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>SKOR {c.blind_test_score}%</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.item_title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '2px' }}>Pengklaim: {c.claimer_name}</div>
                </div>
                <Link to="/admin/klaim" className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', whiteSpace: 'nowrap' }}>
                  Cocokkan &rarr;
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Queue 3: Active Runner Orders */}
        <div className="archive-card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink-900)', margin: 0 }}>
              <Bike size={16} color="#059669" /> Pesanan Jasa Runner ({activeOrders.length})
            </h2>
            <Link to="/admin/pesanan" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', textDecoration: 'none' }}>
              Kelola Semua &rarr;
            </Link>
          </div>

          {activeOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--ink-500)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
              <div>Tidak ada pesanan runner yang aktif saat ini.</div>
            </div>
          ) : (
            activeOrders.slice(0, 3).map(o => {
              const statusInfo = getRunnerStatusInfo(o.status);
              return (
                <div key={o.id} style={{ padding: '0.85rem', background: 'var(--bg-surface-alt)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', fontFamily: 'var(--font-mono)' }}>#{o.item_code}</span>
                      <span className={`badge ${statusInfo.badgeClass}`} style={{ fontSize: '0.62rem', padding: '1px 5px', fontWeight: 700 }}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.item_title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '2px' }}>Antar ke: {o.delivery_location}</div>
                  </div>
                  <Link to="/admin/pesanan" className="btn btn-teal btn-sm" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', whiteSpace: 'nowrap' }}>
                    Tugaskan &rarr;
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
