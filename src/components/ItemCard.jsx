import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight, ImageOff, MapPin, Tag, Award, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES } from '../data/initialData';
import { WalletIllustration } from './illustrations/WalletIllustration';

const timeAgo = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  if (days < 7) return `${days} hari lalu`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return w === 1 ? '1 minggu lalu' : `${w} minggu lalu`;
  }
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const ItemCard = ({ item }) => {
  const { user } = useAuth();
  const isLocked = !user && item.type === 'temuan';
  const isReturned = item.item_status === 'dikembalikan';

  const hasPhoto = item.photo_urls && item.photo_urls.length > 0;
  const displayImage = hasPhoto ? item.photo_urls[0] : null;

  const isWalletOrMoney = item.category === 'dompet' ||
    item.category === 'uang' ||
    (item.title && (item.title.toLowerCase().includes('duit') || item.title.toLowerCase().includes('dompet') || item.title.toLowerCase().includes('uang')));

  const rawDate = item.date_lost_found || item.created_at;
  const absoluteDate = new Date(rawDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const categoryObj = CATEGORIES.find(c => c.id === item.category);
  const categoryName = categoryObj ? categoryObj.name : (item.category || 'Lain-lain');
  const itemCode = item.item_code || `LF-${item.id?.substring(0, 6)?.toUpperCase()}`;
  const hasBounty = (item.bounty_amount || 0) > 0;

  return (
    <Link
      to={`/barang/${item.id}`}
      className="archive-card item-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: '14px',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {/* Foto */}
      <div className="item-card-photo" style={{ position: 'relative', width: '100%', aspectRatio: '16 / 10', overflow: 'hidden', backgroundColor: 'var(--ink-100)', borderRadius: '14px 14px 0 0' }}>

        {isReturned ? (
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#ecfdf5',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '1rem',
            textAlign: 'center',
          }}>
            <span style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #a7f3d0',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircle2 size={20} color="#059669" />
            </span>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#065f46' }}>
              Sudah kembali
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#6b9e8f',
            }}>
              Kasus selesai &middot; BAST terverifikasi
            </span>
          </div>
        ) : (!hasPhoto && isWalletOrMoney) ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--ink-100)' }}>
            <WalletIllustration width={150} height={112} />
          </div>
        ) : hasPhoto ? (
          <img
            src={displayImage}
            alt={item.title}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: isLocked ? 'blur(12px) brightness(0.65)' : 'none',
              transform: isLocked ? 'scale(1.08)' : undefined,
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            color: 'var(--ink-400)',
          }}>
            <ImageOff size={24} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Tidak ada foto</span>
          </div>
        )}

        {isLocked && hasPhoto && !isReturned && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.6)',
            color: '#ffffff',
            padding: '1rem',
            textAlign: 'center',
            zIndex: 4,
          }}>
            <Lock size={16} style={{ marginBottom: '0.45rem', opacity: 0.9 }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Masuk untuk melihat foto
            </span>
            <span style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '2px' }}>
              Foto disensor untuk tamu
            </span>
          </div>
        )}

        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 5, pointerEvents: 'none' }}>
          <StatusBadge type={item.type} status={item.item_status} bounty={item.bounty_amount} />
        </div>
      </div>

      {/* Isi */}
      <div style={{ padding: '0.7rem 1rem 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.6rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.66rem',
          letterSpacing: '0.04em',
          color: 'var(--ink-400)',
        }}>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>#{itemCode}</span>
          <span title={absoluteDate} style={{ flexShrink: 0 }}>{timeAgo(rawDate)}</span>
        </div>

        <h3 style={{
          fontSize: '1rem',
          fontWeight: 800,
          letterSpacing: '-0.01em',
          lineHeight: 1.4,
          color: 'var(--ink-900)',
          margin: '0.35rem 0 0.55rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.8em',
        }}>
          {item.title}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.32rem', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }} title={item.location_building}>
            <MapPin size={14} color="var(--ink-400)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-600)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.location_building || 'Lokasi menyusul'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <Tag size={14} color="var(--ink-400)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-600)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {categoryName}
            </span>
          </div>
          {hasBounty && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <Award size={14} color="#b45309" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Hadiah Rp {item.bounty_amount.toLocaleString('id-ID')}
              </span>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: 'auto -1rem 0',
          padding: '0.6rem 1rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: 'var(--ink-500)',
        }}>
          <span>Lihat rincian</span>
          <ArrowRight size={15} className="item-card-go" />
        </div>
      </div>
    </Link>
  );
};
