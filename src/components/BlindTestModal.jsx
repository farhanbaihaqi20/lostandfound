import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, Send } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export const BlindTestModal = ({ item, isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { submitClaim, claims } = useData();
  const { user } = useAuth();

  const existingClaim = claims?.find(c => 
    c.item_id === item?.id && (
      (user?.id && c.claimer_id === user.id) || 
      (user?.email && c.claimer_email?.toLowerCase() === user.email?.toLowerCase())
    )
  );
  const isReapplication = existingClaim?.status === 'ditolak';
  const isItemReturned = item?.item_status === 'dikembalikan';

  const questions = item?.blind_test_questions?.length > 0
    ? item.blind_test_questions
    : [
        'Sebutkan ciri khas tersembunyi (misal: stiker khusus, goresan, warna bagian dalam)?',
        'Sebutkan estimasi isi detail di dalamnya (nominal uang pecahan, kartu identitas, aksesoris)?',
        'Jika berupa gadget/kunci: sebutkan passcode/wallpaper atau tipe gantungan unik?'
      ];

  const [answers, setAnswers] = useState(questions.map(() => ''));
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !item) return null;
  if (!user) {
    onClose();
    navigate('/masuk');
    return null;
  }

  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi: minimal 1 pertanyaan harus dijawab dengan detail
    const answeredCount = answers.filter(a => a.trim().length > 3).length;
    if (answeredCount < 1) {
      alert('Mohon jawab minimal 1-2 pertanyaan blind test dengan detail untuk membuktikan kepemilikan Anda.');
      return;
    }

    setSubmitting(true);

    const formattedAnswers = questions.map((q, idx) => ({
      question: q,
      answer: answers[idx] || '(Tidak dijawab)'
    }));

    try {
      const res = await submitClaim({
        itemId: item.id,
        blindTestAnswers: formattedAnswers,
        message: additionalMessage
      });

      if (res?.error) {
        alert(res.error);
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Gagal mengajukan klaim:', err);
      alert('Terjadi kesalahan saat mengajukan klaim. Silakan coba lagi.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ backdropFilter: 'blur(5px)', backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          padding: '1.75rem', 
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 20px 45px rgba(44, 30, 20, 0.16)',
          maxWidth: '580px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              background: '#EEF2FF', 
              color: 'var(--primary-indigo)', 
              borderRadius: '10px', 
              padding: '0.6rem',
              display: 'flex',
              border: '1px solid #C7D2FE'
            }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
                Verifikasi Blind-Test
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-500)', margin: '2px 0 0', fontFamily: 'var(--font-mono)' }}>
                KLAIM KEPEMILIKAN #{item.item_code || 'LF-UNNES'} &bull; POSKO RESMI
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              color: 'var(--ink-400)', 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* SOP Info Box */}
        <div style={{ 
          background: '#FAF7F2', 
          border: '1px solid #E2DDD5', 
          borderLeft: '4px solid var(--primary-indigo)',
          borderRadius: '8px', 
          padding: '0.85rem 1rem', 
          fontSize: '0.825rem', 
          color: 'var(--ink-700)',
          marginBottom: '1.25rem',
          lineHeight: 1.5
        }}>
          <strong>🛡️ SOP Verifikasi UNNES:</strong> Untuk mencegah klaim asal ambil, jawab pertanyaan verifikasi di bawah ini. Jawaban Anda akan langsung dicocokkan oleh <strong>Petugas Posko UNNES</strong> secara rahasia.
        </div>

        {/* Notifikasi Pengajuan Ulang */}
        {isReapplication && (
          <div style={{
            background: 'var(--amber-50)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.8rem',
            color: 'var(--amber-800)',
            marginBottom: '1rem',
            lineHeight: 1.45
          }}>
            <strong>🔄 Pengajuan Ulang Klaim Blind Test:</strong><br/>
            Klaim Anda sebelumnya belum disetujui {existingClaim?.admin_notes ? `(Catatan Admin: "${existingClaim.admin_notes}")` : ''}. Silakan lengkapi jawaban di bawah ini dengan ciri fisik tersembunyi sedetail mungkin agar Admin Posko dapat mencocokkannya dengan akurat.
          </div>
        )}

        {/* Notifikasi Jika Barang Sudah Dikembalikan */}
        {isItemReturned && (
          <div style={{
            background: 'var(--danger-50)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.8rem',
            color: 'var(--danger)',
            marginBottom: '1rem',
            lineHeight: 1.45
          }}>
            ⚠️ <strong>Laporan Kasus Ditutup:</strong> Barang ini telah berhasil dikembalikan kepada pemilik sah yang terverifikasi dan tidak dapat diklaim lagi.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {questions.map((q, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.45rem',
              backgroundColor: '#FAF7F2',
              border: '1px solid #E2DDD5',
              padding: '0.85rem 1rem',
              borderRadius: '8px'
            }}>
              <label style={{ fontSize: '0.835rem', fontWeight: 600, color: 'var(--ink-900)' }}>
                Pertanyaan {idx + 1}: {q}
              </label>
              <textarea
                rows={2}
                required={idx === 0}
                disabled={isItemReturned}
                placeholder="Tuliskan jawaban sedetail mungkin..."
                value={answers[idx]}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                style={{ 
                  width: '100%', 
                  resize: 'vertical',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                  color: 'var(--ink-900)'
                }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.835rem', fontWeight: 600, color: 'var(--ink-800)' }}>
              Pesan Tambahan untuk Penemu &amp; Admin (Opsional):
            </label>
            <input
              type="text"
              disabled={isItemReturned}
              placeholder="Contoh: Saya bisa temui di pos satpam jam 1 siang..."
              value={additionalMessage}
              onChange={(e) => setAdditionalMessage(e.target.value)}
              style={{ 
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                color: 'var(--ink-900)'
              }}
            />
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '0.75rem', 
            marginTop: '0.5rem',
            paddingTop: '0.85rem', 
            borderTop: '1px solid var(--border-color)'
          }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#FFFFFF',
                color: 'var(--ink-700)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={submitting || isItemReturned}
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '8px 18px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--primary-indigo)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338CA'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-indigo)'}
            >
              <Send size={14} /> {submitting ? 'Mengirim...' : isReapplication ? 'Kirim Pembaruan Klaim' : 'Kirim Klaim ke Posko'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
