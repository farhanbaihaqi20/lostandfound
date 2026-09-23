import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Check, 
  X, 
  AlertCircle, 
  ArrowLeft, 
  HelpCircle, 
  Lock, 
  User, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { AdminNavTabs } from '../../components/AdminNavTabs';

export const ClaimModerationPage = () => {
  const { claims, items, verifyClaim, revokeClaimVerification } = useData();

  const [activeFilter, setActiveFilter] = useState('menunggu_admin');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const filteredClaims = claims.filter(c => {
    if (activeFilter === 'semua') return true;
    return c.status === activeFilter;
  });

  const handleVerify = async (claim, isApproved) => {
    if (isApproved) {
      const confirmAcc = window.confirm(
        `ACC & VALIDASI KEPEMILIKAN:\n\n` +
        `Apakah Anda yakin menyetujui klaim dari "${claim.claimer_name}" sebagai pemilik sah barang #${claim.item_code}?\n\n` +
        `• Status klaim akan disetujui dan verifikasi Blind Test dinyatakan valid.\n` +
        `• Akses Pesan Jasa Runner UNNES & Ruang Obrolan akan DIBUKA untuk pemohon.\n` +
        `• Pemohon dapat langsung berkoordinasi dengan penemu atau memesan runner untuk mengambil barang.`
      );
      if (!confirmAcc) return;
    }

    setProcessingId(claim.id);
    try {
      await verifyClaim(claim.id, isApproved, adminNotes);
      alert(isApproved 
        ? 'Klaim berhasil di-ACC! Pemohon kini terverifikasi sebagai pemilik sah dan dapat memesan Jasa Runner atau menghubungi penemu di ruang obrolan.' 
        : 'Klaim DITOLAK. Pemohon diberikan kesempatan mengajukan klaim ulang jika terdapat detail yang belum sempat dijelaskan.'
      );
      setSelectedClaim(null);
      setAdminNotes('');
    } catch (err) {
      console.error('Error saat verifikasi klaim:', err);
      alert('Terjadi kesalahan saat memproses verifikasi klaim.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevoke = async (claim) => {
    const reason = window.prompt(
      `⚠️ PEMBATALAN VERIFIKASI KLAIM (KLAIM PALSU / SALAH VERIFIKASI):\n\n` +
      `Apakah Anda yakin ingin MEMBATALKAN status verifikasi untuk "${claim.claimer_name}" pada barang #${claim.item_code}?\n\n` +
      `Efek Pembatalan:\n` +
      `• Pengguna "${claim.claimer_name}" AKAN DIBLOKIR PERMANEN dari mengajukan klaim kembali untuk barang ini.\n` +
      `• Status barang akan dikembalikan menjadi "Terbuka".\n` +
      `• Publik / mahasiswa lain dapat mengajukan klaim Blind Test kembali.\n` +
      `• Match/chat serah terima dinonaktifkan.\n\n` +
      `Tuliskan alasan pembatalan verifikasi (misal: "Terbukti bukan pemilik sah / terdapat sanggahan valid"):`,
      'Terindikasi klaim palsu / tidak sesuai bukti fisik asli'
    );

    if (reason === null) return;

    setProcessingId(claim.id);
    try {
      await revokeClaimVerification(claim.id, reason.trim());
      alert('Verifikasi klaim berhasil dibatalkan! Status barang kembali terbuka untuk klaim publik, dan pemohon ini telah diblokir dari mengajukan ulang.');
      setSelectedClaim(null);
    } catch (err) {
      console.error(err);
      alert('Gagal membatalkan verifikasi klaim.');
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
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Verifikasi Klaim Blind Test</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Cocokkan jawaban pemohon dengan data rahasia pelapor sebelum membuka kontak.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveFilter('menunggu_admin')}
            className={`btn btn-sm ${activeFilter === 'menunggu_admin' ? 'btn-accent' : 'btn-outline'}`}
          >
            Menunggu ({claims.filter(c => c.status === 'menunggu_admin').length})
          </button>
          <button
            onClick={() => setActiveFilter('disetujui')}
            className={`btn btn-sm ${activeFilter === 'disetujui' ? 'btn-primary' : 'btn-outline'}`}
          >
            Disetujui ({claims.filter(c => c.status === 'disetujui').length})
          </button>
          <button
            onClick={() => setActiveFilter('ditolak')}
            className={`btn btn-sm ${activeFilter === 'ditolak' ? 'btn-primary' : 'btn-outline'}`}
          >
            Ditolak ({claims.filter(c => c.status === 'ditolak').length})
          </button>
          <button
            onClick={() => setActiveFilter('dibatalkan')}
            className={`btn btn-sm ${activeFilter === 'dibatalkan' ? 'btn-danger' : 'btn-outline'}`}
          >
            Dibatalkan ({claims.filter(c => c.status === 'dibatalkan').length})
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredClaims.length === 0 ? (
          <div className="glass-card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShieldCheck size={40} color="var(--teal-600)" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontWeight: 600 }}>Tidak ada klaim dalam antrean ini.</p>
          </div>
        ) : (
          filteredClaims.map(claim => {
            const targetItem = items.find(i => i.id === claim.item_id);

            return (
              <div 
                key={claim.id} 
                className="glass-card"
                style={{ padding: '1.25rem', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                        #{claim.item_code}
                      </span>
                      <span className="badge badge-review" style={{ fontSize: '0.65rem' }}>
                        {claim.status.replace('_', ' ')}
                      </span>
                      <span className="badge badge-found" style={{ fontSize: '0.65rem' }}>
                        Skor Otomatis: {claim.blind_test_score}%
                      </span>
                      {claims.filter(c => c.item_id === claim.item_id).length > 1 && (
                        <span className="badge" style={{ fontSize: '0.65rem', background: 'var(--primary-100)', color: 'var(--primary-800)' }}>
                          👥 Total {claims.filter(c => c.item_id === claim.item_id).length} Pengajuan untuk Barang Ini
                        </span>
                      )}
                      {claim.is_reapplication && (
                        <span className="badge" style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#b45309', border: '1px solid #f59e0b' }}>
                          🔄 Pengajuan Ulang (Penjelasan Baru)
                        </span>
                      )}
                    </div>

                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem' }}>
                      {claim.item_title}
                    </h2>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Pemohon Klaim: <strong>{claim.claimer_name}</strong> ({claim.claimer_email}) • Telp: {claim.claimer_phone}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedClaim(selectedClaim?.id === claim.id ? null : claim)}
                    className="btn btn-outline btn-sm"
                  >
                    {selectedClaim?.id === claim.id ? 'Tutup Perbandingan' : 'Bandingkan Jawaban Blind Test'}
                  </button>
                </div>

                {/* SIDE-BY-SIDE COMPARISON ACCORDION */}
                {selectedClaim?.id === claim.id && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '1.25rem',
                    background: 'var(--bg-surface-alt)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    border: '1px solid var(--border-light)'
                  }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      
                      {/* Left: Claimer's Answers */}
                      <div style={{
                        padding: '1rem',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)'
                      }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <User size={16} /> Jawaban Pemohon ({claim.claimer_name})
                        </div>

                        {claim.blind_test_answers && claim.blind_test_answers.map((ans, idx) => (
                          <div key={idx} style={{ marginBottom: '0.75rem', fontSize: '0.825rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                              Q{idx + 1}: {ans.question}
                            </div>
                            <div style={{ 
                              background: 'var(--primary-50)', 
                              padding: '0.4rem 0.6rem', 
                              borderRadius: 'var(--radius-sm)',
                              marginTop: '0.2rem',
                              fontWeight: 500,
                              color: 'var(--primary-950)'
                            }}>
                              A: {ans.answer}
                            </div>
                          </div>
                        ))}

                        {claim.message && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                            Catatan pemohon: "{claim.message}"
                          </div>
                        )}
                      </div>

                      {/* Right: Original Secret Details from Reporter */}
                      <div style={{
                        padding: '1rem',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(13, 148, 136, 0.3)'
                      }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--teal-700)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Lock size={16} /> Data Rahasia Asli dari Penemu
                        </div>

                        <div style={{ 
                          fontSize: '0.85rem', 
                          background: 'var(--teal-50)', 
                          padding: '0.75rem', 
                          borderRadius: 'var(--radius-sm)', 
                          color: 'var(--teal-900)',
                          lineHeight: 1.5,
                          border: '1px solid var(--teal-500)'
                        }}>
                          {targetItem?.hidden_details || '(Tidak ada data rahasia tersimpan)'}
                        </div>

                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                          Lokasi barang diamankan: <strong>{targetItem?.location_building}</strong> ({targetItem?.location_detail || 'Pos Satpam'})
                        </div>
                      </div>

                    </div>

                    {/* Admin Notes & Actions */}
                    {claim.status === 'menunggu_admin' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                        <input
                          type="text"
                          placeholder="Catatan verifikasi Admin (opsional)..."
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          style={{ width: '100%', fontSize: '0.85rem' }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleVerify(claim, false)}
                            disabled={processingId === claim.id}
                            className="btn btn-danger btn-sm"
                            style={{ gap: '0.35rem' }}
                            title="Tolak klaim (pemohon dapat mengajukan klaim ulang jika memiliki rincian tambahan)"
                          >
                            <X size={15} /> {processingId === claim.id ? 'Memproses...' : 'Tolak Klaim'}
                          </button>
                          <button
                            onClick={() => handleVerify(claim, true)}
                            disabled={processingId === claim.id}
                            className="btn btn-teal btn-sm"
                            style={{ gap: '0.35rem' }}
                            title="ACC klaim ini sebagai pemilik sah paling cocok & buka akses runner/chat serah terima"
                          >
                            <Check size={15} /> {processingId === claim.id ? 'Memproses...' : 'ACC Pemilik Sah (Buka Akses Runner & Chat)'}
                          </button>
                        </div>
                      </div>
                    )}

                    {claim.status === 'disetujui' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--teal-700)' }}>
                          ✅ <strong>Klaim Disetujui:</strong> Pemohon terverifikasi sebagai pemilik sah dan dapat memesan runner / obrolan serah terima.
                        </div>
                        <button
                          onClick={() => handleRevoke(claim)}
                          disabled={processingId === claim.id}
                          className="btn btn-danger btn-sm"
                          style={{ gap: '0.35rem' }}
                          title="Batalkan verifikasi jika klaim ternyata salah atau terindikasi klaim palsu"
                        >
                          <AlertCircle size={15} /> {processingId === claim.id ? 'Memproses...' : 'Batalkan Verifikasi (Klaim Palsu / Salah)'}
                        </button>
                      </div>
                    )}

                    {claim.status === 'dibatalkan' && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: 'var(--danger-bg)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.825rem',
                        color: 'var(--danger)',
                        lineHeight: 1.45,
                        marginTop: '0.5rem'
                      }}>
                        <strong>⛔ Verifikasi Klaim Dibatalkan oleh Admin:</strong><br />
                        Alasan: "{claim.admin_notes || 'Terindikasi klaim palsu'}".<br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Pengguna ini telah diblokir permanen dari klaim ulang barang #{claim.item_code} dan status barang telah dibuka kembali untuk publik.
                        </span>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
