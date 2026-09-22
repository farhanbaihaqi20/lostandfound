import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Check, 
  X, 
  AlertCircle, 
  ArrowLeft, 
  HelpCircle, 
  Lock, 
  User, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { AdminNavTabs } from '../../components/AdminNavTabs';

export const ClaimModerationPage = () => {
  const { claims, items, verifyClaim } = useData();

  const [activeFilter, setActiveFilter] = useState('menunggu_admin');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const filteredClaims = claims.filter(c => {
    if (activeFilter === 'semua') return true;
    return c.status === activeFilter;
  });

  const handleVerify = (claimId, isApproved) => {
    verifyClaim(claimId, isApproved, adminNotes);
    alert(isApproved 
      ? 'Klaim berhasil DIVERIFIKASI VALID! Ruang obrolan telah dibuka untuk kedua belah pihak.' 
      : 'Klaim DITOLAK karena jawaban tidak cocok.'
    );
    setSelectedClaim(null);
    setAdminNotes('');
  };

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Unified Admin Sub-Navigation */}
      <AdminNavTabs />

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin" className="btn btn-ghost btn-sm" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={16} /> Panel
          </Link>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Verifikasi Klaim Blind Test</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Cocokkan jawaban pemohon dengan data rahasia pelapor sebelum membuka kontak.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => setActiveFilter('menunggu_admin')}
            className={`btn btn-sm ${activeFilter === 'menunggu_admin' ? 'btn-accent' : 'btn-outline'}`}
          >
            Menunggu ({claims.filter(c => c.status === 'menunggu_admin').length})
          </button>
          <button
            onClick={() => setActiveFilter('disetujui')}
            className={`btn btn-sm ${activeFilter === 'disetujui' ? 'btn-primary' : 'btn-outline'}`}
          >
            Disetujui ({claims.filter(c => c.status === 'disetujui').length})
          </button>
          <button
            onClick={() => setActiveFilter('ditolak')}
            className={`btn btn-sm ${activeFilter === 'ditolak' ? 'btn-primary' : 'btn-outline'}`}
          >
            Ditolak ({claims.filter(c => c.status === 'ditolak').length})
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredClaims.length === 0 ? (
          <div className="glass-card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShieldCheck size={40} color="var(--teal-600)" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontWeight: 600 }}>Tidak ada klaim dalam antrean ini.</p>
          </div>
        ) : (
          filteredClaims.map(claim => {
            const targetItem = items.find(i => i.id === claim.item_id);

            return (
              <div 
                key={claim.id} 
                className="glass-card"
                style={{ padding: '1.25rem', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                        #{claim.item_code}
                      </span>
                      <span className="badge badge-review" style={{ fontSize: '0.65rem' }}>
                        {claim.status.replace('_', ' ')}
                      </span>
                      <span className="badge badge-found" style={{ fontSize: '0.65rem' }}>
                        Skor Otomatis: {claim.blind_test_score}%
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem' }}>
                      {claim.item_title}
                    </h2>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Pemohon Klaim: <strong>{claim.claimer_name}</strong> ({claim.claimer_email}) • Telp: {claim.claimer_phone}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedClaim(selectedClaim?.id === claim.id ? null : claim)}
                    className="btn btn-outline btn-sm"
                  >
                    {selectedClaim?.id === claim.id ? 'Tutup Perbandingan' : 'Bandingkan Jawaban Blind Test'}
                  </button>
                </div>

                {/* SIDE-BY-SIDE COMPARISON ACCORDION */}
                {selectedClaim?.id === claim.id && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '1.25rem',
                    background: 'var(--bg-surface-alt)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    border: '1px solid var(--border-light)'
                  }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      
                      {/* Left: Claimer's Answers */}
                      <div style={{
                        padding: '1rem',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)'
                      }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <User size={16} /> Jawaban Pemohon ({claim.claimer_name})
                        </div>

                        {claim.blind_test_answers && claim.blind_test_answers.map((ans, idx) => (
                          <div key={idx} style={{ marginBottom: '0.75rem', fontSize: '0.825rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                              Q{idx + 1}: {ans.question}
                            </div>
                            <div style={{ 
                              background: 'var(--primary-50)', 
                              padding: '0.4rem 0.6rem', 
                              borderRadius: 'var(--radius-sm)',
                              marginTop: '0.2rem',
                              fontWeight: 500,
                              color: 'var(--primary-950)'
                            }}>
                              A: {ans.answer}
                            </div>
                          </div>
                        ))}

                        {claim.message && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                            Catatan pemohon: "{claim.message}"
                          </div>
                        )}
                      </div>

                      {/* Right: Original Secret Details from Reporter */}
                      <div style={{
                        padding: '1rem',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(13, 148, 136, 0.3)'
                      }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--teal-700)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Lock size={16} /> Data Rahasia Asli dari Penemu
                        </div>

                        <div style={{ 
                          fontSize: '0.85rem', 
                          background: 'var(--teal-50)', 
                          padding: '0.75rem', 
                          borderRadius: 'var(--radius-sm)', 
                          color: 'var(--teal-900)',
                          lineHeight: 1.5,
                          border: '1px solid var(--teal-500)'
                        }}>
                          {targetItem?.hidden_details || '(Tidak ada data rahasia tersimpan)'}
                        </div>

                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                          Lokasi barang diamankan: <strong>{targetItem?.location_building}</strong> ({targetItem?.location_detail || 'Pos Satpam'})
                        </div>
                      </div>

                    </div>

                    {/* Admin Notes & Actions */}
                    {claim.status === 'menunggu_admin' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                        <input
                          type="text"
                          placeholder="Catatan verifikasi Admin (opsional)..."
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          style={{ width: '100%', fontSize: '0.85rem' }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleVerify(claim.id, false)}
                            className="btn btn-danger btn-sm"
                            style={{ gap: '0.35rem' }}
                          >
                            <X size={15} /> Tolak Klaim
                          </button>
                          <button
                            onClick={() => handleVerify(claim.id, true)}
                            className="btn btn-teal btn-sm"
                            style={{ gap: '0.35rem' }}
                          >
                            <Check size={15} /> Validasi Cocok (Buka Obrolan)
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
