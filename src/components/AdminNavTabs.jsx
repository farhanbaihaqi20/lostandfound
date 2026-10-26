import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  ShieldCheck, 
  Search,
  Bike, 
  Users 
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

export const AdminNavTabs = () => {
  const location = useLocation();
  const { items, claims, orders, foundReports } = useData();

  const pendingItemsCount = items.filter(i => i.post_status === 'menunggu_review').length;
  const pendingClaimsCount = claims.filter(c => c.status === 'menunggu_admin').length;
  const pendingFoundReportsCount = (foundReports || []).filter(r => r.status === 'menunggu_review').length;
  const activeOrdersCount = orders.filter(o => o.status !== 'selesai' && o.status !== 'dibatalkan').length;

  const tabs = [
    {
      to: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      to: '/admin/moderasi',
      label: 'Review Laporan',
      icon: Clock,
      badge: pendingItemsCount > 0 ? pendingItemsCount : null,
      badgeColor: '#f59e0b'
    },
    {
      to: '/admin/klaim',
      label: 'Verifikasi Klaim',
      icon: ShieldCheck,
      badge: pendingClaimsCount > 0 ? pendingClaimsCount : null,
      badgeColor: '#4f46e5'
    },
    {
      to: '/admin/laporan-temuan',
      label: 'Laporan Temuan',
      icon: Search,
      badge: pendingFoundReportsCount > 0 ? pendingFoundReportsCount : null,
      badgeColor: '#059669'
    },
    {
      to: '/admin/pesanan',
      label: 'Jasa Runner',
      icon: Bike,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null,
      badgeColor: '#0284c7'
    },
    {
      to: '/admin/pengguna',
      label: 'Kelola Admin',
      icon: Users,
      badge: null
    }
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      overflowX: 'auto',
      paddingBottom: '0.25rem',
      borderBottom: '1px solid var(--border-color)',
      marginBottom: '0.5rem'
    }}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.to;

        return (
          <Link
            key={tab.to}
            to={tab.to}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'all var(--trans-fast)',
              background: isActive ? '#4f46e5' : 'var(--bg-surface)',
              color: isActive ? '#ffffff' : 'var(--ink-700)',
              border: isActive ? '1px solid #4f46e5' : '1px solid var(--border-color)',
              boxShadow: isActive ? '0 2px 8px rgba(79, 70, 229, 0.28)' : 'none'
            }}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span style={{
                background: isActive ? '#ffffff' : (tab.badgeColor || '#4f46e5'),
                color: isActive ? '#4f46e5' : '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)'
              }}>
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
};
