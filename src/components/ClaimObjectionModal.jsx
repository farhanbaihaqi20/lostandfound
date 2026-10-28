import React, { useState } from 'react';
import { X, Send, ShieldAlert } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export const ClaimObjectionModal = ({ item, isOpen, onClose }) => {
  const { user } = useAuth();
  const { submitClaimObjection } = useData();

  const [message, setMessage] = useState('');
  const [contactInfo, setContactInfo] = useState(user?.phone || user?.email || '');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (message.trim().length < 10) {
      alert('Mohon tuliskan penjelasan sanggahan kepemilikan Anda secara detail (minimal 10 karakter).');
      return;
    }

    setSubmitting(true);
    try {
      await submitClaimObjection({
        itemId: item.id,
        message: message.trim(),
        contactInfo: contactInfo.trim()
      });

      alert(
        '✅ Sanggahan Anda Berhasil Dikirim ke Admin Posko!\n\n' +
        'Admin akan meninjau laporan sanggahan ini. Jika terbukti terjadi kekeliruan atau klaim palsu dari pihak sebelumnya, Admin akan membatalkan verifikasi dan membuka kembali pengajuan klaim untuk barang ini.'
      );
      setMessage('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim sanggahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
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
          maxWidth: '520px' 
        }}
      >
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #E2DDD5', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              background: '#FEF3C7', 
              color: '#B45309', 
              borderRadius: '10px', 
              padding: '0.65rem',
              display: 'flex',
              border: '1px solid #FDE68A'
            }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.08em', color: '#B45309', fontWeight: 700, textTransform: 'uppercase' }}>
                POSKO PERLINDUNGAN PEMILIK SAH
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '2px 0 0' }}>
                Sanggahan Verifikasi Kepemilikan
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0', fontFamily: 'var(--font-mono)' }}>
                Barang #{item.item_code} &bull; {item.title}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Info Box */}
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FCD34D',
          borderRadius: '10px',
          padding: '0.9rem',
          fontSize: '0.8rem',
          color: '#78350F',
          marginBottom: '1.15rem',
          lineHeight: 1.5
        }}>
          <strong>⚠️ Merasa barang ini adalah milik Anda yang sah?</strong><br />
          Jika Anda meyakini ada kekeliruan verifikasi oleh Admin atau pihak lain melakukan klaim palsu, silakan kirimkan bukti ciri fisik rahasia atau identitas kepemilikan Anda di bawah ini agar Admin Posko dapat membatalkan status verifikasi sebelumnya.
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>
              Penjelasan &amp; Bukti Sanggahan Kepemilikan Anda:
            </label>
            <textarea
              rows={4}
              required
              placeholder="Jelaskan bukti konkret bahwa barang ini milik Anda (misal: ciri khusus rahasia di dalam barang, tanda unik, isi dompet/tas yang persis, atau nomor seri)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ 
                width: '100%', 
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '0.88rem',
                resize: 'vertical' 
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>
              Kontak WhatsApp / No HP Anda untuk Dihubungi Admin:
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 081234567890 (WhatsApp Aktif)"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
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

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '0.5rem',
            paddingTop: '0.85rem',
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
              disabled={submitting}
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: submitting ? '#94A3B8' : '#D97706',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              <Send size={14} /> {submitting ? 'Mengirim Sanggahan...' : 'Kirim Sanggahan ke Admin'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
