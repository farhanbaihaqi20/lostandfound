import React, { useState } from 'react';
import { X, ShieldCheck, HelpCircle, Send, AlertTriangle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export const BlindTestModal = ({ item, isOpen, onClose, onSuccess }) => {
  const { submitClaim } = useData();
  const { user } = useAuth();

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
          marginBottom: '1.25rem',
          lineHeight: 1.4
        }}>
          <strong>🛡️ SOP Keamanan UNNES:</strong> Untuk mencegah klaim palsu, Anda wajib menjawab pertanyaan di bawah ini. Jawaban Anda akan langsung dicocokkan oleh <strong>Admin Posko UNNES</strong> dengan data rahasia penemu.
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {questions.map((q, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Pertanyaan {idx + 1}: {q}
              </label>
              <textarea
                rows={2}
                required={idx === 0}
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
              disabled={submitting}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.4rem' }}
            >
              <Send size={14} /> {submitting ? 'Mengirim...' : 'Kirim Klaim ke Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
