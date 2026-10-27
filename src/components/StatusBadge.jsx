import React from 'react';
import { AlertCircle, PackageCheck, CheckCircle2, Clock, XCircle, Award } from 'lucide-react';

// Satu label utama per barang: kalau sudah kembali, itu yang paling penting
// dan label tipe/progres lain tidak ditumpuk lagi di atas foto.
export const StatusBadge = ({ type, status, postStatus, bounty, label }) => {
  const isReturned = status === 'dikembalikan';

  // Mode label bebas: dipakai tabel Dashboard & header Pesan yang dulu
  // mengoper teks lewat prop status sehingga badgenya tidak pernah tampil.
  if (label) {
    const cls = label.includes('HILANG')
      ? 'badge badge-lost'
      : label.includes('TEMUAN') || label.includes('DITEMUKAN')
        ? 'badge badge-found'
        : label.includes('MENUNGGU')
          ? 'badge badge-review'
          : label.includes('SELESAI') || label.includes('KEMBALI')
            ? 'badge badge-verified'
            : 'badge badge-returned';
    return <span className={cls}>{label}</span>;
  }

  return (
    <div style={{ display: 'inline-flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Label utama */}
      {isReturned ? (
        <span className="badge" style={{
          background: '#ECFDF5',
          color: '#059669',
          border: '1px solid #6EE7B7',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          letterSpacing: '0.04em',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          <CheckCircle2 size={11} strokeWidth={2.5} /> SUDAH KEMBALI
        </span>
      ) : type === 'hilang' ? (
        <span className="badge badge-lost">
          <AlertCircle size={11} strokeWidth={2.5} /> BARANG HILANG
        </span>
      ) : type === 'temuan' ? (
        <span className="badge badge-found">
          <PackageCheck size={11} strokeWidth={2.5} /> DITEMUKAN
        </span>
      ) : null}

      {/* Label progres, hanya satu dan tidak tampil kalau sudah kembali */}
      {!isReturned && status === 'diproses' && (
        <span className="badge badge-verified">
          <Clock size={11} strokeWidth={2.5} /> PROSES VERIFIKASI
        </span>
      )}
      {!isReturned && status === 'cocok' && (
        <span className="badge badge-verified">
          <CheckCircle2 size={11} strokeWidth={2.5} /> TERVERIFIKASI
        </span>
      )}

      {/* Status review postingan (konteks pemilik/admin) */}
      {postStatus === 'menunggu_review' && (
        <span className="badge" style={{
          background: '#FFFBEB',
          color: '#B45309',
          border: '1px solid #FDE68A',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          letterSpacing: '0.04em',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          <Clock size={11} /> MENUNGGU REVIEW
        </span>
      )}
      {postStatus === 'ditolak' && (
        <span className="badge" style={{
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FCA5A5',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          letterSpacing: '0.04em',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          <XCircle size={11} /> DITOLAK
        </span>
      )}

      {/* Hadiah */}
      {bounty > 0 && (
        <span className="badge badge-bounty" title="Pemilik menyediakan imbalan bagi yang menemukan">
          <Award size={11} strokeWidth={2.5} /> HADIAH RP {bounty.toLocaleString('id-ID')}
        </span>
      )}
    </div>
  );
};
