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
  Home
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
            Jelajahi Arsip
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
              className="badge badge-admin"
              style={{ 
                textDecoration: 'none',
                padding: '0.3rem 0.65rem',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
            >
              <ShieldCheck size={14} /> PANEL ADMIN
            </Link>
          )}
        </nav>

        {/* Right Tools & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          
          {/* Buat Laporan Primary Button */}
          <Link 
            to="/lapor/pilih" 
            className="btn btn-primary btn-sm"
            style={{ display: 'none', gap: '0.35rem', textTransform: 'uppercase' }}
            id="desktop-report-btn"
          >
            <Plus size={15} strokeWidth={2.5} /> Buat Laporan
          </Link>

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            style={{ 
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '0.4rem', 
              color: 'var(--ink-700)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {theme === 'dark' ? <Sun size={17} color="#F59E0B" /> : <Moon size={17} />}
          </button>

          {/* Notifications Dropdown */}
          {user && (
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                style={{ 
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '0.4rem', 
                  color: 'var(--ink-700)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
                title="Notifikasi"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    background: 'var(--tag-lost-text)',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount}
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
                  gap: '0.5rem',
                  padding: '3px 8px 3px 4px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  background: 'var(--bg-card)',
                  color: 'var(--ink-900)'
                }}
                title={user?.full_name || 'Profil Pengguna'}
              >
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.full_name || 'User'} 
                    style={{ width: '26px', height: '26px', borderRadius: '4px', objectFit: 'cover' }}
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
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600 }}>
                  {user.full_name?.split(' ')[0] || 'AKUN'}
                </span>
              </button>

              {showUserDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '240px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.85rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  zIndex: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}>
                  <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink-900)' }}>
                      {user.full_name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-500)' }}>
                      {user.email}
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      <span className={`badge ${isAdmin ? 'badge-verified' : 'badge-found'}`} style={{ fontSize: '0.62rem' }}>
                        {isAdmin ? 'PETUGAS ARSIP' : 'MAHASISWA UNNES'}
                      </span>
                    </div>
                  </div>

                  <Link 
                    to="/beranda" 
                    onClick={() => setShowUserDropdown(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem', fontSize: '0.825rem', color: 'var(--ink-700)', textDecoration: 'none' }}
                  >
                    <User size={15} /> Laporan Saya
                  </Link>

                  {isAdmin && (
                    <>
                      <Link 
                        to="/admin" 
                        onClick={() => setShowUserDropdown(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem', fontSize: '0.825rem', color: '#6D28D9', textDecoration: 'none' }}
                      >
                        <ShieldCheck size={15} /> Moderasi Posko
                      </Link>
                      <Link 
                        to="/admin/pesanan" 
                        onClick={() => setShowUserDropdown(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem', fontSize: '0.825rem', color: 'var(--ink-700)', textDecoration: 'none' }}
                      >
                        <Bike size={15} /> Layanan Runner
                      </Link>
                    </>
                  )}

                  <Link 
                    to="/pengaturan" 
                    onClick={() => setShowUserDropdown(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem', fontSize: '0.825rem', color: 'var(--ink-700)', textDecoration: 'none' }}
                  >
                    <Settings size={15} /> Pengaturan
                  </Link>

                  <button 
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                      navigate('/masuk');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.45rem 0.2rem',
                      fontSize: '0.825rem',
                      color: 'var(--tag-lost-text)',
                      border: 'none',
                      borderTop: '1px solid var(--border-subtle)',
                      background: 'transparent',
                      marginTop: '0.25rem',
                      width: '100%',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={15} /> Keluar Akun
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

