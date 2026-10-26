import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Send, 
  ShieldAlert, 
  Bike, 
  FileCheck, 
  Share2,
  ExternalLink,
  Trash2,
  ShieldCheck,
  CheckCheck,
  Search,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { RunnerOrderModal } from '../components/RunnerOrderModal';
import { BASTModal } from '../components/BASTModal';
import { StatusBadge } from '../components/StatusBadge';

export const MessagesPage = () => {
  const { matchId } = useParams();
  const { matches, messages, items, sendMessage, markMessagesAsRead, deleteMatchSession } = useData();
  const { user } = useAuth();

  // Filter matches:
  // - Admin: matches approved by admin or directly involving admin
  // - User: matches where user is finder or owner
  const userMatches = (matches || []).filter(m => {
    if (user?.role === 'admin') {
      return !m.approved_by || m.approved_by === user?.id || m.finder_id === user?.id || m.owner_id === user?.id;
    }
    return m.finder_id === user?.id || m.owner_id === user?.id;
  });

  const [activeMatchId, setActiveMatchId] = useState(matchId || (userMatches.length > 0 ? userMatches[0].id : null));
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRunnerModal, setShowRunnerModal] = useState(false);
  const [showBASTModal, setShowBASTModal] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (matchId) {
      setActiveMatchId(matchId);
    } else if (!activeMatchId && userMatches.length > 0) {
      setActiveMatchId(userMatches[0].id);
    }
  }, [matchId, userMatches]);

  const activeMatch = userMatches.find(m => m.id === activeMatchId);
  const activeItem = items.find(i => i.id === activeMatch?.item_id);
  const matchMessages = messages.filter(m => m.match_id === activeMatchId);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [matchMessages.length, activeMatchId]);

  // Mark messages as read
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

  const handleDeleteSession = async () => {
    if (!activeMatch) return;
    const confirmDelete = window.confirm(
      `HAPUS SESI OBROLAN #${activeMatch.item_code}?\n\n` +
      `Seluruh riwayat percakapan pada sesi ini akan dihapus permanen.\n` +
      `Lanjutkan?`
    );
    if (!confirmDelete) return;

    try {
      const res = await deleteMatchSession(activeMatch.id);
      if (res?.error) {
        alert(res.error);
      } else {
        const remaining = userMatches.filter(m => m.id !== activeMatch.id);
        setActiveMatchId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error('Gagal menghapus sesi obrolan:', err);
    }
  };

  const handleCopyWAScript = () => {
    if (!activeMatch) return;
    const script = `[UNNES LOST & FOUND]\nHalo Kak @${activeMatch.owner_name} dan Kak @${activeMatch.finder_name}!\n\nKoordinasi resmi penyerahan barang #${activeMatch.item_code} (${activeMatch.item_title}).\nTitik temu yang direkomendasikan: Pos Satpam Fakultas / Kantin Pusat UNNES.\n\nButuh bantuan antar? Gunakan Layanan Jasa Runner UNNES (Tarif Rp 7.000 - Rp 10.000).`;
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const filteredMatches = userMatches.filter(m => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (m.item_title && m.item_title.toLowerCase().includes(q)) ||
      (m.item_code && m.item_code.toLowerCase().includes(q)) ||
      (m.owner_name && m.owner_name.toLowerCase().includes(q)) ||
      (m.finder_name && m.finder_name.toLowerCase().includes(q))
    );
  });

  const getInitials = (name) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ background: 'var(--bg-canvas)', minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
      
      {userMatches.length === 0 ? (
        <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="archive-card" style={{ maxWidth: '520px', width: '100%', padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(15, 23, 42, 0.05)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <MessageSquare size={26} color="var(--ink-500)" />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.08em', color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              RUANG KOORDINASI RESMI
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600, color: 'var(--ink-900)', marginBottom: '0.75rem' }}>
              Belum Ada Obrolan Aktif
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-700)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Ruang obrolan terenkripsi akan dibuka otomatis setelah klaim barang atau laporan penemuan Anda disetujui melalui <strong>verifikasi Admin Posko UNNES</strong>.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/jelajahi" className="btn-dark" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                JELAJAHI BARANG TEMUAN <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '320px 1fr 300px', 
          height: 'calc(100vh - 72px)',
          borderTop: '1px solid var(--border-subtle)' 
        }} className="archival-chat-grid">
          
          {/* ================= COLUMN 1: SIDEBAR CONVERSATIONS LIST ================= */}
          <div style={{ 
            borderRight: '1px solid var(--border-subtle)', 
            background: 'var(--bg-canvas)', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.25rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--ink-900)' }}>
                  Obrolan
                </h1>
                <span style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.68rem', 
                  letterSpacing: '0.06em', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '2px', 
                  background: 'rgba(15, 23, 42, 0.06)', 
                  color: 'var(--ink-700)',
                  fontWeight: 600
                }}>
                  {userMatches.length} AKTIF
                </span>
              </div>

              {/* Search */}
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  placeholder="Cari obrolan atau kode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                    fontSize: '0.8rem',
                    borderRadius: '2px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                    fontFamily: 'var(--font-sans)'
                  }}
                />
                <Search size={14} color="var(--ink-500)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredMatches.map(m => {
                const isActive = activeMatchId === m.id;
                const otherPartyName = user?.id === m.owner_id ? m.finder_name : m.owner_name;
                const initials = getInitials(otherPartyName);

                return (
                  <div
                    key={m.id}
                    onClick={() => setActiveMatchId(m.id)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isActive ? 'var(--bg-card)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--ink-900)' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      display: 'flex',
                      gap: '0.85rem',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: isActive ? 'var(--primary-indigo)' : 'var(--bg-secondary)',
                      color: isActive ? '#FFFFFF' : 'var(--ink-900)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {initials}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {otherPartyName}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-500)' }}>
                          {m.status === 'selesai' ? 'SELESAI' : 'AKTIF'}
                        </span>
                      </div>

                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        #{m.item_code} · {m.item_title}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-700)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.match_type === 'found_report' ? '📍 Laporan Penemuan' : '🛡️ Klaim Terverifikasi'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= COLUMN 2: ACTIVE CHAT MAIN AREA ================= */}
          {activeMatch ? (
            <div style={{ 
              background: 'var(--bg-canvas)', 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              overflow: 'hidden',
              borderRight: '1px solid var(--border-subtle)'
            }}>
              
              {/* Header */}
              <div style={{
                padding: '0.85rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--primary-indigo)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}>
                    {getInitials(user?.id === activeMatch.owner_id ? activeMatch.finder_name : activeMatch.owner_name)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--ink-900)' }}>
                        {user?.id === activeMatch.owner_id ? activeMatch.finder_name : activeMatch.owner_name}
                      </span>
                      <StatusBadge status={activeMatch.status === 'selesai' ? 'SELESAI' : 'TERVERIFIKASI'} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-500)', letterSpacing: '0.04em' }}>
                      SEPUTAR #{activeMatch.item_code} · {activeMatch.item_title.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Header Action Tools */}
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={handleCopyWAScript} 
                    className="btn-secondary"
                    title="Salin template pengantar koordinasi WhatsApp"
                    style={{ fontSize: '0.72rem', padding: '0.4rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-canvas)' }}
                  >
                    <Share2 size={13} /> {copiedScript ? 'Tersalin!' : 'Script WA'}
                  </button>

                  <button 
                    onClick={() => setShowRunnerModal(true)} 
                    className="btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.4rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-canvas)' }}
                  >
                    <Bike size={13} /> Pesan Runner
                  </button>

                  {activeMatch.status !== 'selesai' && (
                    <button 
                      onClick={() => setShowBASTModal(true)} 
                      className="btn-dark"
                      style={{ fontSize: '0.72rem', padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <FileCheck size={13} /> Tanda Tangan BAST
                    </button>
                  )}

                  <button 
                    onClick={handleDeleteSession} 
                    className="btn-secondary"
                    title="Hapus sesi obrolan ini"
                    style={{ fontSize: '0.72rem', padding: '0.4rem 0.6rem', color: 'var(--tag-lost-ink)', borderColor: 'var(--tag-lost-border)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Chat Stream */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Security SOP Ticker */}
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '2px',
                  background: 'rgba(15, 23, 42, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontSize: '0.78rem',
                  color: 'var(--ink-700)',
                  lineHeight: 1.45
                }}>
                  <ShieldAlert size={16} color="var(--ink-900)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>SOP Penyerahan UNNES:</strong> Demi keamanan, lakukan serah terima di area publik (Pos Satpam Fakultas / Rektorat) dan gunakan Berita Acara Serah Terima (BAST) digital.
                  </div>
                </div>

                {/* Date Divider */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                  <div style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', color: 'var(--ink-500)', textTransform: 'uppercase' }}>
                    HARI INI
                  </span>
                  <div style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }} />
                </div>

                {/* Verified Pill Announcement */}
                <div style={{
                  alignSelf: 'center',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '2px',
                  background: 'var(--tag-found-bg)',
                  border: '1px solid var(--tag-found-border)',
                  color: 'var(--tag-found-ink)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <CheckCheck size={13} /> BLIND TEST LOLOS — IDENTITAS DIVERIFIKASI ADMIN
                </div>

                {/* Messages Loop */}
                {matchMessages.map(msg => {
                  const isMe = msg.sender_id === user?.id;
                  const isSystem = msg.type === 'system';
                  const isSenderAdmin = msg.sender_role === 'admin' || msg.sender?.role === 'admin' || (activeMatch?.approved_by && msg.sender_id === activeMatch.approved_by);

                  if (isSystem) {
                    return (
                      <div key={msg.id} style={{
                        alignSelf: 'center',
                        maxWidth: '85%',
                        padding: '0.65rem 1rem',
                        borderRadius: '2px',
                        background: 'rgba(15, 23, 42, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.78rem',
                        color: 'var(--ink-700)',
                        textAlign: 'center',
                        lineHeight: 1.45
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
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                      }}
                    >
                      {/* Sender label */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                      }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-500)' }}>
                          {isMe ? 'Anda' : (msg.sender_name || (isSenderAdmin ? 'Admin Posko' : 'Pengguna'))}
                        </span>
                        {isSenderAdmin && (
                          <span style={{
                            fontSize: '0.6rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            padding: '0.05rem 0.35rem',
                            borderRadius: '2px',
                            background: 'var(--ink-900)',
                            color: 'var(--tag-bounty-ink)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}>
                            <ShieldCheck size={10} /> ADMIN
                          </span>
                        )}
                      </div>

                      {/* Chat bubble */}
                      <div style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        background: isSenderAdmin
                          ? (isMe ? 'var(--primary-indigo)' : 'var(--tag-found-bg)')
                          : (isMe ? 'var(--primary-indigo)' : 'var(--bg-card)'),
                        color: isMe ? '#FFFFFF' : 'var(--ink-900)',
                        border: isSenderAdmin
                          ? (isMe ? 'none' : '1px solid var(--tag-found-border)')
                          : (isMe ? 'none' : '1px solid var(--border-subtle)'),
                        fontSize: '0.86rem',
                        lineHeight: 1.5,
                        boxShadow: 'var(--shadow-subtle)'
                      }}>
                        {msg.content}
                      </div>

                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        color: 'var(--ink-500)',
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                      }}>
                        {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        {isMe && ' ✓✓'}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  placeholder="Tulis pesan… identitas pribadi otomatis disensor"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '2px',
                    background: 'var(--bg-canvas)'
                  }}
                />
                <button type="submit" className="btn-dark" style={{ padding: '0.65rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Send size={15} />
                </button>
              </form>

            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-500)' }}>
              Pilih percakapan untuk memulai
            </div>
          )}

          {/* ================= COLUMN 3: CONTEXT SIDEBAR ================= */}
          <div style={{ 
            background: 'var(--bg-canvas)', 
            padding: '1.25rem', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }} className="chat-context-col">
            
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                KONTEKS LAPORAN
              </div>

              {activeMatch && (
                <div className="archive-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Item Image / Censored Badge */}
                  <div style={{
                    width: '100%',
                    height: '140px',
                    borderRadius: '2px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#EAE3DC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {activeItem?.image_url ? (
                      <img 
                        src={activeItem.image_url} 
                        alt={activeMatch.item_title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--ink-500)' }}>
                        <Lock size={20} style={{ margin: '0 auto 0.25rem' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.06em' }}>[FOTO DISENSOR]</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-500)', marginBottom: '0.2rem' }}>
                      #{activeMatch.item_code}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink-900)', margin: '0 0 0.5rem' }}>
                      {activeMatch.item_title}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      <StatusBadge status={activeMatch.match_type === 'found_report' ? 'DITEMUKAN' : 'BARANG HILANG'} />
                    </div>
                  </div>

                  {activeItem && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem' }}>
                      <div className="dotted-row">
                        <span className="dotted-row-label">Lokasi:</span>
                        <span className="dotted-row-filler"></span>
                        <span className="dotted-row-value">{activeItem.location_building}</span>
                      </div>
                      <div className="dotted-row">
                        <span className="dotted-row-label">Kategori:</span>
                        <span className="dotted-row-filler"></span>
                        <span className="dotted-row-value">{activeItem.category}</span>
                      </div>
                    </div>
                  )}

                  <Link 
                    to={`/barang/${activeMatch.item_id}`}
                    className="btn-secondary"
                    style={{ 
                      textDecoration: 'none', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.4rem', 
                      fontSize: '0.75rem',
                      padding: '0.55rem',
                      marginTop: '0.25rem'
                    }}
                  >
                    LIHAT DETAIL BARANG <ExternalLink size={13} />
                  </Link>
                </div>
              )}
            </div>

            {/* Aturan Obrolan */}
            <div style={{
              padding: '1rem',
              borderRadius: '2px',
              background: 'rgba(15, 23, 42, 0.02)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--ink-700)',
              lineHeight: 1.55
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--ink-900)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                ATURAN OBROLAN
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Nomor HP & alamat tersensor otomatis demi privasi.</li>
                <li>Bagikan kontak personal hanya setelah blind test dinyatakan cocok.</li>
                <li>Laporan palsu dikenai sanksi penonaktifan akun UNNES.</li>
              </ul>
            </div>

          </div>

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
        @media (max-width: 1024px) {
          .archival-chat-grid {
            grid-template-columns: 280px 1fr !important;
          }
          .chat-context-col {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .archival-chat-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
            min-height: calc(100vh - 120px) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MessagesPage;
