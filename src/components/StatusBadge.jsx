import React from 'react';
import { AlertCircle, Sparkles, CheckCircle2, Clock, XCircle, Award } from 'lucide-react';

export const StatusBadge = ({ type, status, postStatus, bounty }) => {
  return (
    <div style={{ display: 'inline-flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Tipe Barang: Hilang / Temuan */}
      {type === 'hilang' && (
        <span className="badge badge-lost">
          <AlertCircle size={11} strokeWidth={2.5} /> BARANG HILANG
        </span>
      )}
      {type === 'temuan' && (
        <span className="badge badge-found">
          <Sparkles size={11} strokeWidth={2.5} /> DITEMUKAN
        </span>
      )}

      {/* Post Status Review */}
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

      {/* Item Progress Status */}
      {status === 'diproses' && (
        <span className="badge badge-verified">
          <CheckCircle2 size={11} strokeWidth={2.5} /> PROSES VERIFIKASI
        </span>
      )}
      {status === 'cocok' && (
        <span className="badge badge-verified">
          <CheckCircle2 size={11} strokeWidth={2.5} /> TERVERIFIKASI
        </span>
      )}
      {status === 'dikembalikan' && (
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
          <CheckCircle2 size={11} strokeWidth={2.5} /> SELESAI / KEMBALI
        </span>
      )}

      {/* Bounty Badge */}
      {bounty > 0 && (
        <span className="badge badge-bounty" title="Pemilik menyediakan imbalan bagi yang menemukan">
          <Award size={11} strokeWidth={2.5} /> HADIAH RP {bounty.toLocaleString('id-ID')}
        </span>
      )}
    </div>
  );
};

