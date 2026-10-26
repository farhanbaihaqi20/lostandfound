import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Clock, 
  ShieldCheck, 
  Share2, 
  Bike, 
  ArrowLeft, 
  Sparkles, 
  AlertCircle, 
  AlertTriangle,
  Award, 
  Lock,
  LogIn,
  MessageSquare, 
  Building2, 
  CheckCircle2,
  CheckCheck,
  Trash2
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { BlindTestModal } from '../components/BlindTestModal';
import { RunnerOrderModal } from '../components/RunnerOrderModal';
import { ClaimObjectionModal } from '../components/ClaimObjectionModal';
import { FoundReportModal } from '../components/FoundReportModal';

export const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, matches, claims, foundReports, deleteItem, markItemAsReturned, revokeClaimVerification } = useData();
  const { user, isAdmin } = useAuth();

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showBlindTestModal, setShowBlindTestModal] = useState(false);
  const [showRunnerModal, setShowRunnerModal] = useState(false);
  const [showObjectionModal, setShowObjectionModal] = useState(false);
  const [showFoundReportModal, setShowFoundReportModal] = useState(false);
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

  const isOwner = Boolean(user && user.id === item.user_id);
  const isLocked = !user && item.type === 'temuan';

  // Cari match yang melibatkan user aktif untuk barang ini
  const userMatch = matches?.find(m => String(m.item_id) === String(item.id) && (m.finder_id === user?.id || m.owner_id === user?.id));
  const existingMatch = userMatch || matches?.find(m => String(m.item_id) === String(item.id));

  // Cari klaim blind test dari user aktif untuk barang ini
  const userClaim = claims?.find(c => 
    String(c.item_id) === String(item.id) && (
      (user?.id && c.claimer_id === user.id) ||
      (user?.email && c.claimer_email?.toLowerCase() === user.email.toLowerCase())
    )
  );

  // Cari laporan penemuan (found_report) dari user aktif untuk barang hilang ini
  const userFoundReport = foundReports?.find(r => 
    String(r.item_id) === String(item.id) && (
      (user?.id && r.reporter_id === user.id) ||
      (user?.email && r.reporter_email?.toLowerCase() === user.email?.toLowerCase())
    )
  );

  // Status verifikasi kepemilikan via blind test
  const isVerifiedOwner = Boolean(userMatch && userMatch.owner_id === user?.id) || userClaim?.status === 'disetujui';
  const isClaimPending = userClaim?.status === 'menunggu_admin';
  const isClaimRejected = userClaim?.status === 'ditolak';
  const isClaimRevoked = userClaim?.status === 'dibatalkan';
  const approvedClaim = claims?.find(c => String(c.item_id) === String(item.id) && c.status === 'disetujui');
  
  // Status barang sudah terverifikasi pemiliknya (sedang dalam proses serah terima)
  const isItemVerified = item.item_status === 'diproses' || Boolean(approvedClaim);

  // Daftar klaim menunggu untuk admin posko
  const pendingClaimsForItem = claims?.filter(c => String(c.item_id) === String(item.id) && c.status === 'menunggu_admin') || [];

  const handleAdminRevoke = async () => {
    const claimTarget = approvedClaim;
    const claimerLabel = claimTarget?.claimer_name ? `"${claimTarget.claimer_name}"` : 'pemohon terverifikasi saat ini';
    const reason = window.prompt(
      `⚠️ PEMBATALAN STATUS VERIFIKASI KLAIM (KLAIM PALSU / SALAH VERIFIKASI):\n\n` +
      `Apakah Anda yakin ingin membatalkan status verifikasi ${claimerLabel} untuk barang #${item.item_code}?\n\n` +
      `Efek Pembatalan:\n` +
      `• Pengguna tersebut AKAN DIBLOKIR dari mengajukan klaim kembali untuk barang ini.\n` +
      `• Status barang akan dibuka kembali menjadi "Terbuka".\n` +
      `• Publik / mahasiswa lain dapat mengajukan klaim Blind Test kembali.\n\n` +
      `Tuliskan alasan pembatalan verifikasi:`,
      'Terindikasi klaim palsu / terdapat sanggahan sah dari pemilik asli'
    );
    if (!reason) return;

    try {
      await revokeClaimVerification(claimTarget?.id || { itemId: item.id }, reason.trim());
      alert('Verifikasi klaim berhasil dibatalkan. Status barang kembali dibuka untuk publik, dan pemohon palsu telah diblokir.');
    } catch (err) {
      console.error(err);
      alert('Gagal membatalkan verifikasi klaim.');
    }
  };

  const handleLockedRunnerClick = () => {
    if (!user) {
      navigate('/masuk', { state: { from: location } });
      return;
    }
    alert(
      '🔒 Verifikasi Kepemilikan Diperlukan:\n\n' +
      'Untuk barang temuan, Anda harus melakukan klaim dan mengisi verifikasi Blind Test terlebih dahulu untuk membuktikan bahwa barang ini benar milik Anda.\n\n' +
      'Setelah klaim disetujui Admin, opsi Pesan Jasa Runner UNNES akan terbuka secara otomatis.'
    );
    setShowBlindTestModal(true);
  };

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

  const handleMarkReturned = async () => {
    const confirm = window.confirm(
      `Tandai laporan #${item.item_code} ("${item.title}") sebagai SUDAH KEMBALI KE PEMILIK?\n\n` +
      `⚡ Efisiensi Penyimpanan & Privasi:\n` +
      `• Foto asli akan dihapus dari server Cloudinary untuk menghemat kuota penyimpanan.\n` +
      `• Foto digantikan oleh Banner Verifikasi Resmi UNNES (0 KB Cloudinary).\n` +
      `• Status barang berubah menjadi 'Sudah Kembali' (Kasus Selesai).`
    );
    if (!confirm) return;

    try {
      await markItemAsReturned(item.id);
      alert('Berhasil! Status barang telah ditandai kembali ke pemilik dan foto asli telah dibersihkan demi privasi.');
    } catch (err) {
      console.error(err);
      alert('Gagal menandai barang kembali.');
    }
  };

  const handleDeleteItem = async () => {
    const confirm = window.confirm(
      `⚠️ PERINGATAN HAPUS POSTINGAN:\n\n` +
      `Apakah Anda yakin ingin MENGHAPUS laporan #${item.item_code} ("${item.title}") secara permanen?\n\n` +
      `• Data akan dihapus dari database Supabase.\n` +
      `• Seluruh foto yang diunggah akan dihapus dari Cloudinary.\n` +
      `• Tindakan ini tidak dapat dibatalkan!`
    );
    if (!confirm) return;

    try {
      await deleteItem(item.id);
      alert('Postingan dan foto terkait berhasil dihapus permanen!');
      navigate('/jelajahi');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus postingan.');
    }
  };

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Back Button (Archival Monospace Link) */}
      <div>
        <button 
          onClick={() => navigate(-1)} 
          style={{
            background: 'transparent',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: 'var(--ink-700)',
            cursor: 'pointer',
            padding: '4px 0'
          }}
        >
          <ArrowLeft size={15} /> &larr; KEMBALI KE JELAJAHI ARSIP
        </button>
      </div>

      {/* Main Grid: Gallery & Archival Information (03 Detail Barang — Desktop) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Photo Gallery & Archival Guidelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Main Photo Container */}
          <div 
            style={{ 
              position: 'relative', 
              aspectRatio: '4/3', 
              borderRadius: '6px', 
              overflow: 'hidden',
              backgroundColor: 'var(--ink-100)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(4px)',
                color: '#FFFFFF',
                padding: '1.5rem',
                textAlign: 'center',
                zIndex: 4,
                gap: '0.65rem'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Lock size={20} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.08em' }}>
                    [FOTO DOKUMEN DISENSOR]
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#CBD5E1', maxWidth: '320px', margin: '0.35rem auto 0', lineHeight: 1.5 }}>
                    Sesuai SOP Arsip UNNES, foto barang temuan disensor untuk mencegah klaim fiktif. Masuk untuk melihat foto asli atau ajukan blind test.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/masuk', { state: { from: location } })}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.4rem', marginTop: '0.4rem' }}
                >
                  <LogIn size={14} /> Masuk Akun UNNES
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
                  <Award size={12} /> HADIAH RP {item.bounty_amount.toLocaleString('id-ID')}
                </span>
              </div>
            )}

            {/* Bottom Bar inside Photo */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, transparent 100%)',
              padding: '8px 12px',
              color: '#FFFFFF',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 6
            }}>
              <span style={{ fontWeight: 700, color: '#A5B4FC' }}>
                #{item.item_code}
              </span>
              <span style={{ color: '#CBD5E1' }}>
                {new Date(item.date_lost_found || item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
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
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: selectedPhotoIndex === idx ? '2px solid var(--ink-900)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    opacity: selectedPhotoIndex === idx ? 1 : 0.6,
                    padding: 0,
                    background: 'transparent'
                  }}
                >
                  <img src={url} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {/* SOP Archival Guidelines Box (From Figma Detail Screen) */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '3px solid var(--ink-900)',
            borderRadius: '4px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--ink-900)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              <ShieldCheck size={16} /> PETUNJUK KESELAMATAN &amp; KLAIM
            </div>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '1.15rem', 
              fontSize: '0.8rem', 
              color: 'var(--ink-700)', 
              lineHeight: 1.6,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <li>Verifikasi kepemilikan dilakukan secara tertutup melalui pertanyaan blind-test.</li>
              <li>Pengambilan fisik barang disarankan di Posko Resmi UNNES (Gedung Rektorat atau Pos Satpam Fakultas).</li>
              <li>Pelapor dan penemu wajib menandatangani Berita Acara Serah Terima digital setelah barang diterima.</li>
            </ul>
          </div>

        </div>

        {/* Right Column: Archival Metadata Table & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header Metadata Tag & Title */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.65rem', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.75rem', 
              marginBottom: '0.4rem',
              color: 'var(--ink-500)' 
            }}>
              <span style={{ fontWeight: 700, color: '#2563EB' }}>#{item.item_code}</span>
              <span>&bull;</span>
              <span>{item.type === 'hilang' ? 'BARANG HILANG' : 'BARANG TEMUAN'}</span>
              <span>&bull;</span>
              <span>DILAPORKAN {new Date(item.date_lost_found || item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}</span>
            </div>

            <h1 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', 
              fontWeight: 700, 
              lineHeight: 1.2, 
              color: 'var(--ink-900)',
              margin: '0.25rem 0 0'
            }}>
              {item.title}
            </h1>
          </div>

          {/* Archival Dotted Leader Table */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              letterSpacing: '0.08em', 
              color: 'var(--ink-500)', 
              textTransform: 'uppercase',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.4rem',
              marginBottom: '0.2rem'
            }}>
              DATA ARSIP SPESIFIKASI BARANG
            </div>

            <div className="dotted-row">
              <span className="dotted-label">KATEGORI</span>
              <span className="dotted-line"></span>
              <span className="dotted-value">{item.category}</span>
            </div>

            <div className="dotted-row">
              <span className="dotted-label">FAKULTAS / LOKASI</span>
              <span className="dotted-line"></span>
              <span className="dotted-value">{item.location_building}</span>
            </div>

            {(item.location_floor || item.location_room) && (
              <div className="dotted-row">
                <span className="dotted-label">LANTAI / RUANG</span>
                <span className="dotted-line"></span>
                <span className="dotted-value">{[item.location_floor, item.location_room].filter(Boolean).join(' - ')}</span>
              </div>
            )}

            {item.location_detail && (
              <div className="dotted-row">
                <span className="dotted-label">POSISI DETAIL</span>
                <span className="dotted-line"></span>
                <span className="dotted-value">{item.location_detail}</span>
              </div>
            )}

            <div className="dotted-row">
              <span className="dotted-label">STATUS ARSIP</span>
              <span className="dotted-line"></span>
              <span className="dotted-value" style={{ fontWeight: 700, color: item.item_status === 'dikembalikan' ? '#059669' : 'var(--ink-900)' }}>
                {item.item_status === 'dikembalikan' ? 'SELESAI (SUDAH KEMBALI)' : isItemVerified ? 'TERVERIFIKASI PEMILIK' : 'TERBUKA / MENUNGGU KLAIM'}
              </span>
            </div>

            <div className="dotted-row">
              <span className="dotted-label">PELAPOR RESMI</span>
              <span className="dotted-line"></span>
              <span className="dotted-value">{item.user_name || 'Civitas UNNES'}</span>
            </div>

            {item.bounty_amount > 0 && (
              <div className="dotted-row">
                <span className="dotted-label" style={{ color: '#CA8A04' }}>PROGRAM HADIAH</span>
                <span className="dotted-line"></span>
                <span className="dotted-value" style={{ color: '#CA8A04', fontWeight: 700 }}>Rp {item.bounty_amount.toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>

          {/* Description Box */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem'
          }}>
            <h3 style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              letterSpacing: '0.08em', 
              color: 'var(--ink-500)', 
              textTransform: 'uppercase',
              margin: 0
            }}>
              CATATAN &amp; CIRI FISIK BARANG:
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--ink-900)', lineHeight: 1.65, whiteSpace: 'pre-line', margin: 0 }}>
              {item.description}
            </p>
          </div>

          {/* Reporter & Share Actions */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-card-alt)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            fontSize: '0.8rem',
            color: 'var(--ink-700)'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              ID PELAPOR: <strong>{item.user_name}</strong>
            </div>
            <button 
              onClick={handleShare}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}
            >
              <Share2 size={13} /> {copied ? 'LINK TERSALIN!' : 'BAGIKAN ARSIP'}
            </button>
          </div>


          {/* Panel Pengelolaan (Admin & Pemilik) */}
          {(isAdmin || isOwner) && (
            <div className="glass-card" style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              background: 'var(--bg-surface-alt)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  ⚙️ Panel Pengelolaan Laporan {isAdmin ? '(Akses Admin)' : '(Akses Pelapor)'}
                </span>
                {isAdmin && (
                  <span className="badge badge-admin" style={{ fontSize: '0.7rem' }}>
                    Super/Admin Mode
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Tombol Tandai Kembali ke Pemilik */}
                {item.item_status !== 'dikembalikan' ? (
                  <button
                    onClick={handleMarkReturned}
                    className="btn btn-teal btn-sm"
                    style={{ gap: '0.4rem', flex: 1, minWidth: '220px' }}
                    title="Tandai kasus selesai, hapus foto asli di Cloudinary & ganti banner status"
                  >
                    <CheckCheck size={16} /> Tandai Barang Telah Kembali
                  </button>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--success)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    flex: 1
                  }}>
                    <CheckCircle2 size={16} /> Barang Sudah Dikembalikan (Foto Asli Dihapus Demi Privasi)
                  </div>
                )}

                {/* Tombol Batalkan Verifikasi Klaim (Khusus Admin jika ada klaim disetujui tapi belum selesai) */}
                {isAdmin && isItemVerified && item.item_status !== 'dikembalikan' && (
                  <button
                    onClick={handleAdminRevoke}
                    className="btn btn-outline btn-danger btn-sm"
                    style={{ gap: '0.4rem', flex: 1, minWidth: '220px' }}
                    title="Batalkan status verifikasi jika terindikasi klaim palsu atau ada sanggahan valid dari pemilik asli"
                  >
                    <AlertTriangle size={15} /> Batalkan Verifikasi (Klaim Palsu / Buka Kasus)
                  </button>
                )}

                {/* Tombol Hapus Postingan (Admin & Owner) */}
                <button
                  onClick={handleDeleteItem}
                  className="btn btn-danger btn-sm"
                  style={{ gap: '0.4rem' }}
                  title="Hapus permanen dari Supabase & bersihkan foto Cloudinary"
                >
                  <Trash2 size={16} /> Hapus Postingan
                </button>
              </div>

              {/* Notifikasi Cepat untuk Admin jika ada Klaim Menunggu */}
              {isAdmin && pendingClaimsForItem.length > 0 && (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--warning-bg)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  fontSize: '0.8rem'
                }}>
                  <span style={{ color: 'var(--amber-800)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={15} /> Terdapat {pendingClaimsForItem.length} klaim Blind Test menunggu verifikasi Anda!
                  </span>
                  <Link to="/admin/klaim" className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
                    Verifikasi di Panel Klaim &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

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
            
            {item.item_status === 'dikembalikan' ? (
              /* ==================== KASUS SELESAI: BARANG BERHASIL DIKEMBALIKAN ==================== */
              <div style={{
                padding: '1.5rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1.5px solid rgba(16, 185, 129, 0.35)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.65rem'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--success)'
                }}>
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--success)', marginBottom: '0.35rem' }}>
                    Barang Berhasil Dikembalikan! 🎉
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto', lineHeight: 1.5 }}>
                    Laporan ini telah selesai dan ditutup. Barang telah diverifikasi melalui Blind Test dan diserahkan kepada pemilik yang sah. <strong>Barang tidak dapat diklaim lagi.</strong>
                  </p>
                </div>

                {existingMatch && (isVerifiedOwner || isOwner) && (
                  <button 
                    onClick={() => navigate(`/pesan/${existingMatch.id}`)}
                    className="btn btn-teal btn-sm"
                    style={{ marginTop: '0.5rem', gap: '0.4rem' }}
                  >
                    <MessageSquare size={16} /> Buka Riwayat Obrolan & Serah Terima
                  </button>
                )}
              </div>
            ) : item.type === 'temuan' ? (
              /* ==================== ALUR BARANG DITEMUKAN ==================== */
              isOwner ? (
                /* 1. Pengguna adalah Penemu / Pembuat Laporan */
                <>
                  <div style={{
                    textAlign: 'center',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-50)',
                    border: '1px solid var(--primary-200)',
                    color: 'var(--primary-900)',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    📌 Anda adalah penemu yang melaporkan barang ini. Menunggu pemilik asli mengajukan klaim via Blind Test.
                  </div>
                  {existingMatch && (
                    <button 
                      onClick={() => navigate(`/pesan/${existingMatch.id}`)}
                      className="btn btn-teal btn-lg"
                      style={{ gap: '0.5rem', width: '100%' }}
                    >
                      <MessageSquare size={18} /> Buka Ruang Obrolan & Serah Terima
                    </button>
                  )}
                </>
              ) : isClaimRevoked ? (
                /* 2. Pengguna yang klaimnya DIBATALKAN oleh Admin (Klaim Palsu) -> DIBLOKIR PERMANEN */
                <div style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--danger-bg)',
                  border: '1.5px solid rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--danger)', fontSize: '0.95rem' }}>
                    <AlertCircle size={20} /> Akses Klaim Ditutup Permanen
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--danger)', margin: 0, lineHeight: 1.5 }}>
                    Klaim kepemilikan Anda sebelumnya untuk barang #{item.item_code} telah <strong>dibatalkan oleh Admin Posko</strong>. Alasan: <em>"{userClaim?.admin_notes || 'Terindikasi klaim tidak sah / palsu'}"</em>.
                  </p>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                    ⛔ Demi integritas data dan keamanan kampus UNNES, akun Anda tidak dapat mengajukan klaim kembali untuk barang ini.
                  </div>
                </div>
              ) : isVerifiedOwner ? (
                /* 3. Pengguna adalah Pemilik yang SUDAH LULUS Blind Test / Match Aktif */
                <>
                  <div style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: 'var(--success)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <CheckCircle2 size={18} />
                    <span>Klaim Terverifikasi! Anda dinyatakan sebagai pemilik sah melalui verifikasi Blind Test.</span>
                  </div>

                  {existingMatch && (
                    <button 
                      onClick={() => navigate(`/pesan/${existingMatch.id}`)}
                      className="btn btn-teal btn-lg"
                      style={{ gap: '0.5rem', width: '100%' }}
                    >
                      <MessageSquare size={18} /> Buka Ruang Obrolan & Serah Terima
                    </button>
                  )}

                  {/* Tombol Runner TERBUKA karena sudah lulus Blind Test */}
                  <button
                    onClick={() => setShowRunnerModal(true)}
                    className="btn btn-accent btn-lg"
                    style={{ gap: '0.5rem', width: '100%' }}
                  >
                    <Bike size={18} /> Pesan Jasa Runner UNNES (Antar ke Kelas/Gedung Anda)
                  </button>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    💡 Runner resmi UNNES siap mengambil barang dari penemu/posko dan mengantarkan ke lokasi Anda.
                  </div>
                </>
              ) : isClaimPending ? (
                /* 4. Pengguna sudah mengajukan Blind Test, sedang menunggu verifikasi Admin Posko */
                <>
                  <div style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--warning-bg)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--amber-800)', fontSize: '0.9rem' }}>
                      <Clock size={18} /> Verifikasi Blind Test Sedang Ditinjau Admin
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--amber-900)', margin: 0, lineHeight: 1.5 }}>
                      Jawaban Blind Test Anda telah dikirim (Indikator Kecocokan: <strong>{userClaim.blind_test_score}%</strong>). 
                      Admin Posko UNNES sedang membandingkan seluruh pengajuan dengan catatan rahasia penemu untuk memilih yang paling sesuai. 
                      Opsi <strong>Pesan Jasa Runner UNNES</strong> akan otomatis aktif begitu klaim disetujui!
                    </p>
                  </div>

                  {/* Tombol Runner TERKUNCI selama menunggu verifikasi */}
                  <button
                    disabled
                    className="btn btn-outline"
                    style={{
                      gap: '0.5rem',
                      width: '100%',
                      opacity: 0.65,
                      cursor: 'not-allowed',
                      background: 'var(--bg-surface-alt)',
                      borderColor: 'var(--border-medium)',
                      color: 'var(--text-muted)'
                    }}
                    title="Menunggu persetujuan Admin Posko atas jawaban Blind Test Anda"
                  >
                    <Lock size={18} color="var(--amber-600)" /> Pesan Jasa Runner UNNES (Menunggu Verifikasi Blind Test Selesai)
                  </button>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    ⏳ Runner hanya dapat dipesan setelah verifikasi Blind Test disetujui oleh Admin.
                  </div>
                </>
              ) : isClaimRejected ? (
                /* 5. Klaim Blind Test ditolak oleh Admin -> DAPAT DIAJUKAN ULANG */
                <>
                  <div style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--danger-bg)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--danger)', fontSize: '0.9rem' }}>
                      <AlertCircle size={18} /> Klaim Blind Test Belum Sesuai
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--danger)', margin: 0, lineHeight: 1.5 }}>
                      Catatan Admin: <strong>{userClaim.admin_notes || 'Jawaban ciri khusus belum cocok dengan data penemu.'}</strong>
                    </p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.45 }}>
                      💡 Takut ada ciri tersembunyi yang belum sempat Anda jelaskan? Anda dapat <strong>mengajukan klaim ulang</strong> dengan memberikan rincian ciri fisik barang yang lebih detail agar Admin dapat mencocokkannya kembali.
                    </div>
                  </div>

                  <button
                    onClick={() => setShowBlindTestModal(true)}
                    className="btn btn-primary btn-lg"
                    style={{ gap: '0.5rem', width: '100%' }}
                  >
                    <ShieldCheck size={20} /> Ajukan Ulang Klaim Blind Test (Perjelas Rincian Ciri)
                  </button>

                  <button
                    onClick={handleLockedRunnerClick}
                    className="btn btn-outline"
                    style={{
                      gap: '0.5rem',
                      width: '100%',
                      background: 'var(--bg-surface-alt)',
                      borderColor: 'var(--border-medium)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <Lock size={18} color="var(--amber-600)" /> Pesan Jasa Runner UNNES (Terkunci)
                  </button>
                </>
              ) : isItemVerified ? (
                /* 6. Barang sudah ada pemilik terverifikasi yang disetujui admin (User lain tidak bisa klaim, tapi bisa ajukan sanggahan ke Admin) */
                <div style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(15, 23, 42, 0.03)',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    <ShieldCheck size={18} color="var(--teal-600)" />
                    <span>Terverifikasi Pemilik (Menunggu Serah Terima)</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Klaim kepemilikan untuk barang ini telah disetujui oleh Admin Posko kepada pemohon sah dan saat ini sedang dalam proses koordinasi / pengantaran oleh Runner UNNES.
                  </p>
                  
                  {/* Tombol Sanggahan jika pengguna lain merasa verifikasi ini keliru */}
                  <div style={{ paddingTop: '0.65rem', borderTop: '1px dashed var(--border-light)' }}>
                    <button
                      onClick={() => {
                        if (!user) {
                          navigate('/masuk', { state: { from: location } });
                          return;
                        }
                        setShowObjectionModal(true);
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ gap: '0.4rem', color: 'var(--amber-800)', borderColor: 'rgba(245, 158, 11, 0.5)', width: '100%', justifyContent: 'center' }}
                    >
                      <AlertCircle size={15} color="var(--amber-600)" /> Ini Barang Anda yang Sebenarnya? Laporkan Sanggahan ke Admin
                    </button>
                  </div>
                </div>
              ) : (
                /* 7. Belum ada klaim disetujui -> SEMUA PENGGUNA BISA KLAIM */
                  <>
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

                    {/* Tombol Runner Terkunci dengan Interaksi Edukatif */}
                    <button
                      onClick={handleLockedRunnerClick}
                      className="btn btn-outline"
                      style={{
                        gap: '0.5rem',
                        width: '100%',
                        background: 'var(--bg-surface-alt)',
                        borderColor: 'var(--border-medium)',
                        color: 'var(--text-secondary)'
                      }}
                      title="Klik untuk membuka verifikasi Blind Test terlebih dahulu"
                    >
                      <Lock size={18} color="var(--amber-600)" /> Pesan Jasa Runner UNNES (Wajib Verifikasi Blind Test Dahulu)
                    </button>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
                      🛡️ <strong>SOP Keamanan UNNES:</strong> Siapa pun yang merasa kehilangan barang ini dapat mengajukan klaim. Admin akan mencocokkan seluruh jawaban pemohon dengan data rahasia penemu untuk memilih pemilik yang paling sah.
                    </div>
                  </>
                )
            ) : (
              /* ==================== ALUR BARANG HILANG ==================== */
              isOwner ? (
                /* Pelapor barang hilang */
                <>
                  <div style={{
                    textAlign: 'center',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-50)',
                    color: 'var(--primary-800)',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    📌 Anda adalah pelapor postingan barang hilang ini
                  </div>

                  {existingMatch && (
                    <button 
                      onClick={() => navigate(`/pesan/${existingMatch.id}`)}
                      className="btn btn-teal btn-lg"
                      style={{ gap: '0.5rem', width: '100%' }}
                    >
                      <MessageSquare size={18} /> Buka Ruang Obrolan & Serah Terima
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/masuk', { state: { from: location } });
                        return;
                      }
                      setShowRunnerModal(true);
                    }}
                    className="btn btn-accent btn-lg"
                    style={{ gap: '0.5rem', width: '100%' }}
                  >
                    <Bike size={18} /> Pesan Jasa Runner UNNES (Bantu Cari / Active Hunting)
                  </button>
                </>
              ) : existingMatch ? (
                <button 
                  onClick={() => navigate(`/pesan/${existingMatch.id}`)}
                  className="btn btn-teal btn-lg"
                  style={{ gap: '0.5rem', width: '100%' }}
                >
                  <MessageSquare size={18} /> Buka Ruang Obrolan & Serah Terima
                </button>
              ) : userFoundReport ? (
                /* Status laporan penemuan dari user yang sedang login */
                userFoundReport.status === 'menunggu_review' ? (
                  <div style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--warning-50, #fffbeb)',
                    border: '1px solid var(--warning-200, #fde68a)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning-800, #92400e)', fontWeight: 700, fontSize: '0.9rem' }}>
                      <Clock size={18} /> Laporan Penemuan Sedang Diverifikasi Admin
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--warning-700, #b45309)', lineHeight: 1.5 }}>
                      Anda telah melaporkan menemukan barang ini. Bukti & ciri yang Anda cantumkan sedang ditinjau oleh Admin Posko UNNES. Ruang obrolan langsung dengan pemilik akan otomatis terbuka setelah laporan disetujui.
                    </p>
                  </div>
                ) : userFoundReport.status === 'disetujui' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: 'var(--teal-800, #065f46)',
                      fontSize: '0.85rem'
                    }}>
                      ✅ <strong>Laporan Penemuan Disetujui!</strong> Anda telah terverifikasi sebagai penemu barang ini.
                    </div>
                    {existingMatch && (
                      <button 
                        onClick={() => navigate(`/pesan/${existingMatch.id}`)}
                        className="btn btn-teal btn-lg"
                        style={{ gap: '0.5rem', width: '100%' }}
                      >
                        <MessageSquare size={18} /> Buka Ruang Obrolan & Serah Terima
                      </button>
                    )}
                  </div>
                ) : (
                  /* Ditolak */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--danger-50, #fef2f2)',
                      border: '1px solid var(--danger-200, #fecaca)',
                      color: 'var(--danger-700, #b91c1c)',
                      fontSize: '0.82rem',
                      lineHeight: 1.4
                    }}>
                      <strong>Laporan Penemuan Belum Sesuai:</strong> {userFoundReport.admin_notes || 'Informasi ciri atau lokasi yang dilaporkan belum cocok.'}
                    </div>
                    <button
                      onClick={() => setShowFoundReportModal(true)}
                      className="btn btn-teal btn-lg"
                      style={{ gap: '0.5rem', width: '100%', justifyContent: 'center' }}
                    >
                      <CheckCircle2 size={18} /> Ajukan Ulang Laporan Penemuan
                    </button>
                  </div>
                )
              ) : (
                /* Belum ada laporan temuan dari user ini */
                <>
                  <div style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--info-bg)',
                    border: '1px solid rgba(2, 132, 199, 0.25)',
                    fontSize: '0.825rem',
                    color: 'var(--info)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}>
                    <Sparkles size={18} style={{ flexShrink: 0 }} />
                    <span>Melihat atau menemukan barang ini di kampus? Laporkan ciri & lokasinya agar Admin dapat menghubungkan Anda ke pemilik.</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/masuk', { state: { from: location } });
                        return;
                      }
                      setShowFoundReportModal(true);
                    }}
                    className="btn btn-teal btn-lg"
                    style={{ gap: '0.5rem', width: '100%', justifyContent: 'center' }}
                  >
                    <CheckCircle2 size={18} /> Saya Menemukan Barang Ini!
                  </button>
                </>
              )
            )}

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
        item={{ ...item, match_id: userMatch?.id || existingMatch?.id }}
        isOpen={showRunnerModal}
        onClose={() => setShowRunnerModal(false)}
        onSuccess={() => alert('Pesanan Jasa Runner UNNES berhasil dibuat! Runner kami akan segera bergerak.')}
      />

      <ClaimObjectionModal
        item={item}
        isOpen={showObjectionModal}
        onClose={() => setShowObjectionModal(false)}
      />

      <FoundReportModal
        item={item}
        isOpen={showFoundReportModal}
        onClose={() => setShowFoundReportModal(false)}
        onSuccess={() => alert('Laporan penemuan berhasil dikirim ke Admin Posko! Ruang obrolan akan terbuka setelah disetujui.')}
      />
    </div>
  );
};
