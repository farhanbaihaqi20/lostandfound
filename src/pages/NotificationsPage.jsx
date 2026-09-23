import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ShieldCheck, 
  Bike, 
  Sparkles, 
  CheckCheck, 
  AlertCircle,
  Search
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export const NotificationsPage = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useData();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [filter, setFilter] = useState('semua');

  const userNotifs = notifications.filter(n => isAdmin ? true : n.user_id === user?.id);
  const displayNotifs = filter === 'unread' ? userNotifs.filter(n => !n.is_read) : userNotifs;

  const getIcon = (type) => {
    switch (type) {
      case 'moderasi':
        return <ShieldCheck size={20} color="var(--primary-600)" />;
      case 'klaim':
        return <AlertCircle size={20} color="var(--amber-500)" />;
      case 'cocok':
        return <Sparkles size={20} color="var(--teal-600)" />;
      case 'laporan_temuan':
        return <Search size={20} color="var(--teal-600)" />;
      case 'pesanan':
        return <Bike size={20} color="var(--amber-600)" />;
      default:
        return <Bell size={20} color="var(--primary-600)" />;
    }
  };

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.5rem', maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Pusat Notifikasi</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Pemberitahuan status verifikasi laporan, klaim barang, dan pesanan jasa runner.
          </p>
        </div>

        <button 
          onClick={markAllNotificationsAsRead}
          className="btn btn-outline btn-sm"
          style={{ gap: '0.3rem', fontSize: '0.75rem' }}
        >
          <CheckCheck size={14} /> Tandai Semua Dibaca
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setFilter('semua')}
          className={`btn btn-sm ${filter === 'semua' ? 'btn-primary' : 'btn-outline'}`}
        >
          Semua ({userNotifs.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-outline'}`}
        >
          Belum Dibaca ({userNotifs.filter(n => !n.is_read).length})
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {displayNotifs.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <p>Tidak ada notifikasi saat ini.</p>
          </div>
        ) : (
          displayNotifs.map(n => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationAsRead(n.id);
                if (n.link) navigate(n.link);
              }}
              className="glass-card"
              style={{
                padding: '1rem',
                borderLeft: n.is_read ? '3px solid transparent' : '3px solid var(--primary-600)',
                background: n.is_read ? 'var(--bg-surface)' : 'var(--bg-surface-alt)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-light)',
                flexShrink: 0
              }}>
                {getIcon(n.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {n.title}
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(n.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                  {n.body}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
