import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Check, 
  X, 
  AlertCircle, 
  ArrowLeft, 
  MessageSquare, 
  MapPin, 
  Phone, 
  User, 
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { AdminNavTabs } from '../../components/AdminNavTabs';

export const FoundReportsModerationPage = () => {
  const navigate = useNavigate();
  const { foundReports, items, matches, approveFoundReport, rejectFoundReport } = useData();

  const [activeFilter, setActiveFilter] = useState('menunggu_review');
  const [processingId, setProcessingId] = useState(null);
  const [rejectModalReport, setRejectModalReport] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const filteredReports = (foundReports || []).filter(r => {
    if (activeFilter === 'semua') return true;
    return r.status === activeFilter;
  });

  const pendingCount = (foundReports || []).filter(r => r.status === 'menunggu_review').length;
  const approvedCount = (foundReports || []).filter(r => r.status === 'disetujui').length;
  const rejectedCount = (foundReports || []).filter(r => r.status === 'ditolak').length;

  const handleApprove = async (report) => {
    const targetItem = items.find(i => i.id === report.item_id);
    const confirmApprove = window.confirm(
      `SETUJUI LAPORAN PENEMUAN?\n\n` +
      `Apakah Anda yakin menyetujui laporan penemuan dari "${report.reporter_name}" untuk barang #${targetItem?.item_code || ''} (${targetItem?.title || ''})?\n\n` +
      `• Status laporan akan disetujui.\n` +
      `• Match baru akan dibuat secara otomatis.\n` +
      `• Ruang obrolan langsung antara penemu dan pemilik barang akan DIBUKA.\n` +
      `• Kedua belah pihak akan menerima notifikasi resmi.`
    );
    if (!confirmApprove) return;

    setProcessingId(report.id);
    try {
      const res = await approveFoundReport(report.id, 'Laporan penemuan diverifikasi dan disetujui Admin Posko.');
      if (res?.error) {
        alert(res.error);
      } else {
        alert('Laporan penemuan berhasil disetujui! Ruang obrolan langsung antara penemu dan pemilik telah dibuka.');
      }
    } catch (err) {
      console.error('Error saat menyetujui laporan temuan:', err);
      alert('Terjadi kesalahan saat menyetujui laporan.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModalReport) return;

    if (!rejectReason.trim()) {
      alert('Mohon cantumkan alasan penolakan agar pelapor mendapat kejelasan.');
      return;
    }

    setProcessingId(rejectModalReport.id);
    try {
      const res = await rejectFoundReport(rejectModalReport.id, rejectReason.trim());
      if (res?.error) {
        alert(res.error);
      } else {
        alert('Laporan penemuan berhasil ditolak.');
        setRejectModalReport(null);
        setRejectReason('');
      }
    } catch (err) {
      console.error('Error saat menolak laporan temuan:', err);
      alert('Terjadi kesalahan saat menolak laporan.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Unified Admin Sub-Navigation */}
      <AdminNavTabs />

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin" className="btn btn-ghost btn-sm" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={16} /> Panel
          </Link>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Moderasi Laporan Temuan Barang Hilang</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Verifikasi bukti & ciri dari penemu sebelum membuka ruang obrolan langsung dengan pemilik barang hilang.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveFilter('menunggu_review')}
            className={`btn btn-sm ${activeFilter === 'menunggu_review' ? 'btn-accent' : 'btn-outline'}`}
          >
            Menunggu ({pendingCount})
          </button>
          <button
            onClick={() => setActiveFilter('disetujui')}
            className={`btn btn-sm ${activeFilter === 'disetujui' ? 'btn-primary' : 'btn-outline'}`}
          >
            Disetujui ({approvedCount})
          </button>
          <button
            onClick={() => setActiveFilter('ditolak')}
            className={`btn btn-sm ${activeFilter === 'ditolak' ? 'btn-danger' : 'btn-outline'}`}
          >
            Ditolak ({rejectedCount})
          </button>
          <button
            onClick={() => setActiveFilter('semua')}
            className={`btn btn-sm ${activeFilter === 'semua' ? 'btn-primary' : 'btn-outline'}`}
          >
            Semua ({(foundReports || []).length})
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredReports.length === 0 ? (
          <div className="glass-card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Search size={40} color="var(--teal-600)" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontWeight: 600 }}>Tidak ada laporan penemuan dalam kategori ini.</p>
          </div>
        ) : (
          filteredReports.map(report => {
            const targetItem = items.find(i => i.id === report.item_id);
            const reportMatch = matches?.find(m => m.found_report_id === report.id || (m.item_id === report.item_id && m.match_type === 'found_report'));

            return (
              <div 
                key={report.id} 
                className="glass-card"
                style={{ 
                  padding: '1.25rem', 
                  border: '1px solid var(--border-light)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem' 
                }}
              >
                {/* Header card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                        #{targetItem?.item_code || 'LF-UNNES'}
                      </span>
                      <span className={`badge ${
                        report.status === 'disetujui' ? 'badge-found' : 
                        report.status === 'ditolak' ? 'badge-lost' : 'badge-review'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {report.status === 'menunggu_review' ? 'Menunggu Review' : 
                         report.status === 'disetujui' ? 'Disetujui' : 'Ditolak'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Clock size={12} /> {new Date(report.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.35rem', marginBottom: '0.2rem' }}>
                      {targetItem ? (
                        <Link to={`/barang/${targetItem.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {targetItem.title} ↗
                        </Link>
                      ) : (
                        <span>Barang Hilang (#{report.item_id})</span>
                      )}
                    </h2>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Pelapor Kehilangan (Pemilik): <strong>{targetItem?.user_name || 'Mahasiswa UNNES'}</strong>
                    </div>
                  </div>

                  {/* Reporter badge */}
                  <div style={{ 
                    background: 'var(--bg-secondary, #f8fafc)', 
                    padding: '0.6rem 0.9rem', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--border-light)',
                    fontSize: '0.8rem',
                    minWidth: '220px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--teal-700, #0f766e)', marginBottom: '0.25rem' }}>
                      <User size={15} /> Penemu yang Melaporkan:
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {report.reporter_name || 'Pengguna'}
                    </div>
                    {report.reporter_phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                        <Phone size={12} /> WA: {report.reporter_phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Report Content Details */}
                <div style={{
                  background: 'var(--bg-secondary, #f8fafc)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  border: '1px solid var(--border-light)'
                }}>
                  {/* Ciri-ciri */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      🔍 Ciri Fisik Barang yang Ditemukan:
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {report.description}
                    </div>
                  </div>

                  {/* Lokasi ditemukan */}
                  {report.found_location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <MapPin size={15} color="var(--primary-600)" />
                      <span>Lokasi Penemuan: <strong>{report.found_location}</strong></span>
                    </div>
                  )}

                  {/* Foto Bukti */}
                  {report.photo_urls && report.photo_urls.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        📸 Foto Bukti Temuan ({report.photo_urls.length}):
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {report.photo_urls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Bukti temuan ${idx + 1}`}
                            onClick={() => setPreviewPhoto(url)}
                            style={{
                              width: '80px',
                              height: '80px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              border: '1px solid var(--border-light)',
                              cursor: 'pointer',
                              transition: 'transform 0.15s ease'
                            }}
                            title="Klik untuk perbesar"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes / Reason if reviewed */}
                  {report.admin_notes && (
                    <div style={{ 
                      marginTop: '0.25rem',
                      padding: '0.5rem 0.75rem', 
                      borderRadius: 'var(--radius-sm, 6px)',
                      background: report.status === 'disetujui' ? 'rgba(16, 185, 129, 0.1)' : 'var(--danger-50, #fef2f2)',
                      fontSize: '0.8rem',
                      color: report.status === 'disetujui' ? 'var(--teal-800, #065f46)' : 'var(--danger-700, #b91c1c)'
                    }}>
                      <strong>Catatan Admin:</strong> {report.admin_notes}
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {report.status === 'menunggu_review' ? (
                    <>
                      <button
                        onClick={() => {
                          setRejectModalReport(report);
                          setRejectReason('');
                        }}
                        disabled={processingId === report.id}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--danger-600, #dc2626)', borderColor: 'var(--danger-300, #fca5a5)' }}
                      >
                        <X size={15} /> Tolak Laporan
                      </button>
                      <button
                        onClick={() => handleApprove(report)}
                        disabled={processingId === report.id}
                        className="btn btn-primary btn-sm"
                        style={{ gap: '0.35rem' }}
                      >
                        {processingId === report.id ? 'Memproses...' : (
                          <>
                            <Check size={15} /> Setujui & Buka Chat
                          </>
                        )}
                      </button>
                    </>
                  ) : report.status === 'disetujui' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--teal-700, #0f766e)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={16} /> Chat Room Terbuka
                      </span>
                      {reportMatch && (
                        <Link to={`/pesan/${reportMatch.id}`} className="btn btn-teal btn-sm" style={{ gap: '0.35rem' }}>
                          <MessageSquare size={15} /> Buka Ruang Obrolan
                        </Link>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--danger-600, #dc2626)', fontWeight: 600 }}>
                      ✕ Laporan Ditolak
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalReport && (
        <div className="modal-backdrop" onClick={() => setRejectModalReport(null)} style={{ zIndex: 1200 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-600, #dc2626)' }}>
                <AlertCircle size={22} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Tolak Laporan Penemuan</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setRejectModalReport(null)} 
                className="btn btn-ghost" 
                style={{ padding: '0.4rem', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
              Berikan alasan penolakan untuk laporan penemuan dari <strong>{rejectModalReport.reporter_name}</strong>. Alasan ini akan dikirimkan kepada pelapor sebagai panduan.
            </p>

            <form onSubmit={handleRejectSubmit}>
              <textarea
                required
                rows={4}
                className="form-input"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Ciri khusus atau warna barang yang dilaporkan tidak sesuai dengan laporan kehilangan pemilik..."
                style={{ width: '100%', fontSize: '0.88rem', marginBottom: '1rem', resize: 'vertical' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setRejectModalReport(null)}
                  disabled={processingId === rejectModalReport.id}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={processingId === rejectModalReport.id}
                >
                  {processingId === rejectModalReport.id ? 'Memproses...' : 'Tolak Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div 
          className="modal-backdrop" 
          onClick={() => setPreviewPhoto(null)} 
          style={{ zIndex: 1300, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img 
              src={previewPhoto} 
              alt="Preview bukti temuan" 
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }} 
            />
            <button
              onClick={() => setPreviewPhoto(null)}
              style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
export default FoundReportsModerationPage;
