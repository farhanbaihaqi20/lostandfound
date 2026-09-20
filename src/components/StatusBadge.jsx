import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Sparkles, Award } from 'lucide-react';

export const StatusBadge = ({ type, status, postStatus, bounty }) => {
  return (
    <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Tipe Barang: Hilang / Temuan */}
      {type === 'hilang' && (
        <span className="badge badge-lost">
          <AlertCircle size={12} /> Barang Hilang
        </span>
      )}
      {type === 'temuan' && (
        <span className="badge badge-found">
          <Sparkles size={12} /> Ditemukan
        </span>
      )}

      {/* Post Status Review */}
      {postStatus === 'menunggu_review' && (
        <span className="badge badge-review">
          <Clock size={12} /> Menunggu Review Admin
        </span>
      )}
      {postStatus === 'ditolak' && (
        <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>
          <XCircle size={12} /> Ditolak Admin
        </span>
      )}

      {/* Item Progress Status */}
      {status === 'cocok' && (
        <span className="badge" style={{ background: '#dbeafe', color: '#1e40af' }}>
          <CheckCircle2 size={12} /> Terverifikasi / Match
        </span>
      )}
      {status === 'dikembalikan' && (
        <span className="badge" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #10b981' }}>
          <CheckCircle2 size={12} /> Sudah Kembali
        </span>
      )}

      {/* Bounty Badge */}
      {bounty > 0 && (
        <span className="badge badge-bounty" title="Pemilik menyediakan imbalan bagi yang menemukan">
          <Award size={12} /> Hadiah Rp {bounty.toLocaleString('id-ID')}
        </span>
      )}
    </div>
  );
};
