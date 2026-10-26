import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown
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
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const userNotifs = notifications.filter(n => 
    isAdmin ? true : n.user_id === user?.id
  );
  const unreadCount = userNotifs.filter(n => !n.is_read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'var(--bg-canvas)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.75rem 0',
      backdropFilter: 'blur(8px)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
        
        {/* Brand Logo & Archival Identity */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'var(--primary-indigo)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: '0.95rem',
            borderRadius: '6px',
            flexShrink: 0
          }}>
            LF
          </div>
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
            <div style={{ 
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
              color: isActive('/') ? 'var(--primary-indigo)' : 'var(--ink-500)',
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
              color: isActive('/jelajahi') ? 'var(--primary-indigo)' : 'var(--ink-500)',
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
              fontWeight: location.pathname.startsWith('/lapor') ? 700 : 500, 
              fontSize: '0.9rem',
              color: location.pathname.startsWith('/lapor') ? 'var(--primary-indigo)' : 'var(--ink-500)',
              textDecoration: 'none',
              borderBottom: location.pathname.startsWith('/lapor') ? '2px solid var(--primary-indigo)' : '2px solid transparent',
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
              color: isActive('/pesan') ? 'var(--primary-indigo)' : 'var(--ink-500)',
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
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--primary-indigo)',
                background: 'var(--primary-50)',
                border: '1px solid var(--primary-200)',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary-indigo)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primary-50)';
                e.currentTarget.style.color = 'var(--primary-indigo)';
              }}
            >
              <ShieldCheck size={14} /> PANEL ADMIN
            </Link>
          )}
        </nav>

        {/* Right Tools & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Buat Laporan Primary Button */}
          <Link 
            to="/lapor/pilih" 
            className="btn btn-primary btn-sm"
            style={{ display: 'none', gap: '0.35rem', textTransform: 'uppercase' }}
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
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 600 }}>
                  {user.full_name?.split(' ')[0] || 'Akun'}
                </span>
                <ChevronDown size={14} color="var(--ink-500)" style={{ marginLeft: '1px' }} />
              </button>

              {showUserDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '260px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.75rem',
                  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                  zIndex: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  {/* User Profile Header */}
                  <div style={{ padding: '0.25rem 0.4rem 0.65rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink-900)' }}>
                      {user.full_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '2px', wordBreak: 'break-all' }}>
                      {user.email}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-found'}`} style={{ fontSize: '0.65rem', padding: '2px 7px' }}>
                        {isAdmin ? 'PETUGAS LOST & FOUND' : 'MAHASISWA UNNES'}
                      </span>
                    </div>
                  </div>

                  {/* Links */}
                  <Link 
                    to="/beranda" 
                    onClick={() => setShowUserDropdown(false)}
                    className="dropdown-item-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.5rem 0.65rem',
                      fontSize: '0.825rem',
                      fontWeight: 500,
                      color: 'var(--ink-800)',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <User size={15} color="var(--ink-500)" /> Laporan Saya
                  </Link>

                  {isAdmin && (
                    <>
                      <Link 
                        to="/admin" 
                        onClick={() => setShowUserDropdown(false)}
                        className="dropdown-item-link"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.5rem 0.65rem',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          color: 'var(--primary-indigo)',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          background: 'var(--primary-50)',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <ShieldCheck size={15} color="var(--primary-indigo)" /> Panel Moderasi Posko
                      </Link>
                      <Link 
                        to="/admin/pesanan" 
                        onClick={() => setShowUserDropdown(false)}
                        className="dropdown-item-link"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.5rem 0.65rem',
                          fontSize: '0.825rem',
                          fontWeight: 500,
                          color: 'var(--ink-800)',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <Bike size={15} color="var(--ink-500)" /> Layanan Runner
                      </Link>
                    </>
                  )}

                  <Link 
                    to="/pengaturan" 
                    onClick={() => setShowUserDropdown(false)}
                    className="dropdown-item-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.5rem 0.65rem',
                      fontSize: '0.825rem',
                      fontWeight: 500,
                      color: 'var(--ink-800)',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <Settings size={15} color="var(--ink-500)" /> Pengaturan
                  </Link>

                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.25rem 0' }} />

                  <button 
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                      navigate('/masuk');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.5rem 0.65rem',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: 'var(--danger-600)',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: '6px',
                      width: '100%',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--danger-50)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={15} color="var(--danger-500)" /> Keluar Akun
                  </button>
                </div>
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

