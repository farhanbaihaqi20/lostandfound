import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Award, ChevronRight, ShieldCheck } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const ItemCard = ({ item }) => {
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

  return (
    <div className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%',
      position: 'relative',
      border: '1px solid var(--border-light)',
      transition: 'all var(--trans-normal)'
    }}>
      {/* Thumbnail Container */}
      <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden', backgroundColor: 'var(--bg-surface-alt)' }}>
        <img 
          src={displayImage} 
          alt={item.title} 
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--trans-slow)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />

        {/* Top Badges */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          <StatusBadge type={item.type} />
          {item.bounty_amount > 0 && (
            <span className="badge badge-bounty" style={{ pointerEvents: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              <Award size={12} /> Rp {item.bounty_amount.toLocaleString('id-ID')}
            </span>
          )}
        </div>

        {/* Item Code Watermark */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '10px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          color: '#ffffff',
          fontSize: '0.7rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          letterSpacing: '0.05em'
        }}>
          #{item.item_code}
        </div>
      </div>

      {/* Content Container */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.65rem' }}>
        <h3 style={{ 
          fontSize: '1.05rem', 
          fontWeight: 700, 
          lineHeight: 1.3,
          color: 'var(--text-primary)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {item.title}
        </h3>

        {/* Location Building */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
          <MapPin size={14} color="var(--teal-600)" style={{ flexShrink: 0 }} />
          <span style={{ 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            fontWeight: 500
          }}>
            {item.location_building}
          </span>
        </div>

        {/* Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.775rem' }}>
          <Calendar size={13} style={{ flexShrink: 0 }} />
          <span>{formattedDate}</span>
        </div>

        {/* Short Description */}
        <p style={{
          fontSize: '0.825rem',
          color: 'var(--text-secondary)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          margin: '0.2rem 0'
        }}>
          {item.description}
        </p>

        {/* Footer Actions */}
        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '0.75rem', 
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Oleh: <strong>{item.user_name?.split(' ')[0]}</strong>
          </span>

          <Link 
            to={`/barang/${item.id}`} 
            className="btn btn-outline btn-sm"
            style={{ fontWeight: 600, gap: '0.25rem' }}
          >
            Detail <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
