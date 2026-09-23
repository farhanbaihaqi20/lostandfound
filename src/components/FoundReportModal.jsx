import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Send, MapPin, AlertCircle, Phone, Info } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ImageUploadCompressor } from './ImageUploadCompressor';

export const FoundReportModal = ({ item, isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { submitFoundReport } = useData();
  const { user } = useAuth();

  const [description, setDescription] = useState('');
  const [foundLocation, setFoundLocation] = useState('');
  const [photos, setPhotos] = useState([]);
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  if (!isOpen || !item) return null;

  if (!user) {
    onClose();
    navigate('/masuk');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage('Mohon berikan deskripsi ciri barang minimal 10 karakter.');
      return;
    }

    if (!foundLocation.trim()) {
      setErrorMessage('Mohon cantumkan lokasi di mana barang tersebut Anda temukan.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await submitFoundReport({
        itemId: item.id,
        description: description.trim(),
        foundLocation: foundLocation.trim(),
        photoUrls: photos,
        reporterPhone: phone.trim()
      });

      if (res?.error) {
        setErrorMessage(res.error);
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Gagal mengirim laporan temuan:', err);
      setErrorMessage('Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          padding: '1.5rem', 
          maxWidth: '560px', 
          width: '90%', 
          maxHeight: '90vh', 
          overflowY: 'auto' 
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              background: 'var(--teal-100, #ccfbf1)', 
              color: 'var(--teal-800, #115e59)', 
              borderRadius: 'var(--radius-md, 8px)', 
              padding: '0.6rem',
              display: 'flex'
            }}>
              <Search size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Saya Menemukan Barang Ini!
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Bantu pemilik dengan memberikan informasi ciri & lokasi temuan
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-ghost" 
            style={{ padding: '0.4rem', borderRadius: '50%' }}
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Item Preview Card */}
        <div style={{
          background: 'var(--bg-secondary, #f8fafc)',
          borderRadius: 'var(--radius-md, 8px)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          border: '1px solid var(--border-light, #e2e8f0)'
        }}>
          {item.photo_urls?.[0] ? (
            <img 
              src={item.photo_urls[0]} 
              alt={item.title} 
              style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '6px', 
              background: 'var(--border-light, #e2e8f0)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              📦
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              color: 'var(--primary-600, #2563eb)',
              textTransform: 'uppercase'
            }}>
              #{item.item_code}
            </span>
            <div style={{ 
              fontWeight: 600, 
              fontSize: '0.95rem', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              color: 'var(--text-primary)'
            }}>
              {item.title}
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: 'var(--radius-md, 8px)',
          padding: '0.85rem',
          marginBottom: '1.25rem',
          display: 'flex',
          gap: '0.6rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}>
          <Info size={18} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Penting:</strong> Laporan Anda akan diperiksa oleh <strong>Admin</strong> terlebih dahulu. Setelah disetujui, ruang obrolan (chat) langsung dengan pemilik barang akan otomatis terbuka.
          </div>
        </div>

        {errorMessage && (
          <div style={{
            background: 'var(--danger-50, #fef2f2)',
            border: '1px solid var(--danger-200, #fecaca)',
            color: 'var(--danger-700, #b91c1c)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md, 8px)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Deskripsi Ciri Fisik */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Ciri-Ciri Fisik Barang yang Ditemukan <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              required
              rows={3}
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Dompet cokelat dengan gantungan kunci hitam, ada logo di sudut kanan, isi kartu identitas sesuai..."
              style={{ width: '100%', fontSize: '0.88rem', resize: 'vertical' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Jelaskan tanda pengenal, kondisi, warna detail, atau isi untuk validasi admin.
            </span>
          </div>

          {/* Lokasi Ditemukan */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Lokasi Ditemukan <span style={{ color: 'red' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                className="form-input"
                value={foundLocation}
                onChange={(e) => setFoundLocation(e.target.value)}
                placeholder="Contoh: Gedung C6 FMIPA Lt. 2, dekat tangga darurat"
                style={{ width: '100%', paddingLeft: '2.4rem', fontSize: '0.88rem' }}
              />
              <MapPin size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Upload Foto Bukti */}
          <div>
            <ImageUploadCompressor
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={3}
              label="Foto Bukti Temuan (Opsional tapi disarankan)"
            />
          </div>

          {/* Nomor Telepon / WA */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Nomor WhatsApp / Kontak (Opsional)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                style={{ width: '100%', paddingLeft: '2.4rem', fontSize: '0.88rem' }}
              />
              <Phone size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Memudahkan Admin atau Pemilik untuk koordinasi jika obrolan web offline.
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light, #e2e8f0)' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '140px', justifyContent: 'center' }}
            >
              {submitting ? (
                <>Mengirim...</>
              ) : (
                <>
                  <Send size={16} />
                  Kirim Laporan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default FoundReportModal;
