import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Send, 
  ShieldAlert, 
  Bike, 
  FileCheck, 
  Share2,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { RunnerOrderModal } from '../components/RunnerOrderModal';
import { BASTModal } from '../components/BASTModal';

export const MessagesPage = () => {
  const { matchId } = useParams();
  const { matches, messages, sendMessage, markMessagesAsRead } = useData();
  const { user } = useAuth();

  const [activeMatchId, setActiveMatchId] = useState(matchId || (matches.length > 0 ? matches[0].id : null));
  const [inputText, setInputText] = useState('');
  const [showRunnerModal, setShowRunnerModal] = useState(false);
  const [showBASTModal, setShowBASTModal] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (matchId) {
      setActiveMatchId(matchId);
    } else if (!activeMatchId && matches.length > 0) {
      setActiveMatchId(matches[0].id);
    }
  }, [matchId, matches]);

  const activeMatch = matches.find(m => m.id === activeMatchId);
  const matchMessages = messages.filter(m => m.match_id === activeMatchId);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [matchMessages.length, activeMatchId]);

  // Tandai pesan sudah dibaca
  useEffect(() => {
    if (activeMatchId && markMessagesAsRead) {
      markMessagesAsRead(activeMatchId);
    }
  }, [activeMatchId, matchMessages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeMatchId) return;
    const text = inputText.trim();
    setInputText('');
    await sendMessage(activeMatchId, text);
  };

  // WhatsApp script from blueprint 7.B
  const handleCopyWAScript = () => {
    if (!activeMatch) return;
    const script = `[SISTEM MATCHMAKING UNNES LOST & FOUND]\nHalo Kak @${activeMatch.owner_name} dan Kak @${activeMatch.finder_name}! 👋\n\nKontak kalian telah terhubung resmi untuk pengembalian barang berkode #${activeMatch.item_code} (${activeMatch.item_title}).\nSilakan berkoordinasi untuk menentukan waktu & lokasi titik temu penyerahan barang di area kampus UNNES. 📍\n\n---------------------------------------------------\n💡 BUTUH BANTUAN KARENA SIBUK / BEDA KAMPUS?\nKalian bisa menggunakan JASA RUNNER UNNES!\n🚗 Runner akan mengambil barang & mengantar langsung ke lokasi tujuan.\n💰 Tarif: Rp 7.000 - Rp 10.000 (Garansi Aman & Praktis)\n---------------------------------------------------`;
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.25rem', height: 'calc(100vh - 120px)', minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ marginBottom: '0.75rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Ruang Obrolan & Serah Terima</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Komunikasi langsung dan real-time antara penemu dan pemilik setelah verifikasi Admin.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', margin: 'auto', maxWidth: '480px' }}>
          <MessageSquare size={48} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Belum Ada Obrolan Aktif</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
            Obrolan akan terbuka secara otomatis setelah klaim barang atau laporan penemuan Anda disetujui oleh <strong>Admin Posko UNNES</strong>.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
            <Link to="/jelajahi" className="btn btn-primary btn-sm">
              Jelajahi Barang Temuan
            </Link>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 320px) 1fr',
          flex: 1,
          gap: '1rem',
          height: '100%',
          overflow: 'hidden'
        }} className="chat-layout">
          
          {/* Matches List (Sidebar) */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border-light)' }}>
            <div style={{ padding: '0.5rem', fontWeight: 700, fontSize: '0.85rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Percakapan Aktif ({matches.length})</span>
            </div>
            {matches.map(m => (
              <div
                key={m.id}
                onClick={() => setActiveMatchId(m.id)}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: activeMatchId === m.id ? 'var(--primary-50)' : 'transparent',
                  borderLeft: activeMatchId === m.id ? '3px solid var(--primary-700)' : '3px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  marginTop: '0.35rem',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                    #{m.item_code}
                  </span>
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    {m.match_type === 'found_report' ? (
                      <span className="badge" style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem', background: 'var(--teal-100, #ccfbf1)', color: 'var(--teal-800, #115e59)' }}>
                        📍 Temuan
                      </span>
                    ) : (
                      <span className="badge" style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem', background: 'var(--primary-100, #dbeafe)', color: 'var(--primary-800, #1e40af)' }}>
                        🛡️ Klaim
                      </span>
                    )}
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {m.status === 'selesai' ? '✅' : '🟢'}
                    </span>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.item_title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Dengan: <strong>{user?.id === m.owner_id ? m.finder_name : m.owner_name}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Active Chat Window */}
          {activeMatch ? (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
              
              {/* Chat Header & Toolbars */}
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                background: 'var(--bg-surface)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {activeMatch.item_title}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                      (#{activeMatch.item_code})
                    </span>
                    {activeMatch.match_type === 'found_report' ? (
                      <span className="badge" style={{ fontSize: '0.65rem', background: 'var(--teal-100, #ccfbf1)', color: 'var(--teal-800, #115e59)' }}>
                        📍 Laporan Temuan
                      </span>
                    ) : (
                      <span className="badge" style={{ fontSize: '0.65rem', background: 'var(--primary-100, #dbeafe)', color: 'var(--primary-800, #1e40af)' }}>
                        🛡️ Klaim Sah
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Lawan Bicara: <strong>{user?.id === activeMatch.owner_id ? activeMatch.finder_name : activeMatch.owner_name}</strong>
                  </div>
                </div>

                {/* Quick Action Tools */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={handleCopyWAScript} 
                    className="btn btn-outline btn-sm"
                    title="Salin template pengantar grup WhatsApp"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  >
                    <Share2 size={13} /> {copiedScript ? 'Tersalin!' : 'Script WA'}
                  </button>

                  <button 
                    onClick={() => setShowRunnerModal(true)} 
                    className="btn btn-accent btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', gap: '0.3rem' }}
                  >
                    <Bike size={13} /> Pesan Runner
                  </button>

                  {activeMatch.status !== 'selesai' && (
                    <button 
                      onClick={() => setShowBASTModal(true)} 
                      className="btn btn-teal btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', gap: '0.3rem' }}
                    >
                      <FileCheck size={13} /> Tanda Tangan BAST
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Message Stream */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                
                {/* Context Announcement Banner */}
                {activeMatch.match_type === 'found_report' ? (
                  <div style={{
                    background: 'rgba(20, 184, 166, 0.08)',
                    border: '1px solid rgba(20, 184, 166, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.9rem',
                    fontSize: '0.78rem',
                    color: 'var(--teal-900, #134e4a)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    lineHeight: 1.4
                  }}>
                    <Sparkles size={16} style={{ flexShrink: 0, color: 'var(--teal-600, #0d9488)' }} />
                    <span>
                      <strong>Koneksi Laporan Temuan:</strong> Percakapan ini dibuka karena <strong>{activeMatch.finder_name}</strong> melaporkan telah menemukan barang hilang milik <strong>{activeMatch.owner_name}</strong> dan telah disetujui Admin Posko.
                    </span>
                  </div>
                ) : null}

                {/* Safety SOP Notice Banner from Blueprint */}
                <div style={{
                  background: 'var(--warning-bg)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.75rem',
                  color: 'var(--amber-800)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Himbauan Keamanan UNNES:</strong> Sangat direkomendasikan penyerahan barang mandiri dilakukan di area publik yang ramai (Pos Satpam Fakultas, Kantin Pusat, atau Gedung Rektorat).
                  </span>
                </div>

                {matchMessages.map(msg => {
                  const isMe = msg.sender_id === user?.id;
                  const isSystem = msg.type === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} style={{
                        alignSelf: 'center',
                        maxWidth: '90%',
                        background: 'var(--info-bg)',
                        border: '1px solid rgba(2, 132, 199, 0.25)',
                        color: 'var(--info)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.78rem',
                        lineHeight: 1.4,
                        textAlign: 'center'
                      }}>
                        {msg.content}
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={msg.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem'
                      }}
                    >
                      {!isMe && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '0.3rem' }}>
                          {msg.sender_name || (user?.id === activeMatch.owner_id ? activeMatch.finder_name : activeMatch.owner_name)}
                        </span>
                      )}
                      <div style={{
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-lg)',
                        background: isMe ? 'var(--primary-800)' : 'var(--bg-surface-alt)',
                        color: isMe ? '#ffffff' : 'var(--text-primary)',
                        fontSize: '0.85rem',
                        boxShadow: 'var(--shadow-sm)',
                        lineHeight: 1.4
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                        {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} style={{
                padding: '0.75rem',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                gap: '0.5rem',
                background: 'var(--bg-surface)'
              }}>
                <input
                  type="text"
                  placeholder="Ketik pesan koordinasi penyerahan barang..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1rem' }}>
                  <Send size={16} />
                </button>
              </form>

            </div>
          ) : null}

        </div>
      )}

      {/* Modals */}
      <RunnerOrderModal
        item={activeMatch ? { item_id: activeMatch.item_id, match_id: activeMatch.id, title: activeMatch.item_title, item_code: activeMatch.item_code } : null}
        isOpen={showRunnerModal}
        onClose={() => setShowRunnerModal(false)}
        onSuccess={() => alert('Pesanan Jasa Runner UNNES berhasil diajukan!')}
      />

      <BASTModal
        match={activeMatch}
        isOpen={showBASTModal}
        onClose={() => setShowBASTModal(false)}
        onSuccess={() => alert('Berita Acara Serah Terima (BAST) berhasil ditandatangani secara digital!')}
      />

      <style>{`
        @media (max-width: 768px) {
          .chat-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MessagesPage;
