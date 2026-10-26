import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  X, 
  Clock, 
  Eye, 
  Lock, 
  ArrowLeft, 
  Trash2, 
  CheckCheck
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { AdminNavTabs } from '../../components/AdminNavTabs';

export const ModerationPage = () => {
  const { items, approveItem, rejectItem, deleteItem, markItemAsReturned } = useData();

  const [activeFilter, setActiveFilter] = useState('menunggu_review');
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredItems = items.filter(i => {
    if (activeFilter === 'semua') return true;
    return i.post_status === activeFilter;
  });

  const handleApprove = (itemId) => {
    approveItem(itemId);
    alert('Laporan berhasil DISETUJUI (ACC)! Postingan sekarang aktif di katalog publik UNNES.');
    if (selectedItem?.id === itemId) setSelectedItem(null);
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectModalItem) return;
    rejectItem(rejectModalItem.id, rejectionReason || 'Foto atau informasi kurang jelas/tidak sesuai SOP');
    alert('Laporan DITOLAK. Notifikasi beserta alasan telah dikirimkan ke mahasiswa pelapor.');
    setRejectModalItem(null);
    setRejectionReason('');
    if (selectedItem?.id === rejectModalItem.id) setSelectedItem(null);
  };

  const handleDelete = async (item) => {
    const confirm = window.confirm(
      `⚠️ Hapus laporan #${item.item_code} ("${item.title}") secara permanen?\n\n` +
      `• Data akan dihapus dari Supabase.\n` +
      `• Seluruh foto yang diunggah akan dihapus dari Cloudinary.`
    );
    if (!confirm) return;

    await deleteItem(item.id);
    alert(`Laporan #${item.item_code} berhasil dihapus.`);
    if (selectedItem?.id === item.id) setSelectedItem(null);
  };

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <AdminNavTabs />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin" className="btn btn-ghost btn-sm" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={16} /> Panel
          </Link>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Moderasi & ACC Postingan Mahasiswa</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Pastikan foto bebas data sensitif (NIK/NIM) dan info sesuai SOP Kampus.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveFilter('menunggu_review')}
            className={`btn btn-sm ${activeFilter === 'menunggu_review' ? 'btn-accent' : 'btn-outline'}`}
            style={{ gap: '0.3rem' }}
          >
            <Clock size={14} /> Menunggu ({items.filter(i => i.post_status === 'menunggu_review').length})
          </button>
          <button
            onClick={() => setActiveFilter('disetujui')}
            className={`btn btn-sm ${activeFilter === 'disetujui' ? 'btn-primary' : 'btn-outline'}`}
          >
            Disetujui ({items.filter(i => i.post_status === 'disetujui').length})
          </button>
          <button
            onClick={() => setActiveFilter('ditolak')}
            className={`btn btn-sm ${activeFilter === 'ditolak' ? 'btn-primary' : 'btn-outline'}`}
          >
            Ditolak ({items.filter(i => i.post_status === 'ditolak').length})
          </button>
        </div>
      </div>

      {/* Main List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredItems.length === 0 ? (
          <div className="archive-card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--ink-500)' }}>
            <Check size={40} color="#059669" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontWeight: 600, color: 'var(--ink-900)' }}>Tidak ada postingan dalam status ini.</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div 
              key={item.id} 
              className="archive-card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  {/* Small Thumbnail */}
                  <img
                    src={item.photo_urls?.[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=150&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                        #{item.item_code}
                      </span>
                      <span className={`badge ${item.type === 'hilang' ? 'badge-lost' : 'badge-found'}`} style={{ fontSize: '0.65rem' }}>
                        {item.type === 'hilang' ? 'Barang Hilang' : 'Barang Temuan'}
                      </span>
                      <span className="badge badge-review" style={{ fontSize: '0.65rem' }}>
                        {item.post_status.replace('_', ' ')}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.2rem' }}>
                      {item.title}
                    </h2>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Pelapor: <strong>{item.user_name}</strong> • Lokasi: {item.location_building} ({item.location_floor || ''} {item.location_room || ''})
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                    className="btn btn-outline btn-sm"
                    style={{ gap: '0.3rem' }}
                  >
                    <Eye size={14} /> {selectedItem?.id === item.id ? 'Tutup Detail' : 'Periksa Detail'}
                  </button>

                  {item.post_status === 'menunggu_review' && (
                    <>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="btn btn-teal btn-sm"
                        style={{ gap: '0.3rem' }}
                      >
                        <Check size={14} /> ACC & Tayangkan
                      </button>
                      <button
                        onClick={() => setRejectModalItem(item)}
                        className="btn btn-danger btn-sm"
                        style={{ gap: '0.3rem' }}
                      >
                        <X size={14} /> Tolak
                      </button>
                    </>
                  )}

                  {item.post_status === 'disetujui' && item.item_status !== 'dikembalikan' && (
                    <button
                      onClick={async () => {
                        if (window.confirm(`Tandai laporan #${item.item_code} ("${item.title}") sudah kembali ke pemilik?\nFoto asli di Cloudinary akan dihapus & diganti banner status.`)) {
                          await markItemAsReturned(item.id);
                          alert(`Laporan #${item.item_code} berhasil ditandai telah kembali.`);
                        }
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ gap: '0.3rem', color: 'var(--teal-600)' }}
                      title="Tandai kasus selesai & bersihkan foto Cloudinary"
                    >
                      <CheckCheck size={14} /> Tandai Selesai
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item)}
                    className="btn btn-ghost btn-sm"
                    style={{ gap: '0.3rem', color: 'var(--danger)' }}
                    title="Hapus permanen postingan & foto Cloudinary"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>

              {/* Collapsible Inspection Details */}
              {selectedItem?.id === item.id && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  background: 'var(--bg-surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  borderTop: '1px solid var(--border-light)'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Deskripsi Pelapor:</h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{item.description}</p>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary-800)' }}>
                      <Lock size={14} /> Detail Tersembunyi (Disimpan untuk Blind Test):
                    </h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-primary)', background: 'var(--primary-50)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                      {item.hidden_details || '(Tidak ada catatan rahasia)'}
                    </p>
                  </div>

                  {item.photo_urls && item.photo_urls.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Foto-Foto yang Diunggah:</h4>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {item.photo_urls.map((url, idx) => (
                          <img key={idx} src={url} alt="upload" style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reject Modal with Reason Input */}
      {rejectModalItem && (
        <div className="modal-backdrop" onClick={() => setRejectModalItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Tolak Laporan #{rejectModalItem.item_code}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Tuliskan alasan penolakan agar mahasiswa pelapor dapat memperbaikinya.
            </p>

            <form onSubmit={handleConfirmReject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Alasan Penolakan:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Foto terlihat memuat nomor KTP/KTM secara jelas. Harap sensor terlebih dahulu sebelum mengajukan ulang."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setRejectModalItem(null)} className="btn btn-outline btn-sm">
                  Batal
                </button>
                <button type="submit" className="btn btn-danger btn-sm">
                  Konfirmasi Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
