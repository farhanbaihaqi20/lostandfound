import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Plus, MessageSquare, User, AlertCircle, Sparkles, X, LogIn, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { matches } = useData();
  const [showReportSheet, setShowReportSheet] = useState(false);

  // Collapsed state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('unnes_bottom_nav_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Auto-hide on scroll state (persisted in localStorage)
  const [autoHide, setAutoHide] = useState(() => {
    try {
      return localStorage.getItem('unnes_bottom_nav_autohide') === 'true';
    } catch {
      return false;
    }
  });

  const updateCollapsed = (collapsed) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem('unnes_bottom_nav_collapsed', String(collapsed));
      window.dispatchEvent(new CustomEvent('unnes_bottom_nav_change', { detail: { isCollapsed: collapsed } }));
    } catch {
      // ignore
    }
  };

  // Sync state when changed elsewhere (e.g. from SettingsPage)
  useEffect(() => {
    const handleNavChange = (e) => {
      if (e.detail?.isCollapsed !== undefined) {
        setIsCollapsed(e.detail.isCollapsed);
      }
      if (e.detail?.autoHide !== undefined) {
        setAutoHide(e.detail.autoHide);
      }
    };
    window.addEventListener('unnes_bottom_nav_change', handleNavChange);
    return () => window.removeEventListener('unnes_bottom_nav_change', handleNavChange);
  }, []);

  // Optional: Auto-hide when scrolling down, show when scrolling up
  useEffect(() => {
    if (!autoHide) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > 80) {
            if (currentScrollY > lastScrollY + 20) {
              setIsCollapsed(true);
            } else if (currentScrollY < lastScrollY - 20) {
              setIsCollapsed(false);
            }
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [autoHide]);

  // Touch gesture handling (Swipe Down to hide, Swipe Up to show)
  const touchStartY = useRef(null);
  const touchStartX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e, targetAction) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaY = touchEndY - touchStartY.current;
    const deltaX = Math.abs(touchEndX - touchStartX.current);

    // Only respond if the swipe is mostly vertical
    if (Math.abs(deltaY) > deltaX) {
      if (targetAction === 'collapse' && deltaY > 30) {
        // Swiped down -> hide
        updateCollapsed(true);
      } else if (targetAction === 'expand' && deltaY < -20) {
        // Swiped up -> show
        updateCollapsed(false);
      }
    }
    touchStartY.current = null;
    touchStartX.current = null;
  };

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
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) => handleTouchEnd(e, 'collapse')}
        style={{
          position: 'fixed',
          bottom: '12px',
          left: '50%',
          transform: isCollapsed ? 'translate(-50%, calc(100% + 30px))' : 'translate(-50%, 0)',
          opacity: isCollapsed ? 0 : 1,
          pointerEvents: isCollapsed ? 'none' : 'auto',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
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
        {/* Sleek Collapse Button at Top-Right */}
        <button
          onClick={() => updateCollapsed(true)}
          title="Sembunyikan navigasi ke bawah (bisa juga geser ke bawah)"
          aria-label="Sembunyikan navigasi"
          style={{
            position: 'absolute',
            top: '-12px',
            right: '18px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-glass)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            borderRadius: 'var(--radius-full)',
            padding: '2px 10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            color: 'var(--text-secondary)',
            fontSize: '0.65rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            zIndex: 45,
            transition: 'transform var(--trans-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <ChevronDown size={13} strokeWidth={2.5} />
          <span>Sembunyi</span>
        </button>

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

      {/* Floating Trigger Pill when Navigation is Collapsed */}
      {isCollapsed && (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={(e) => handleTouchEnd(e, 'expand')}
          style={{
            position: 'fixed',
            bottom: '14px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          <button
            onClick={() => updateCollapsed(false)}
            title="Klik atau geser ke atas untuk membuka navigasi"
            aria-label="Tampilkan bilah navigasi"
            className="glass-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.45rem 1.15rem',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.2)',
              border: '1.5px solid var(--border-glass)',
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(16px)',
              cursor: 'pointer',
              color: 'var(--primary-700)',
              fontWeight: 700,
              fontSize: '0.8rem',
              transition: 'all var(--trans-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
                color: '#fff',
                boxShadow: '0 2px 6px rgba(30, 58, 95, 0.35)'
              }}
            >
              <ChevronUp size={16} strokeWidth={2.5} />
            </div>
            <span>Buka Navigasi</span>
            {activeChatsCount > 0 && (
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--teal-500)',
                  boxShadow: '0 0 8px var(--teal-500)'
                }}
                title={`${activeChatsCount} pesan aktif`}
              />
            )}
          </button>
        </div>
      )}
    </>
  );
};
