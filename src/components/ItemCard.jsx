import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES } from '../data/initialData';

export const ItemCard = ({ item }) => {
  const { user } = useAuth();
  const isLocked = !user && item.type === 'temuan';

  const defaultImage = item.type === 'hilang'
    ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80';

  const displayImage = item.photo_urls && item.photo_urls.length > 0
    ? item.photo_urls[0]
    : defaultImage;

  const formattedDate = new Date(item.date_lost_found || item.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const categoryObj = CATEGORIES.find(c => c.id === item.category);
  const categoryName = categoryObj ? categoryObj.name : (item.category || 'Lain-lain');

  return (
    <div className="archive-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Photo Header */}
      <div style={{ position: 'relative', width: '100%', height: '190px', overflow: 'hidden', backgroundColor: 'var(--ink-100)', borderBottom: '1px solid var(--border-subtle)' }}>
        <img 
          src={displayImage} 
          alt={item.title} 
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isLocked ? 'blur(12px) brightness(0.65)' : 'none',
            transform: isLocked ? 'scale(1.08)' : 'none',
            transition: 'transform 0.3s ease'
          }}
        />

        {/* Censor Overlay for Guests on Found Items */}
        {isLocked && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            color: '#FFFFFF',
            padding: '1rem',
            textAlign: 'center',
            zIndex: 4
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.4rem'
            }}>
              <Lock size={16} color="#FFFFFF" />
            </div>
            <span style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              [FOTO DISENSOR]
            </span>
            <span style={{ fontSize: '0.675rem', color: '#CBD5E1', marginTop: '2px' }}>
              Masuk untuk melihat foto asli
            </span>
          </div>
        )}

        {/* Badges on Top */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'none',
          zIndex: 5
        }}>
          <StatusBadge type={item.type} status={item.item_status} bounty={item.bounty_amount} />
        </div>

        {/* Item Code & Date Watermark Bar */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.3) 70%, transparent 100%)',
          padding: '6px 12px 6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#FFFFFF',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          letterSpacing: '0.04em',
          zIndex: 5
        }}>
          <span style={{ fontWeight: 600, color: '#A5B4FC' }}>
            #{item.item_code || `LF-${item.id?.substring(0, 6)?.toUpperCase()}`}
          </span>
          <span style={{ color: '#CBD5E1' }}>
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.15rem 1.15rem 1rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.85rem' }}>
        {/* Title */}
        <h3 style={{ 
          fontFamily: 'var(--font-serif)',
          fontSize: '1.15rem', 
          fontWeight: 600, 
          lineHeight: 1.35,
          color: 'var(--ink-900)',
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {item.title}
        </h3>

        {/* Archival Dotted Leader Lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.2rem' }}>
          <div className="dotted-row">
            <span className="dotted-label">KATEGORI</span>
            <span className="dotted-line"></span>
            <span className="dotted-value">{categoryName}</span>
          </div>

          <div className="dotted-row">
            <span className="dotted-label">LOKASI</span>
            <span className="dotted-line"></span>
            <span className="dotted-value" title={item.location_building}>
              {item.location_building}
            </span>
          </div>

          <div className="dotted-row">
            <span className="dotted-label">PELAPOR</span>
            <span className="dotted-line"></span>
            <span className="dotted-value">
              {item.user_name ? item.user_name.split(' ')[0] : 'Civitas UNNES'}
            </span>
          </div>
        </div>

        {/* Footer Action */}
        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '0.85rem', 
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.675rem', color: 'var(--ink-500)', textTransform: 'uppercase' }}>
            UNNES ARSIP
          </span>

          <Link 
            to={`/barang/${item.id}`} 
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'var(--ink-900)',
              textDecoration: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card-alt)',
              transition: 'all 0.15s ease'
            }}
            className="hover-card-btn"
          >
            LIHAT ARSIP <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

