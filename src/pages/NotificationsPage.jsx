import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ShieldCheck, 
  Bike, 
  Sparkles, 
  CheckCheck, 
  AlertCircle,
  Search,
  ArrowRight
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export const NotificationsPage = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useData();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [filter, setFilter] = useState('semua');

  const userNotifs = (notifications || []).filter(n => isAdmin ? true : n.user_id === user?.id);
  const displayNotifs = filter === 'unread' ? userNotifs.filter(n => !n.is_read) : userNotifs;

  const getIcon = (type) => {
    switch (type) {
      case 'moderasi':
        return <ShieldCheck size={18} color="var(--tag-found-ink)" />;
      case 'klaim':
        return <AlertCircle size={18} color="var(--tag-lost-ink)" />;
      case 'cocok':
        return <Sparkles size={18} color="var(--tag-bounty-ink)" />;
      case 'laporan_temuan':
        return <Search size={18} color="var(--tag-found-ink)" />;
      case 'pesanan':
        return <Bike size={18} color="var(--ink-900)" />;
      default:
        return <Bell size={18} color="var(--ink-700)" />;
    }
  };

  return (
    <div style={{ background: 'var(--bg-canvas)', minHeight: 'calc(100vh - 72px)', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.08em', color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              WARTA &amp; PEMBERITAHUAN
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600, color: 'var(--ink-900)', margin: '0 0 0.35rem' }}>
              Pusat Notifikasi
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-700)', margin: 0 }}>
              Status kurasi admin, kecocokan blind test, dan koordinasi serah terima barang.
            </p>
          </div>

          <button 
            onClick={markAllNotificationsAsRead}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.45rem 0.75rem' }}
          >
            <CheckCheck size={14} /> TANDAI SEMUA DIBACA
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setFilter('semua')}
            className={`filter-chip ${filter === 'semua' ? 'active' : ''}`}
            style={{ fontSize: '0.78rem' }}
          >
            SEMUA ({userNotifs.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`filter-chip ${filter === 'unread' ? 'active' : ''}`}
            style={{ fontSize: '0.78rem' }}
          >
            BELUM DIBACA ({userNotifs.filter(n => !n.is_read).length})
          </button>
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {displayNotifs.length === 0 ? (
            <div className="archive-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
              <Bell size={36} color="var(--ink-500)" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--ink-900)', fontWeight: 600 }}>
                Tidak Ada Pemberitahuan
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', marginTop: '0.35rem' }}>
                Semua notifikasi penting terkait arsip barang akan muncul di sini.
              </p>
            </div>
          ) : (
            displayNotifs.map(n => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationAsRead(n.id);
                  if (n.link) navigate(n.link);
                }}
                className="archive-card"
                style={{
                  padding: '1.15rem',
                  borderLeft: n.is_read ? '1px solid var(--border-subtle)' : '3px solid var(--ink-900)',
                  background: n.is_read ? 'var(--bg-card)' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '2px',
                  background: 'rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getIcon(n.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink-900)' }}>
                      {n.title}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-500)' }}>
                      {n.created_at ? new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Hari ini'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--ink-700)', lineHeight: 1.5 }}>
                    {n.body}
                  </div>
                </div>

                {n.link && (
                  <ArrowRight size={15} color="var(--ink-500)" style={{ alignSelf: 'center', flexShrink: 0 }} />
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default NotificationsPage;
