import React, { useState } from 'react';
import { X, FileCheck, CheckCircle2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export const BASTModal = ({ match, isOpen, onClose, onSuccess }) => {
  const { completeHandover } = useData();
  const { user } = useAuth();

  const [signerName, setSignerName] = useState(user?.full_name || '');
  const [signerNIM, setSignerNIM] = useState(user?.nim || '');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !match) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) {
      alert('Mohon centang persetujuan Berita Acara Serah Terima (BAST) terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    completeHandover(match.id);
    setSubmitting(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ 
              background: 'var(--teal-100)', 
              color: 'var(--teal-700)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.5rem',
              display: 'flex'
            }}>
              <FileCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Berita Acara Serah Terima (BAST)</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Konfirmasi Resmi Pengembalian #{match.item_code}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Legal Statement */}
        <div style={{ 
          background: 'var(--bg-surface-alt)', 
          border: '1px solid var(--border-light)', 
          borderRadius: 'var(--radius-md)', 
          padding: '1rem', 
          fontSize: '0.85rem', 
          lineHeight: 1.6,
          color: 'var(--text-primary)',
          marginBottom: '1rem'
        }}>
          <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
            Pernyataan Resmi Serah Terima Barang:
          </p>
          <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            "Saya yang bertanda tangan di bawah ini menyatakan bahwa barang <strong>#{match.item_code} ({match.item_title})</strong> telah diterima kembali secara langsung dalam kondisi baik dan lengkap. Dengan ini saya membebaskan pihak pengelola UNNES Lost & Found dan penemu dari segala tuntutan atau sengketa di kemudian hari."
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nama Penerima:</label>
              <input
                type="text"
                required
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>NIM Mahasiswa:</label>
              <input
                type="text"
                required
                placeholder="410142..."
                value={signerNIM}
                onChange={(e) => setSignerNIM(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <label style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '0.6rem', 
            fontSize: '0.825rem',
            cursor: 'pointer',
            padding: '0.5rem',
            background: 'var(--teal-50)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--teal-500)'
          }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: '3px' }}
            />
            <span style={{ color: 'var(--teal-800)', fontWeight: 500 }}>
              Saya menyatakan data di atas benar dan barang telah sah saya terima kembali.
            </span>
          </label>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '0.75rem', 
            paddingTop: '0.75rem', 
            borderTop: '1px solid var(--border-light)' 
          }}>
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button 
              type="submit" 
              disabled={submitting || !agreed}
              className="btn btn-teal btn-sm"
              style={{ gap: '0.4rem' }}
            >
              <CheckCircle2 size={16} /> {submitting ? 'Menyimpan...' : 'Tanda Tangani BAST'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
