import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Bell, 
  Sun, 
  Moon, 
  User, 
  ShieldCheck, 
  LogOut, 
  Settings, 
  Bike,
  MessageSquare,
  Compass,
  Home,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

export const Navbar = () => {
  const { user, isAdmin, theme, toggleTheme, logout } = useAuth();
  const { notifications, markNotificationAsRead } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const sheetRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userNotifs = notifications.filter(n => 
    isAdmin ? true : n.user_id === user?.id
  );
  const unreadCount = userNotifs.filter(n => !n.is_read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
      // If clicking inside mobile bottom sheet or mobile backdrop, do not dismiss on mousedown
      if (
        (sheetRef.current && sheetRef.current.contains(event.target)) ||
        (event.target.closest && (
          event.target.closest('.user-menu-sheet-mobile') || 
          event.target.closest('.user-menu-backdrop-mobile')
        ))
      ) {
        return;
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleUserMenuNav = (path) => {
    setShowUserDropdown(false);
    navigate(path);
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    logout();
    navigate('/masuk');
  };

  const renderUserMenuContent = (isMobileSheet) => (
    <>
      {/* User Profile Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: isMobileSheet ? '0.2rem 0 0.75rem' : '0.2rem 0.2rem 0.6rem',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '0.4rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
          {user.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.full_name || 'User'} 
              style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--primary-indigo)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '1rem',
              fontWeight: 700,
              flexShrink: 0
            }}>
              {(user.full_name || user.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ 
              fontWeight: 700, 
              fontSize: '0.925rem', 
              color: 'var(--ink-900)', 
              textTransform: 'uppercase', 
              letterSpacing: '-0.01em', 
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user.full_name || 'DANIEL KRISTIAWAN'}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'var(--ink-500)', 
              marginTop: '1px', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              {user.email}
            </div>
            <div style={{ marginTop: '4px' }}>
              <span style={{
                display: 'inline-block',
                backgroundColor: isAdmin ? '#EEF2FF' : 'var(--bg-surface-alt)',
                border: isAdmin ? '1px solid #C7D2FE' : '1px solid var(--border-subtle)',
                color: isAdmin ? 'var(--primary-indigo)' : 'var(--ink-700)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                padding: '2px 7px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                {isAdmin ? 'PETUGAS LOST & FOUND' : 'MAHASISWA UNNES'}
              </span>
            </div>
          </div>
        </div>

        {isMobileSheet && (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowUserDropdown(false);
            }} 
            style={{ 
              color: 'var(--ink-500)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-surface-alt)',
              cursor: 'pointer',
              border: 'none',
              flexShrink: 0,
              marginLeft: '0.5rem'
            }}
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <button 
          type="button"
          onClick={() => handleUserMenuNav('/laporan-saya')}
          className="user-menu-item"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="user-menu-item-icon">
              <User size={16} />
            </div>
            <span style={{ fontWeight: 600 }}>Laporan Saya</span>
          </div>
          <ChevronRight size={16} className="user-menu-item-arrow" />
        </button>

        {isAdmin && (
          <>
            <button 
              type="button"
              onClick={() => handleUserMenuNav('/admin')}
              className="user-menu-item admin"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="user-menu-item-icon admin">
                  <ShieldCheck size={16} />
                </div>
                <span style={{ fontWeight: 600 }}>Panel Moderasi Posko</span>
              </div>
              <ChevronRight size={16} className="user-menu-item-arrow" />
            </button>
            <button 
              type="button"
              onClick={() => handleUserMenuNav('/admin/pesanan')}
              className="user-menu-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="user-menu-item-icon">
                  <Bike size={16} />
                </div>
                <span style={{ fontWeight: 600 }}>Layanan Runner</span>
              </div>
              <ChevronRight size={16} className="user-menu-item-arrow" />
            </button>
          </>
        )}

        <button 
          type="button"
          onClick={() => handleUserMenuNav('/pengaturan')}
          className="user-menu-item"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="user-menu-item-icon">
              <Settings size={16} />
            </div>
            <span style={{ fontWeight: 600 }}>Pengaturan</span>
          </div>
          <ChevronRight size={16} className="user-menu-item-arrow" />
        </button>
      </div>

      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.3rem 0' }} />

      {/* Keluar Akun Button */}
      <button 
        type="button"
        onClick={handleLogout}
        className="user-menu-logout-btn"
      >
        <LogOut size={15} /> <span>Keluar Akun</span>
      </button>
    </>
  );

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.97)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.75rem 0',
      backdropFilter: 'blur(8px)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        
        {/* Brand Logo & Archival Identity */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <img 
            src="/logo.png" 
            alt="Logo UNNES Lost & Found" 
            style={{
              width: '38px',
              height: '38px',
              objectFit: 'contain',
              borderRadius: '50%',
              flexShrink: 0
            }}
          />
          <div>
            <div style={{ 
              fontFamily: 'var(--font-serif)', 
              fontWeight: 700, 
              fontSize: '1.15rem', 
              letterSpacing: '-0.02em',
              color: 'var(--ink-900)',
              lineHeight: 1.15
            }}>
              UNNES Lost &amp; Found
            </div>
            <div className="nav-brand-sub" style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.625rem', 
              color: 'var(--ink-500)', 
              letterSpacing: '0.06em', 
              textTransform: 'uppercase' 
            }}>
              UNIVERSITAS NEGERI SEMARANG
            </div>
          </div>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '1.75rem' }} className="desktop-nav">
          <Link 
            to="/" 
            style={{ 
              fontFamily: 'var(--font-sans)',
              fontWeight: isActive('/') ? 700 : 500, 
              fontSize: '0.9rem',
              color: isActive('/') ? 'var(--primary-indigo)' : 'var(--ink-600)',
              textDecoration: 'none',
              borderBottom: isActive('/') ? '2px solid var(--primary-indigo)' : '2px solid transparent',
              paddingBottom: '2px',
              transition: 'all 0.15s ease'
            }}
          >
            Beranda
          </Link>
          <Link 
            to="/jelajahi" 
            style={{ 
              fontFamily: 'var(--font-sans)',
              fontWeight: isActive('/jelajahi') ? 700 : 500, 
              fontSize: '0.9rem',
              color: isActive('/jelajahi') ? 'var(--primary-indigo)' : 'var(--ink-600)',
              textDecoration: 'none',
              borderBottom: isActive('/jelajahi') ? '2px solid var(--primary-indigo)' : '2px solid transparent',
              paddingBottom: '2px',
              transition: 'all 0.15s ease'
            }}
          >
            Jelajahi Barang
          </Link>
          <Link 
            to="/lapor/pilih" 
            style={{ 
              fontFamily: 'var(--font-sans)',
              fontWeight: location.pathname.startsWith('/lapor') || location.pathname.toLowerCase().includes('pilih-jenis-laporan') ? 700 : 500, 
              fontSize: '0.9rem',
              color: location.pathname.startsWith('/lapor') || location.pathname.toLowerCase().includes('pilih-jenis-laporan') ? 'var(--primary-indigo)' : 'var(--ink-600)',
              textDecoration: 'none',
              borderBottom: location.pathname.startsWith('/lapor') || location.pathname.toLowerCase().includes('pilih-jenis-laporan') ? '2px solid var(--primary-indigo)' : '2px solid transparent',
              paddingBottom: '2px',
              transition: 'all 0.15s ease'
            }}
          >
            Lapor
          </Link>
          <Link 
            to="/pesan" 
            style={{ 
              fontFamily: 'var(--font-sans)',
              fontWeight: isActive('/pesan') ? 700 : 500, 
              fontSize: '0.9rem',
              color: isActive('/pesan') ? 'var(--primary-indigo)' : 'var(--ink-600)',
              textDecoration: 'none',
              borderBottom: isActive('/pesan') ? '2px solid var(--primary-indigo)' : '2px solid transparent',
              paddingBottom: '2px',
              transition: 'all 0.15s ease'
            }}
          >
            Pesan &amp; Klaim
          </Link>

          {isAdmin && (
            <Link 
              to="/admin" 
              style={{ 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--primary-indigo)',
                background: '#EEF2FF',
                border: '1px solid #C7D2FE',
                padding: '0.3rem 0.85rem',
                borderRadius: '9999px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary-indigo)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#EEF2FF';
                e.currentTarget.style.color = 'var(--primary-indigo)';
              }}
            >
              <ShieldCheck size={14} /> PANEL ADMIN
            </Link>
          )}
        </nav>

        {/* Right Tools & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Buat Laporan Primary Button (Desktop only; mobile uses FAB in BottomNav) */}
          <Link 
            to="/lapor/pilih" 
            className="nav-desktop-only"
            style={{
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'var(--primary-indigo)',
              color: '#ffffff',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '0.5rem 1.15rem',
              borderRadius: '6px',
              textDecoration: 'none',
              transition: 'background 0.15s ease'
            }}
            id="desktop-report-btn"
          >
            <Plus size={15} strokeWidth={2.5} /> Buat Laporan
          </Link>

          {/* Notifications Dropdown */}
          {user && (
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                style={{ 
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.45rem', 
                  color: 'var(--ink-700)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'all 0.15s ease'
                }}
                title="Notifikasi"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: 'var(--danger-500)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 4px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(244, 63, 94, 0.45)'
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '320px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.85rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  zIndex: 60
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--ink-900)' }}>NOTIFIKASI ({unreadCount})</span>
                    <Link to="/notifikasi" onClick={() => setShowNotifDropdown(false)} style={{ fontSize: '0.72rem', color: 'var(--ink-500)', textDecoration: 'underline' }}>
                      Lihat Semua
                    </Link>
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {userNotifs.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--ink-500)', fontSize: '0.8rem' }}>
                        Belum ada notifikasi baru
                      </div>
                    ) : (
                      userNotifs.slice(0, 5).map(n => (
                        <div 
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            setShowNotifDropdown(false);
                            if (n.link) navigate(n.link);
                          }}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            background: n.is_read ? 'transparent' : 'var(--bg-card-alt)',
                            border: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.2rem',
                            fontSize: '0.775rem'
                          }}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{n.title}</div>
                          <div style={{ color: 'var(--ink-700)', fontSize: '0.725rem' }}>{n.body}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth Button */}
          {user ? (
            <div ref={userRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '4px 8px 4px 5px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  background: 'var(--bg-card)',
                  color: 'var(--ink-900)',
                  transition: 'all 0.15s ease'
                }}
                title={user?.full_name || 'Profil Pengguna'}
              >
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.full_name || 'User'} 
                    style={{ width: '26px', height: '26px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: 'var(--primary-indigo)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {(user.full_name || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="nav-user-label" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 600 }}>
                  {user.full_name?.split(' ')[0] || 'Akun'}
                </span>
                <ChevronDown size={14} color="var(--ink-500)" style={{ marginLeft: '1px' }} />
              </button>

              {/* Desktop User Dropdown */}
              {showUserDropdown && !isMobile && (
                <div className="user-dropdown-desktop">
                  {renderUserMenuContent(false)}
                </div>
              )}

              {/* Mobile User Bottom Sheet via Portal */}
              {showUserDropdown && isMobile && typeof document !== 'undefined' && createPortal(
                <div 
                  className="user-menu-backdrop-mobile"
                  onClick={() => setShowUserDropdown(false)}
                >
                  <div 
                    ref={sheetRef}
                    className="user-menu-sheet-mobile"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="user-sheet-handle" />
                    {renderUserMenuContent(true)}
                  </div>
                </div>,
                document.body
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link 
                to="/masuk" 
                className="btn btn-secondary btn-sm"
                style={{ fontWeight: 600, fontSize: '0.825rem' }}
              >
                Masuk
              </Link>
              <Link 
                to="/daftar" 
                className="btn btn-primary btn-sm"
                style={{ fontWeight: 600, fontSize: '0.825rem' }}
              >
                Daftar
              </Link>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          #desktop-report-btn { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
};

