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
    <div className="modal-backdrop" onClick={onClose} style={{ backdropFilter: 'blur(4px)', background: 'rgba(15, 23, 42, 0.45)' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          background: '#FAF7F2', 
          border: '1px solid #E2DDD5',
          borderRadius: '16px',
          boxShadow: '0 20px 45px rgba(44, 30, 20, 0.15)',
          padding: '1.75rem',
          maxWidth: '560px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #E2DDD5', paddingBottom: '0.85rem' }}>
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
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.08em', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>
                DOKUMEN RESMI UNNES LOST &amp; FOUND
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: '2px 0 0' }}>
                Berita Acara Serah Terima (BAST)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0', fontFamily: 'var(--font-mono)' }}>
                Kode Pengesahan: #{match.item_code}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Legal Statement (Parchment Card) */}
        <div style={{ 
          background: '#F5EFEB', 
          border: '1px solid #D8CEBE', 
          borderRadius: '10px', 
          padding: '1.15rem', 
          fontSize: '0.85rem', 
          lineHeight: 1.6,
          color: '#334155',
          marginBottom: '1.25rem'
        }}>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>📜</span> Pernyataan Resmi Serah Terima Barang:
          </p>
          <p style={{ fontStyle: 'italic', color: '#475569', margin: 0 }}>
            "Saya yang bertanda tangan di bawah ini menyatakan bahwa barang <strong>#{match.item_code} ({match.item_title})</strong> telah diterima kembali secara langsung dalam kondisi baik dan lengkap. Dengan ini saya membebaskan pihak pengelola UNNES Lost &amp; Found dan penemu dari segala tuntutan atau sengketa di kemudian hari."
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Nama Lengkap Penerima:</label>
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
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>NIM Mahasiswa:</label>
              <input
                type="text"
                required
                placeholder="410142..."
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
              Saya menyatakan data di atas benar dan barang telah sah saya terima kembali dari posko/penemu.
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
              <CheckCircle2 size={16} /> {submitting ? 'Menyimpan Dokumen...' : 'Tanda Tangani BAST'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
