import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Share2, 
  Bike, 
  ArrowLeft, 
  Sparkles, 
  AlertCircle, 
  Award, 
  Lock,
  LogIn,
  MessageSquare, 
  Building2, 
  CheckCircle2 
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { BlindTestModal } from '../components/BlindTestModal';
import { RunnerOrderModal } from '../components/RunnerOrderModal';

export const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, matches } = useData();
  const { user } = useAuth();

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showBlindTestModal, setShowBlindTestModal] = useState(false);
  const [showRunnerModal, setShowRunnerModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const item = items.find(i => i.id === id);

  if (!item) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Barang Tidak Ditemukan</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem' }}>
          Data barang mungkin telah dihapus atau kode tidak valid.
        </p>
        <Link to="/jelajahi" className="btn btn-primary">Kembali ke Katalog</Link>
      </div>
    );
  }

  const isOwner = user?.id === item.user_id;
  const isLocked = !user && item.type === 'temuan';
  const existingMatch = matches.find(m => m.item_id === item.id);

  const photos = item.photo_urls && item.photo_urls.length > 0
    ? item.photo_urls
    : [
        item.type === 'hilang'
          ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80'
      ];

  const handleShare = () => {
    const text = `🔍 *[UNNES LOST & FOUND]*\n${item.type === 'hilang' ? 'DIPERLUKAN INFORMASI: BARANG HILANG' : 'DITEMUKAN BARANG'}\n\n📌 *${item.title}*\n📍 Lokasi: ${item.location_building} (${item.location_floor || ''} ${item.location_room || ''})\n🏷️ Kode: #${item.item_code}\n\nLihat selengkapnya di platform:\n${window.location.href}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Back Button */}
      <div>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-ghost btn-sm"
          style={{ gap: '0.35rem', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} /> Kembali
        </button>
      </div>

      {/* Main Grid: Gallery & Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Photo Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* Main Photo Container */}
          <div 
            className="glass-card"
            style={{ 
              position: 'relative', 
              aspectRatio: '4/3', 
              borderRadius: 'var(--radius-xl)', 
              overflow: 'hidden',
              backgroundColor: 'var(--bg-surface-alt)',
              border: '1px solid var(--border-light)'
            }}
          >
            <img 
              src={photos[selectedPhotoIndex]} 
              alt={item.title} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                filter: isLocked ? 'blur(16px) brightness(0.65)' : 'none',
                transform: isLocked ? 'scale(1.08)' : 'none',
                transition: 'filter 0.3s ease, transform var(--trans-slow)'
              }}
            />

            {/* Lock Overlay on Found Item for Guests */}
            {isLocked && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(3px)',
                color: '#fff',
                padding: '1.5rem',
                textAlign: 'center',
                zIndex: 4,
                gap: '0.65rem'
              }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                }}>
                  <Lock size={22} color="#f59e0b" />
                </div>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    Foto Barang Temuan Dikunci
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', maxWidth: '300px', margin: '0.35rem auto 0', lineHeight: 1.4 }}>
                    Demi mencegah klaim palsu dan verifikasi yang sah, silakan masuk dengan akun Anda untuk melihat foto asli.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/masuk', { state: { from: location } })}
                  className="btn btn-accent btn-sm"
                  style={{ fontWeight: 700, gap: '0.4rem', marginTop: '0.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                >
                  <LogIn size={15} /> Masuk untuk Buka Foto
                </button>
              </div>
            )}

            {/* Badges Overlay */}
            <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '0.4rem', zIndex: 6 }}>
              <StatusBadge type={item.type} status={item.item_status} postStatus={item.post_status} />
            </div>

            {item.bounty_amount > 0 && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 6 }}>
                <span className="badge badge-bounty">
                  <Award size={13} /> Hadiah Rp {item.bounty_amount.toLocaleString('id-ID')}
                </span>
              </div>
            )}

            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 'var(--radius-sm)',
              zIndex: 6
            }}>
              Kode Laporan: #{item.item_code}
            </div>
          </div>

          {/* Thumbnails if multiple */}
          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
              {photos.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: selectedPhotoIndex === idx ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
                    cursor: 'pointer',
                    opacity: selectedPhotoIndex === idx ? 1 : 0.6
                  }}
                >
                  <img src={url} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {/* Privacy Note from Blueprint */}
          <div style={{
            background: 'var(--bg-surface-alt)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <Lock size={16} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>SOP Sensor Gambar:</strong> Untuk mencegah klaim palsu dan melindungi identitas mahasiswa, nomor identitas (NIM/NIK/No Rekening) dan tanda tersembunyi telah disensor oleh sistem.
            </span>
          </div>

        </div>

        {/* Right Column: Item Information & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Kategori: {item.category}
            </div>
            <h1 style={{ fontSize: 'clamp(1.35rem, 3vw, 1.85rem)', fontWeight: 800, lineHeight: 1.2, color: 'var(--text-primary)' }}>
              {item.title}
            </h1>
          </div>

          {/* Status Review Callout */}
          {item.post_status === 'menunggu_review' && (
            <div style={{
              background: 'var(--warning-bg)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.825rem',
              color: 'var(--amber-700)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Clock size={18} />
              <span>Laporan ini masih <strong>Menunggu Persetujuan Admin</strong> sebelum tampil di feed publik.</span>
            </div>
          )}

          {/* Location Details Box */}
          <div className="glass-card" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
              <Building2 size={18} color="var(--teal-600)" />
              <span>Lokasi di Kampus UNNES</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem', fontSize: '0.825rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Gedung / Zona:</div>
                <div style={{ fontWeight: 600 }}>{item.location_building}</div>
              </div>
              {item.location_floor && (
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Lantai:</div>
                  <div style={{ fontWeight: 600 }}>{item.location_floor}</div>
                </div>
              )}
              {item.location_room && (
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Ruangan:</div>
                  <div style={{ fontWeight: 600 }}>{item.location_room}</div>
                </div>
              )}
            </div>

            {item.location_detail && (
              <div style={{ 
                marginTop: '0.35rem', 
                padding: '0.5rem 0.75rem', 
                background: 'var(--bg-surface-alt)', 
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Posisi Presisi: </span>
                <strong>{item.location_detail}</strong>
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Deskripsi & Ciri Fisik:</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {item.description}
            </p>
          </div>

          {/* Reporter info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            background: 'var(--bg-surface-alt)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)'
          }}>
            <div>
              Dilaporkan oleh: <strong>{item.user_name}</strong>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Waktu: {new Date(item.date_lost_found || item.created_at).toLocaleString('id-ID')}
              </div>
            </div>
            <button 
              onClick={handleShare}
              className="btn btn-outline btn-sm"
              style={{ gap: '0.35rem' }}
            >
              <Share2 size={14} /> {copied ? 'Tersalin!' : 'Bagikan'}
            </button>
          </div>

          {/* Guest Notice Banner */}
          {!user && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-50)',
              border: '1px solid var(--primary-200)',
              fontSize: '0.825rem',
              color: 'var(--primary-900)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={16} color="var(--primary-600)" style={{ flexShrink: 0 }} />
                <span>Masuk dengan akun UNNES / Google untuk melakukan klaim barang atau pesan runner.</span>
              </div>
              <button 
                onClick={() => navigate('/masuk', { state: { from: location } })}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.775rem', padding: '0.35rem 0.75rem', fontWeight: 600 }}
              >
                Masuk Sekarang
              </button>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            
            {/* If Match already exists */}
            {existingMatch ? (
              <button 
                onClick={() => {
                  if (!user) {
                    navigate('/masuk', { state: { from: { pathname: `/pesan/${existingMatch.id}` } } });
                    return;
                  }
                  navigate(`/pesan/${existingMatch.id}`);
                }}
                className="btn btn-teal btn-lg"
                style={{ gap: '0.5rem', width: '100%' }}
              >
                <MessageSquare size={18} /> Buka Ruang Obrolan & Serah Terima
              </button>
            ) : item.type === 'temuan' && !isOwner ? (
              /* If it's a found item and user is not reporter -> Can Claim via Blind Test */
              <button
                onClick={() => {
                  if (!user) {
                    navigate('/masuk', { state: { from: location } });
                    return;
                  }
                  setShowBlindTestModal(true);
                }}
                className="btn btn-primary btn-lg"
                style={{ gap: '0.5rem', width: '100%' }}
              >
                <ShieldCheck size={20} /> Ini Barang Saya! (Klaim via Blind Test)
              </button>
            ) : isOwner ? (
              <div style={{
                textAlign: 'center',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-50)',
                color: 'var(--primary-800)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                📌 Anda adalah pemilik postingan laporan ini
              </div>
            ) : null}

            {/* Order Campus Runner Button */}
            <button
              onClick={() => {
                if (!user) {
                  navigate('/masuk', { state: { from: location } });
                  return;
                }
                setShowRunnerModal(true);
              }}
              className="btn btn-accent"
              style={{ gap: '0.5rem', width: '100%' }}
            >
              <Bike size={18} /> Pesan Jasa Runner UNNES (Antar ke Kelas/Gedung Anda)
            </button>

          </div>

        </div>

      </div>

      {/* Modals */}
      <BlindTestModal
        item={item}
        isOpen={showBlindTestModal}
        onClose={() => setShowBlindTestModal(false)}
        onSuccess={() => alert('Jawaban Blind Test berhasil dikirim ke Admin Posko UNNES! Mohon tunggu verifikasi.')}
      />

      <RunnerOrderModal
        item={item}
        isOpen={showRunnerModal}
        onClose={() => setShowRunnerModal(false)}
        onSuccess={() => alert('Pesanan Jasa Runner UNNES berhasil dibuat! Runner kami akan segera bergerak.')}
      />

    </div>
  );
};
