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
      backgroundColor: 'rgba(255, 255, 255, 0.97)',
      borderBottom: '1px solid var(--border-color)',
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
          
          {/* Buat Laporan Primary Button */}
          <Link 
            to="/lapor/pilih" 
            style={{
              display: 'inline-flex',
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
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 600 }}>
                  {user.full_name?.split(' ')[0] || 'Akun'}
                </span>
                <ChevronDown size={14} color="var(--ink-500)" style={{ marginLeft: '1px' }} />
              </button>

              {showUserDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: '300px',
                  backgroundColor: '#F6F1E8',
                  borderRadius: '18px',
                  border: '1px solid #E6DFD5',
                  padding: '1.25rem 1rem',
                  boxShadow: '0 16px 36px rgba(44, 30, 20, 0.12)',
                  zIndex: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  overflow: 'hidden'
                }}>
                  {/* Watermark footprint top-left */}
                  <svg 
                    width="45" 
                    height="55" 
                    viewBox="0 0 80 110" 
                    fill="none" 
                    style={{ position: 'absolute', top: '8px', left: '8px', opacity: 0.16, pointerEvents: 'none' }}
                  >
                    <path d="M24 38 C16 38 12 48 12 60 C12 70 17 76 22 76 C28 76 34 70 34 60 C34 48 30 38 24 38 Z" stroke="#A89F91" strokeWidth="2.5" strokeDasharray="3 3" />
                    <circle cx="23" cy="28" r="4" fill="#A89F91" />
                    <circle cx="17" cy="30" r="3" fill="#A89F91" />
                    <circle cx="30" cy="31" r="3" fill="#A89F91" />
                  </svg>

                  {/* Watermark footprint bottom-left */}
                  <svg 
                    width="45" 
                    height="55" 
                    viewBox="0 0 80 110" 
                    fill="none" 
                    style={{ position: 'absolute', bottom: '8px', left: '8px', opacity: 0.16, pointerEvents: 'none' }}
                  >
                    <path d="M24 38 C16 38 12 48 12 60 C12 70 17 76 22 76 C28 76 34 70 34 60 C34 48 30 38 24 38 Z" stroke="#A89F91" strokeWidth="2.5" strokeDasharray="3 3" />
                    <circle cx="23" cy="28" r="4" fill="#A89F91" />
                    <circle cx="17" cy="30" r="3" fill="#A89F91" />
                    <circle cx="30" cy="31" r="3" fill="#A89F91" />
                  </svg>

                  {/* Watermark magnifying glass bottom-right */}
                  <svg 
                    width="50" 
                    height="50" 
                    viewBox="0 0 100 100" 
                    fill="none" 
                    stroke="#A89F91" 
                    strokeWidth="2.5"
                    style={{ position: 'absolute', bottom: '8px', right: '8px', opacity: 0.18, pointerEvents: 'none', transform: 'rotate(-25deg)' }}
                  >
                    <circle cx="60" cy="40" r="22" />
                    <line x1="43" y1="57" x2="16" y2="84" strokeWidth="4" strokeLinecap="round" />
                  </svg>

                  {/* User Profile Header (Figma Image 4) */}
                  <div style={{ padding: '0.2rem 0.4rem 0.75rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                      {user.full_name || 'DANIEL KRISTIAWAN'}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '4px', wordBreak: 'break-all', lineHeight: 1.35 }}>
                      {user.email}
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#E0E7FF',
                        border: '1px solid #C7D2FE',
                        color: '#1E1B4B',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        textTransform: 'uppercase'
                      }}>
                        {isAdmin ? 'PETUGAS LOST & FOUND' : 'MAHASISWA UNNES'}
                      </span>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: '#E6DFD5', margin: '0.35rem 0' }} />

                  {/* Links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', position: 'relative', zIndex: 1 }}>
                    <Link 
                      to="/beranda" 
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#1E293B',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#EFE8DE'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={17} color="#475569" /> <span>Laporan Saya</span>
                    </Link>

                    {isAdmin && (
                      <>
                        <Link 
                          to="/admin" 
                          onClick={() => setShowUserDropdown(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.55rem 0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#4338CA',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            backgroundColor: '#E0E7FF',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C7D2FE'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E0E7FF'}
                        >
                          <ShieldCheck size={17} color="#4338CA" /> <span>Panel Moderasi Posko</span>
                        </Link>
                        <Link 
                          to="/admin/pesanan" 
                          onClick={() => setShowUserDropdown(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.55rem 0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#1E293B',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#EFE8DE'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Bike size={17} color="#475569" /> <span>Layanan Runner</span>
                        </Link>
                      </>
                    )}

                    <Link 
                      to="/pengaturan" 
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#1E293B',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#EFE8DE'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Settings size={17} color="#475569" /> <span>Pengaturan</span>
                    </Link>
                  </div>

                  <div style={{ height: '1px', background: '#E6DFD5', margin: '0.35rem 0' }} />

                  {/* Keluar Akun Button (Image 4) */}
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
                      padding: '0.6rem 0.85rem',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#B91C1C',
                      border: 'none',
                      backgroundColor: '#FEE2E2',
                      borderRadius: '8px',
                      width: '100%',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease',
                      position: 'relative',
                      zIndex: 1
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FECDD3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                  >
                    <LogOut size={16} color="#DC2626" /> <span>Keluar Akun</span>
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

