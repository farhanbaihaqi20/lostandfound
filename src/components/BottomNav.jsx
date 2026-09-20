import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Plus, MessageSquare, User, AlertCircle, Sparkles, X, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { matches } = useData();
  const [showReportSheet, setShowReportSheet] = useState(false);

  // Active matches count for chat
  const activeChatsCount = matches.length;

  const isActive = (path) => location.pathname === path;

  const handleSelectReport = (type) => {
    setShowReportSheet(false);
    if (!user) {
      navigate('/masuk', { state: { from: { pathname: `/lapor/${type}` } } });
      return;
    }
    navigate(`/lapor/${type}`);
  };

  return (
    <>
      {/* Action Sheet Dialog when clicking (+) FAB */}
      {showReportSheet && (
        <div className="modal-backdrop" onClick={() => setShowReportSheet(false)} style={{ alignItems: 'flex-end', padding: 0 }}>
          <div 
            className="glass-panel" 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '500px',
              margin: '0 auto',
              borderTopLeftRadius: 'var(--radius-xl)',
              borderTopRightRadius: 'var(--radius-xl)',
              padding: '1.5rem 1.25rem 2.5rem',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Buat Laporan Baru</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pilih jenis laporan yang ingin Anda ajukan ke civitas UNNES</p>
              </div>
              <button onClick={() => setShowReportSheet(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div 
                onClick={() => handleSelectReport('hilang')}
                style={{
                  padding: '1.25rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--danger-bg)',
                  border: '1.5px solid rgba(239, 68, 68, 0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.5rem',
                  transition: 'transform var(--trans-fast)'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--danger)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)'
                }}>
                  <AlertCircle size={24} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--danger)' }}>
                  Barang Hilang
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                  Saya kehilangan barang di kampus UNNES
                </div>
              </div>

              <div 
                onClick={() => handleSelectReport('temuan')}
                style={{
                  padding: '1.25rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--success-bg)',
                  border: '1.5px solid rgba(16, 185, 129, 0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.5rem',
                  transition: 'transform var(--trans-fast)'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--success)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                }}>
                  <Sparkles size={24} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--success)' }}>
                  Barang Temuan
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                  Saya menemukan barang milik orang lain
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar for Mobile */}
      <nav 
        className="glass-panel"
        style={{
          position: 'fixed',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 24px)',
          maxWidth: '460px',
          borderRadius: 'var(--radius-full)',
          padding: '0.4rem 0.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40,
          boxShadow: '0 8px 32px rgba(15, 23, 42, 0.18)',
          border: '1px solid var(--border-glass)'
        }}
      >
        <Link 
          to="/beranda"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: isActive('/beranda') ? 'var(--primary-600)' : 'var(--text-muted)',
            flex: 1,
            padding: '4px 0'
          }}
        >
          <Home size={20} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Beranda</span>
        </Link>

        <Link 
          to="/jelajahi"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: isActive('/jelajahi') ? 'var(--primary-600)' : 'var(--text-muted)',
            flex: 1,
            padding: '4px 0'
          }}
        >
          <Compass size={20} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Jelajahi</span>
        </Link>

        {/* Center Golden FAB (+) Button */}
        <button
          onClick={() => setShowReportSheet(true)}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--amber-400) 0%, var(--amber-500) 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow-amber)',
            transform: 'translateY(-6px)',
            transition: 'transform var(--trans-fast)'
          }}
          title="Buat Laporan Baru"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>

        <Link 
          to="/pesan"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: isActive('/pesan') ? 'var(--primary-600)' : 'var(--text-muted)',
            flex: 1,
            padding: '4px 0',
            position: 'relative'
          }}
        >
          <MessageSquare size={20} />
          {activeChatsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '25%',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--teal-500)'
            }} />
          )}
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Pesan</span>
        </Link>

        <Link 
          to={user ? "/profil" : "/masuk"}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: (isActive('/profil') || (!user && isActive('/masuk'))) ? 'var(--primary-600)' : 'var(--text-muted)',
            flex: 1,
            padding: '4px 0'
          }}
        >
          {user ? <User size={20} /> : <LogIn size={20} />}
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{user ? 'Profil' : 'Masuk'}</span>
        </Link>
      </nav>
    </>
  );
};
