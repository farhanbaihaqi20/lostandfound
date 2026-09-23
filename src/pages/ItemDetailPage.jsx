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
            {isItemVerified && item.item_status !== 'dikembalikan' && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(13, 148, 136, 0.1)',
                border: '1px solid rgba(13, 148, 136, 0.3)',
                color: 'var(--teal-700)',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '0.4rem'
              }}>
                <ShieldCheck size={14} color="var(--teal-600)" /> Terverifikasi Pemilik (Menunggu Serah Terima)
              </div>
            )}
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
