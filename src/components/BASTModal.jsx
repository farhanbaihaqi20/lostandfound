import React, { useState } from 'react';
import { X, FileCheck, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export const BASTModal = ({ match, isOpen, onClose, onSuccess }) => {
  const { signBAST } = useData();
  const { user } = useAuth();

  if (!isOpen || !match) return null;

  const normUser = (user?.full_name || '').trim().toLowerCase();
  const normOwner = (match.owner_name || '').trim().toLowerCase();
  const normFinder = (match.finder_name || '').trim().toLowerCase();

  const isOwner = (user?.id && user.id === match.owner_id) || (normUser && normOwner && (normOwner.includes(normUser) || normUser.includes(normOwner)));
  const isFinder = (user?.id && user.id === match.finder_id) || (normUser && normFinder && (normFinder.includes(normUser) || normUser.includes(normFinder)));
  const isAdmin = user?.role === 'admin' && !isOwner && !isFinder;

  const currentRole = isOwner ? 'owner' : (isFinder ? 'finder' : 'admin');

  const isOwnerSigned = Boolean(match.owner_signed_at);
  const isFinderSigned = Boolean(match.finder_signed_at);
  const isAdminSigned = Boolean(match.admin_signed_at);
  const isCompleted = match.status === 'selesai' || (isOwnerSigned && isFinderSigned) || isAdminSigned;

  const hasCurrentPartySigned = 
    (isOwner && isOwnerSigned) ||
    (isFinder && isFinderSigned) ||
    (isAdmin && isAdminSigned);

  const [signerName, setSignerName] = useState(
    user?.full_name || (isOwner ? match.owner_name : (isFinder ? match.finder_name : ''))
  );
  const [signerNIM, setSignerNIM] = useState(user?.nim || '');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSignerName(user?.full_name || (isOwner ? match.owner_name : (isFinder ? match.finder_name : '')));
      setSignerNIM(user?.nim || '');
      setAgreed(false);
    }
  }, [isOpen, match?.id, user?.id, isOwner, isFinder]);

  // Pernyataan khusus yang berbeda antara Pemilik vs Penemu vs Admin
  let docBadge = 'SURAT PENERIMAAN BARANG (PEMILIK SAH)';
  let statementHeading = 'Pernyataan Resmi Penerimaan Barang (Pemilik):';
  let statementQuote = `"Saya yang bertanda tangan di bawah ini menyatakan bahwa barang #${match.item_code} (${match.item_title}) telah saya terima kembali secara langsung dari penemu/posko dalam kondisi baik dan lengkap. Dengan ini saya membebaskan pihak pengelola UNNES Lost & Found dan penemu dari segala tuntutan atau sengketa di kemudian hari."`;
  let nameLabel = 'Nama Lengkap Pemilik (Penerima):';
  let nimLabel = 'NIM Mahasiswa Pemilik:';
  let checkboxText = 'Saya menyatakan data di atas benar dan barang telah sah saya terima kembali dari posko/penemu dalam kondisi baik.';
  let buttonLabel = 'Tanda Tangani BAST sebagai Pemilik';

  if (isFinder) {
    docBadge = 'SURAT PENYERAHAN BARANG (PENEMU)';
    statementHeading = 'Pernyataan Resmi Penyerahan Barang (Penemu):';
    statementQuote = `"Saya yang bertanda tangan di bawah ini menyatakan bahwa barang temuan #${match.item_code} (${match.item_title}) telah saya serahkan kembali secara langsung kepada pemilik yang sah secara sukarela, aman, dan tanpa paksaan. Dengan ini serah terima dinyatakan sah dan selesai."`;
    nameLabel = 'Nama Lengkap Penemu (Penyerah):';
    nimLabel = 'NIM Mahasiswa Penemu:';
    checkboxText = 'Saya menyatakan data di atas benar dan telah menyerahkan barang temuan tersebut kepada pemilik sah secara langsung.';
    buttonLabel = 'Tanda Tangani BAST sebagai Penemu';
  } else if (isAdmin) {
    docBadge = 'PENGESAHAN SERAH TERIMA POSKO (PETUGAS ADMIN)';
    statementHeading = 'Pengesahan Berita Acara Petugas Posko:';
    statementQuote = `"Saya selaku Petugas Posko UNNES Lost & Found mengesahkan bahwa proses verifikasi identitas dan serah terima barang #${match.item_code} (${match.item_title}) antara penemu (${match.finder_name}) dan pemilik (${match.owner_name}) telah dilaksanakan sesuai SOP resmi kampus UNNES."`;
    nameLabel = 'Nama Petugas Posko:';
    nimLabel = 'NIP / NIM Petugas Posko:';
    checkboxText = 'Saya mengesahkan serah terima barang ini secara resmi atas nama Posko UNNES Lost & Found.';
    buttonLabel = 'Sahkan BAST sebagai Admin';
  }

  const formatSignatureTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' +
           d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      alert('Mohon centang persetujuan pernyataan Berita Acara Serah Terima (BAST) terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await signBAST({
        matchId: match.id,
        signerName: signerName.trim(),
        signerNIM: signerNIM.trim(),
        signerRole: currentRole
      });
      setSubmitting(false);

      if (res?.error) {
        alert(res.error);
      } else {
        if (res?.isComplete) {
          alert('Berita Acara Serah Terima (BAST) telah ditandatangani oleh kedua belah pihak! Kasus serah terima resmi selesai dan obrolan ditutup.');
        } else {
          alert('Tanda tangan Anda berhasil direkam! Kasus akan otomatis diselesaikan begitu pihak lawan menandatangani.');
        }
        if (onSuccess) onSuccess(res);
        onClose();
      }
    } catch (err) {
      setSubmitting(false);
      console.error('Error signing BAST:', err);
      alert('Terjadi kesalahan saat memproses tanda tangan BAST.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ backdropFilter: 'blur(4px)', background: 'rgba(15, 23, 42, 0.45)', zIndex: 1200 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          background: '#FAF7F2', 
          border: '1px solid #E2DDD5',
          borderRadius: '16px',
          boxShadow: '0 20px 45px rgba(44, 30, 20, 0.15)',
          padding: '1.75rem',
          maxWidth: '580px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #E2DDD5', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              background: '#ECFDF5', 
              color: '#059669', 
              borderRadius: '10px', 
              padding: '0.65rem',
              display: 'flex',
              border: '1px solid #A7F3D0'
            }}>
              <FileCheck size={26} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>
                {docBadge}
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: '2px 0 0' }}>
                Berita Acara Serah Terima (BAST)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0', fontFamily: 'var(--font-mono)' }}>
                Kode Pengesahan: #{match.item_code} &middot; {match.item_title}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#94A3B8', cursor: 'pointer', padding: '4px', background: 'transparent', border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        {/* Dual Signatures Progress Tracker Card */}
        <div style={{ 
          background: '#FFFFFF', 
          border: '1px solid #E2DDD5', 
          borderRadius: '10px', 
          padding: '0.85rem 1rem', 
          marginBottom: '1rem' 
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Status Penandatanganan (Keduanya Wajib Tanda Tangan)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {/* Pihak 1: Penemu */}
            <div style={{ 
              padding: '0.65rem 0.85rem', 
              borderRadius: '8px', 
              border: isFinderSigned ? '1px solid #A7F3D0' : '1px solid #E2DDD5', 
              background: isFinderSigned ? '#ECFDF5' : '#F8FAFC' 
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Pihak Penemu
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {match.finder_signer_name || match.finder_name}
              </div>
              <div style={{ fontSize: '0.72rem', color: isFinderSigned ? '#059669' : '#D97706', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isFinderSigned ? (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Sudah TTD ({formatSignatureTime(match.finder_signed_at)})</span>
                  </>
                ) : (
                  <>
                    <Clock size={13} />
                    <span>Menunggu Tanda Tangan</span>
                  </>
                )}
              </div>
            </div>

            {/* Pihak 2: Pemilik */}
            <div style={{ 
              padding: '0.65rem 0.85rem', 
              borderRadius: '8px', 
              border: isOwnerSigned ? '1px solid #A7F3D0' : '1px solid #E2DDD5', 
              background: isOwnerSigned ? '#ECFDF5' : '#F8FAFC' 
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Pihak Pemilik
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {match.owner_signer_name || match.owner_name}
              </div>
              <div style={{ fontSize: '0.72rem', color: isOwnerSigned ? '#059669' : '#D97706', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isOwnerSigned ? (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Sudah TTD ({formatSignatureTime(match.owner_signed_at)})</span>
                  </>
                ) : (
                  <>
                    <Clock size={13} />
                    <span>Menunggu Tanda Tangan</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Legal Statement (Parchment Card) */}
        <div style={{ 
          background: '#F5EFEB', 
          border: '1px solid #D8CEBE', 
          borderRadius: '10px', 
          padding: '1.15rem', 
          fontSize: '0.84rem', 
          lineHeight: 1.6,
          color: '#334155',
          marginBottom: '1.25rem'
        }}>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>📜</span> {statementHeading}
          </p>
          <p style={{ fontStyle: 'italic', color: '#475569', margin: 0 }}>
            {statementQuote}
          </p>
        </div>

        {/* Kasus Selesai Banner / Sudah TTD Banner */}
        {isCompleted ? (
          <div style={{
            padding: '1rem',
            background: '#ECFDF5',
            borderRadius: '10px',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            marginBottom: '1.25rem'
          }}>
            <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '2px', color: '#047857' }}>
                Kasus Resmi Selesai!
              </strong>
              Berita Acara Serah Terima (BAST) digital telah ditandatangani sah oleh kedua belah pihak. Dokumen ini menjadi bukti resmi penyerahan barang di Universitas Negeri Semarang.
            </div>
          </div>
        ) : hasCurrentPartySigned ? (
          <div style={{
            padding: '1rem',
            background: '#FEF3C7',
            borderRadius: '10px',
            border: '1px solid #FDE68A',
            color: '#92400E',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            marginBottom: '1.25rem'
          }}>
            <Clock size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '2px', color: '#B45309' }}>
                Tanda Tangan Anda Sudah Terekam!
              </strong>
              Anda telah menandatangani BAST ini. Sesi koordinasi akan otomatis dinyatakan <strong>SELESAI</strong> begitu pihak {isOwner ? 'Penemu' : 'Pemilik'} ikut menandatangani.
            </div>
          </div>
        ) : null}

        {/* Form Tanda Tangan (Hanya muncul jika belum menandatangani dan belum selesai) */}
        {!hasCurrentPartySigned && !isCompleted ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                  {nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  style={{ 
                    width: '100%', 
                    background: '#FFFFFF', 
                    border: '1px solid #CBD5E1', 
                    borderRadius: '8px', 
                    padding: '9px 12px',
                    fontSize: '0.88rem' 
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                  {nimLabel}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 410142..."
                  value={signerNIM}
                  onChange={(e) => setSignerNIM(e.target.value)}
                  style={{ 
                    width: '100%', 
                    background: '#FFFFFF', 
                    border: '1px solid #CBD5E1', 
                    borderRadius: '8px', 
                    padding: '9px 12px',
                    fontSize: '0.88rem' 
                  }}
                />
              </div>
            </div>

            <label style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '0.65rem', 
              fontSize: '0.825rem',
              cursor: 'pointer',
              padding: '0.75rem',
              background: '#ECFDF5',
              borderRadius: '8px',
              border: '1px solid #A7F3D0'
            }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: '3px', accentColor: '#059669', width: '16px', height: '16px' }}
              />
              <span style={{ color: '#065F46', fontWeight: 600, lineHeight: 1.5 }}>
                {checkboxText}
              </span>
            </label>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '0.75rem', 
              paddingTop: '1rem', 
              borderTop: '1px solid #E2DDD5' 
            }}>
              <button 
                type="button" 
                onClick={onClose} 
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={submitting || !agreed}
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: agreed ? '#059669' : '#94A3B8',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: agreed ? 'pointer' : 'not-allowed',
                  transition: 'background 0.15s ease'
                }}
              >
                <CheckCircle2 size={16} /> {submitting ? 'Menyimpan Dokumen...' : buttonLabel}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid #E2DDD5' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.825rem' }}
            >
              Tutup Dokumen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BASTModal;

