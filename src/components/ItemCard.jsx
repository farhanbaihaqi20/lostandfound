import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight, ImageOff, KeyRound } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES } from '../data/initialData';
import { WalletIllustration } from './illustrations/WalletIllustration';

export const ItemCard = ({ item }) => {
  const { user } = useAuth();
  const isLocked = !user && item.type === 'temuan';
  const isReturned = item.item_status === 'dikembalikan';

  const hasPhoto = item.photo_urls && item.photo_urls.length > 0;
  const displayImage = hasPhoto ? item.photo_urls[0] : null;

  const isWalletOrMoney = item.category === 'dompet' || 
    item.category === 'uang' || 
    (item.title && (item.title.toLowerCase().includes('duit') || item.title.toLowerCase().includes('dompet') || item.title.toLowerCase().includes('uang')));

  const formattedDate = new Date(item.date_lost_found || item.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const categoryObj = CATEGORIES.find(c => c.id === item.category);
  const categoryName = categoryObj ? categoryObj.name : (item.category || 'Lain-lain');

  // Determine card color themes based on status (Image 2)
  let cardBg = '#FAF7F2';
  let cardBorder = 'var(--border-color)';
  
  if (isReturned) {
    cardBg = '#D2E7DD';     // Soft sage green
    cardBorder = '#B2D8C3';
  } else if (item.type === 'temuan') {
    cardBg = '#E1EFFE';     // Soft sky blue
    cardBorder = '#BFDBFE';
  } else if (item.type === 'hilang') {
    cardBg = '#FEE2E2';     // Soft pink/rose
    cardBorder = '#FECDD3';
  }

  return (
    <div 
      className="archive-card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        borderRadius: '14px',
        border: `1px solid ${cardBorder}`,
        backgroundColor: cardBg,
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(44, 30, 20, 0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 10px 24px rgba(44, 30, 20, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(44, 30, 20, 0.05)';
      }}
    >
      {/* Photo / Visual Header */}
      <div style={{ position: 'relative', width: '100%', height: '190px', overflow: 'hidden', backgroundColor: '#0F172A' }}>
        
        {/* 1. Returned Banner State (Image 2 - Kunci Motor) */}
        {isReturned ? (
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#064E3B',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: '#FFFFFF',
            textAlign: 'center',
            padding: '1rem'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              <KeyRound size={22} color="#FFFFFF" />
            </div>
            <div style={{ 
              fontFamily: 'var(--font-sans)', 
              fontWeight: 800, 
              fontSize: '0.95rem', 
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              BARANG TELAH KEMBALI
            </div>
            <div style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.65rem', 
              color: '#A7F3D0',
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}>
              KASUS SELESAI &amp; TERVERIFIKASI RESMI
            </div>
          </div>
        ) : (!hasPhoto && isWalletOrMoney) ? (
          /* 2. Wallet/Money Illustration (Image 2 - Duit) */
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E0F2FE' }}>
            <WalletIllustration width={160} height={120} />
          </div>
        ) : hasPhoto ? (
          /* 3. Photo image */
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
        ) : (
          /* 4. Fallback placeholder */
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            color: 'var(--ink-400)',
            backgroundColor: '#1E293B'
          }}>
            <ImageOff size={26} color="#94A3B8" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1' }}>Tidak ada foto</span>
          </div>
        )}

        {/* Censor Overlay for Guests on Found Items */}
        {isLocked && hasPhoto && !isReturned && (
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
              Foto disensor untuk tamu
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

        {/* Item Code & Date Watermark Bar (Image 2) */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          background: 'rgba(15, 23, 42, 0.88)',
          padding: '6px 12px',
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

      {/* Card Content with Dynamic Background (Image 2) */}
      <div style={{ 
        padding: '1.15rem 1.15rem 1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1, 
        gap: '0.85rem',
        backgroundColor: cardBg 
      }}>
        {/* Title */}
        <h3 style={{ 
          fontFamily: 'var(--font-sans)',
          fontSize: '1.2rem', 
          fontWeight: 700, 
          lineHeight: 1.3,
          color: '#0F172A',
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {item.title}
        </h3>

        {/* Specs Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.2rem' }}>
          <div className="dotted-row">
            <span className="dotted-label">KATEGORI</span>
            <span className="dotted-line"></span>
            <span className="dotted-value">{categoryName}</span>
          </div>

          <div className="dotted-row">
            <span className="dotted-label">LOKASI</span>
            <span className="dotted-line"></span>
            <span className="dotted-value" title={item.location_building} style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'clip' }}>
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

        {/* Footer Action Button (Image 2: White rounded button with subtle border) */}
        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '0.85rem', 
          borderTop: '1px solid rgba(15, 23, 42, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}>
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
              color: '#0F172A',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            LIHAT RINCIAN <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};
