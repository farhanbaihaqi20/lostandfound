import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

export const AdminNavTabs = () => {
  const location = useLocation();
  const { items, claims, orders, foundReports } = useData();

  const pendingItemsCount = items.filter(i => i.post_status === 'menunggu_review').length;
  const pendingClaimsCount = claims.filter(c => c.status === 'menunggu_admin').length;
  const pendingFoundReportsCount = (foundReports || []).filter(r => r.status === 'menunggu_review').length;
  const activeOrdersCount = orders.filter(o => o.status !== 'selesai' && o.status !== 'dibatalkan').length;

  const tabs = [
    { to: '/admin', label: 'Ringkasan', count: null, dot: null },
    { to: '/admin/moderasi', label: 'Review Laporan', count: pendingItemsCount, dot: '#d97706' },
    { to: '/admin/klaim', label: 'Verifikasi Klaim', count: pendingClaimsCount, dot: '#4f46e5' },
    { to: '/admin/laporan-temuan', label: 'Laporan Temuan', count: pendingFoundReportsCount, dot: '#059669' },
    { to: '/admin/pesanan', label: 'Jasa Runner', count: activeOrdersCount, dot: '#0284c7' },
    { to: '/admin/pengguna', label: 'Kelola Admin', count: null, dot: null },
  ];

  return (
    <nav
      aria-label="Navigasi posko"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: '0.25rem',
        overflowX: 'auto',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        background: 'var(--bg-surface)',
        padding: '4px',
      }}
    >
      {tabs.map((tab, idx) => {
        const isActive =
          tab.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(tab.to);
        const num = String(idx + 1).padStart(2, '0');
        return (
          <Link
            key={tab.to}
            to={tab.to}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: '1 0 auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.6rem 0.8rem',
              borderRadius: '7px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              background: isActive ? 'var(--ink-900)' : 'transparent',
              color: isActive ? '#fff' : 'var(--ink-600)',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: isActive ? 'rgba(255,255,255,0.55)' : 'var(--ink-400)',
              }}
            >
              {num}
            </span>
            <span style={{ fontSize: '0.83rem', fontWeight: isActive ? 700 : 500 }}>
              {tab.label}
            </span>
            {tab.count > 0 && (
              <span
                style={{
                  marginLeft: '0.1rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  lineHeight: 1,
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '999px',
                  background: isActive ? '#fff' : tab.dot,
                  color: isActive ? 'var(--ink-900)' : '#fff',
                }}
              >
                {tab.count}
              </span>
            )}
            {tab.count === 0 && tab.dot && (
              <span
                title="Antrean bersih"
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#cbd5e1',
                  display: 'inline-block',
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
