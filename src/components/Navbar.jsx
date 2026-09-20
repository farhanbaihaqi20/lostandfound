import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Compass, 
  PlusCircle, 
  MessageSquare, 
  Bell, 
  Sun, 
  Moon, 
  User, 
  ShieldCheck, 
  LogOut, 
  Settings, 
  CheckCircle,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

export const Navbar = () => {
  const { user, isAdmin, theme, toggleTheme, logout, switchDemoAccount } = useAuth();
  const { notifications, markNotificationAsRead } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Filter notifications for current user or admin
  const userNotifs = notifications.filter(n => 
    isAdmin ? true : n.user_id === user?.id
  );
  const unreadCount = userNotifs.filter(n => !n.is_read).length;

  // Close dropdowns on outside click
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
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid var(--border-glass)',
      padding: '0.65rem 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        
        {/* Brand Logo & UNNES Identity */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary-800) 0%, var(--teal-600) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 10px rgba(30, 58, 95, 0.25)'
          }}>
            <Compass size={22} />
          </div>
          <div>
            <div style={{ 
              fontFamily: 'var(--font-heading)', 
              fontWeight: 800, 
              fontSize: '1.1rem', 
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              lineHeight: 1.1
            }}>
              UNNES <span style={{ color: 'var(--amber-500)' }}>Lost & Found</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Universitas Negeri Semarang
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          <Link 
            to="/beranda" 
            style={{ 
              fontWeight: 600, 
              fontSize: '0.9rem',
              color: isActive('/beranda') ? 'var(--primary-600)' : 'var(--text-secondary)'
            }}
          >
            Beranda
          </Link>
          <Link 
            to="/jelajahi" 
            style={{ 
              fontWeight: 600, 
              fontSize: '0.9rem',
              color: isActive('/jelajahi') ? 'var(--primary-600)' : 'var(--text-secondary)'
            }}
          >
            Jelajahi Barang
          </Link>
          <Link 
            to="/pesan" 
            style={{ 
              fontWeight: 600, 
              fontSize: '0.9rem',
              color: isActive('/pesan') ? 'var(--primary-600)' : 'var(--text-secondary)'
            }}
          >
            Obrolan
          </Link>
          {isAdmin && (
            <Link 
              to="/admin" 
              style={{ 
                fontWeight: 700, 
                fontSize: '0.9rem',
                color: '#6d28d9',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'rgba(109, 40, 217, 0.1)',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <ShieldCheck size={16} /> Panel Admin
            </Link>
          )}
        </nav>

        {/* Right Tools & User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          
          {/* Quick Demo Role Switcher Badge (Super handy for pair programming review) */}
          <div 
            title="Klik untuk beralih mode demo (Mahasiswa / Admin Satpam)"
            onClick={() => switchDemoAccount(isAdmin ? 'user' : 'admin')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: isAdmin ? 'var(--primary-100)' : 'var(--teal-50)',
              color: isAdmin ? 'var(--primary-900)' : 'var(--teal-800)',
              border: `1px solid ${isAdmin ? 'var(--primary-300)' : 'var(--teal-500)'}`,
              fontWeight: 600,
              transition: 'transform var(--trans-fast)'
            }}
          >
            <ShieldCheck size={14} color={isAdmin ? 'var(--primary-700)' : 'var(--teal-600)'} />
            <span>Mode: <strong>{isAdmin ? 'Admin' : 'Mahasiswa'}</strong></span>
          </div>

          {/* Desktop Report (+) Button */}
          <Link 
            to="/lapor/pilih" 
            className="btn btn-accent btn-sm"
            style={{ display: 'none' }}
            id="desktop-report-btn"
          >
            <PlusCircle size={16} /> Buat Laporan
          </Link>

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="btn-ghost"
            style={{ 
              padding: '0.45rem', 
              borderRadius: 'var(--radius-md)', 
              color: 'var(--text-secondary)' 
            }}
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {theme === 'dark' ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} />}
          </button>

          {/* Notifications Dropdown */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="btn-ghost"
              style={{ 
                padding: '0.45rem', 
                borderRadius: 'var(--radius-md)', 
                color: 'var(--text-secondary)',
                position: 'relative'
              }}
              title="Notifikasi"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  background: 'var(--danger)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-surface)'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="glass-panel" style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                borderRadius: 'var(--radius-lg)',
                padding: '0.75rem',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 60
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifikasi ({unreadCount})</span>
                  <Link to="/notifikasi" onClick={() => setShowNotifDropdown(false)} style={{ fontSize: '0.75rem', color: 'var(--primary-600)' }}>
                    Lihat Semua
                  </Link>
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {userNotifs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Belum ada notifikasi
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
                          borderRadius: 'var(--radius-sm)',
                          background: n.is_read ? 'transparent' : 'var(--bg-surface-alt)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem',
                          fontSize: '0.775rem'
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>{n.body}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div ref={userRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '2px',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--border-light)',
                cursor: 'pointer'
              }}
            >
              <img 
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                alt={user?.full_name} 
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
            </button>

            {showUserDropdown && (
              <div className="glass-panel" style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '240px',
                borderRadius: 'var(--radius-lg)',
                padding: '0.75rem',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}>
                <div style={{ padding: '0.4rem', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-found'}`} style={{ fontSize: '0.65rem' }}>
                      {isAdmin ? '🛡️ Administrator' : '🎓 Mahasiswa UNNES'}
                    </span>
                  </div>
                </div>

                <Link 
                  to="/profil" 
                  onClick={() => setShowUserDropdown(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)' }}
                >
                  <User size={16} /> Profil Saya
                </Link>

                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setShowUserDropdown(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.85rem', color: '#6d28d9', borderRadius: 'var(--radius-sm)' }}
                  >
                    <ShieldCheck size={16} /> Dashboard Admin
                  </Link>
                )}

                <Link 
                  to="/pengaturan" 
                  onClick={() => setShowUserDropdown(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)' }}
                >
                  <Settings size={16} /> Pengaturan
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
                    padding: '0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--danger)',
                    borderTop: '1px solid var(--border-light)',
                    marginTop: '0.25rem',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <LogOut size={16} /> Keluar
                </button>
              </div>
            )}
          </div>

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
