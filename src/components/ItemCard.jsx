import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight, ImageOff, MapPin, Tag, Award, CheckCircle2, AlertCircle, PackageCheck, Clock } from 'lucide-react';
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
    return w === 1 ? '1 mg lalu' : `${w} mg lalu`;
  }
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
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
      className="catalog-card"
      title={`${item.title} — ${categoryName}`}
    >
      {/* Photo Area (Compact 4:3 Ratio) */}
      <div className="catalog-card-media">
        {isReturned ? (
          <div className="catalog-media-returned">
            <span className="catalog-returned-icon">
              <CheckCircle2 size={18} color="#059669" />
            </span>
            <span className="catalog-returned-text">Sudah Kembali</span>
          </div>
        ) : (!hasPhoto && isWalletOrMoney) ? (
          <div className="catalog-media-illustration">
            <WalletIllustration width={90} height={70} />
          </div>
        ) : hasPhoto ? (
          <img
            src={displayImage}
            alt={item.title}
            loading="lazy"
            className={`catalog-media-img ${isLocked ? 'is-locked' : ''}`}
          />
        ) : (
          <div className="catalog-media-empty">
            <ImageOff size={20} />
            <span>Tanpa foto</span>
          </div>
        )}

        {/* Lock Overlay for Guests on Found Items */}
        {isLocked && hasPhoto && !isReturned && (
          <div className="catalog-lock-overlay">
            <Lock size={14} />
            <span>Masuk untuk melihat</span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="catalog-badge-top-left">
          {isReturned ? (
            <span className="badge-pill badge-pill-returned">
              <CheckCircle2 size={10} strokeWidth={2.5} /> Kembali
            </span>
          ) : item.type === 'hilang' ? (
            <span className="badge-pill badge-pill-lost">
              <AlertCircle size={10} strokeWidth={2.5} /> Hilang
            </span>
          ) : (
            <span className="badge-pill badge-pill-found">
              <PackageCheck size={10} strokeWidth={2.5} /> Temuan
            </span>
          )}
        </div>

        {/* Time Ago Tag (Top Right) */}
        <div className="catalog-badge-top-right" title={absoluteDate}>
          <Clock size={10} />
          <span>{timeAgo(rawDate)}</span>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="catalog-card-body">
        {/* Item Code & Category */}
        <div className="catalog-meta-row">
          <span className="catalog-item-code">#{itemCode}</span>
          <span className="catalog-item-category" title={categoryName}>
            {categoryName}
          </span>
        </div>

        {/* Item Title */}
        <h3 className="catalog-item-title">
          {item.title}
        </h3>

        {/* Location Row */}
        <div className="catalog-location-row" title={item.location_building || 'Lokasi Kampus UNNES'}>
          <MapPin size={12} className="catalog-icon-pin" />
          <span className="catalog-location-text">
            {item.location_building || 'Area Kampus UNNES'}
          </span>
        </div>

        {/* Bounty / Reward Callout (if available) */}
        {hasBounty && (
          <div className="catalog-bounty-row">
            <Award size={12} className="catalog-bounty-icon" />
            <span className="catalog-bounty-text">
              Hadiah Rp {item.bounty_amount.toLocaleString('id-ID')}
            </span>
          </div>
        )}

        {/* Subtle Footer Action */}
        <div className="catalog-card-footer">
          <span className="catalog-footer-text">Lihat detail</span>
          <ArrowRight size={13} className="catalog-footer-arrow" />
        </div>
      </div>
    </Link>
  );
};
