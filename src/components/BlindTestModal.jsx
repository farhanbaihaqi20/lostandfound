import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, HelpCircle, Send, AlertTriangle } from 'lucide-react';
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi: minimal 2 pertanyaan harus dijawab
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

    submitClaim({
      itemId: item.id,
      blindTestAnswers: formattedAnswers,
      message: additionalMessage
    });

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
              background: 'var(--primary-100)', 
              color: 'var(--primary-800)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.5rem',
              display: 'flex'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Verifikasi Blind Test</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Klaim Kepemilikan Barang #{item.item_code}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* SOP Info Box */}
        <div style={{ 
          background: 'var(--info-bg)', 
          border: '1px solid rgba(2, 132, 199, 0.25)', 
          borderRadius: 'var(--radius-md)', 
          padding: '0.75rem', 
          fontSize: '0.8rem', 
          color: 'var(--info)',
          marginBottom: '1rem',
          lineHeight: 1.4
        }}>
          <strong>🛡️ SOP Keamanan UNNES:</strong> Untuk mencegah klaim palsu, Anda wajib menjawab pertanyaan di bawah ini. Jawaban Anda akan langsung dicocokkan oleh <strong>Admin Posko UNNES</strong> dengan data rahasia penemu.
        </div>

        {/* Notifikasi Pengajuan Ulang */}
        {isReapplication && (
          <div style={{
            background: 'var(--amber-50)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 'var(--radius-md)',
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
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            fontSize: '0.8rem',
            color: 'var(--danger)',
            marginBottom: '1rem',
            lineHeight: 1.45
          }}>
            ⚠️ <strong>Laporan Kasus Ditutup:</strong> Barang ini telah berhasil dikembalikan kepada pemilik sah yang terverifikasi dan tidak dapat diklaim lagi.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {questions.map((q, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Pertanyaan {idx + 1}: {q}
              </label>
              <textarea
                rows={2}
                required={idx === 0}
                disabled={isItemReturned}
                placeholder="Tuliskan jawaban sedetail mungkin..."
                value={answers[idx]}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Pesan Tambahan untuk Penemu & Admin (Opsional):
            </label>
            <input
              type="text"
              disabled={isItemReturned}
              placeholder="Contoh: Saya bisa temui di pos satpam jam 1 siang..."
              value={additionalMessage}
              onChange={(e) => setAdditionalMessage(e.target.value)}
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
              disabled={submitting || isItemReturned}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.4rem' }}
            >
              <Send size={14} /> {submitting ? 'Mengirim...' : isReapplication ? 'Kirim Pembaruan Klaim ke Admin' : 'Kirim Klaim ke Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
