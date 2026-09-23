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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem', maxWidth: '520px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ 
              background: 'var(--amber-100)', 
              color: 'var(--amber-800)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.5rem',
              display: 'flex'
            }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Sanggahan Verifikasi Kepemilikan</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Laporan Barang #{item.item_code} - {item.title}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Info Box */}
        <div style={{
          background: 'var(--amber-50)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '0.8rem',
          fontSize: '0.8rem',
          color: 'var(--amber-900)',
          marginBottom: '1rem',
          lineHeight: 1.45
        }}>
          <strong>⚠️ Merasa barang ini adalah milik Anda yang sah?</strong><br />
          Jika Anda meyakini ada kekeliruan verifikasi oleh Admin atau pihak lain melakukan klaim palsu, silakan kirimkan bukti ciri fisik rahasia atau identitas kepemilikan Anda di bawah ini agar Admin Posko dapat membatalkan status verifikasi sebelumnya.
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Penjelasan & Bukti Sanggahan Kepemilikan Anda:
            </label>
            <textarea
              rows={4}
              required
              placeholder="Jelaskan bukti konkret bahwa barang ini milik Anda (misal: ciri khusus rahasia di dalam barang, tanda unik, isi dompet/tas yang persis, atau nomor seri)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Kontak WhatsApp / No HP Anda untuk Dihubungi Admin:
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 081234567890 (WhatsApp Aktif)"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '0.5rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-light)'
          }}>
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-accent btn-sm"
              style={{ gap: '0.4rem' }}
            >
              <Send size={14} /> {submitting ? 'Mengirim Sanggahan...' : 'Kirim Sanggahan ke Admin'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
