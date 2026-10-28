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
  ArrowRight,
  Info,
  ChevronLeft,
  Check,
  Sparkles,
  MapPin,
  Tag,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { RunnerOrderModal } from '../components/RunnerOrderModal';
import { BASTModal } from '../components/BASTModal';
import { StatusBadge } from '../components/StatusBadge';

const QUICK_REPLIES = [
  "Saya sudah di posko",
  "Bisa ketemu di mana ya?",
  "Barang sudah siap diserahkan",
  "Terima kasih banyak!"
];

export const MessagesPage = () => {
  const { matchId } = useParams();
  const { matches, messages, items, sendMessage, markMessagesAsRead, deleteMatchSession } = useData();
  const { user } = useAuth();

  // Filter matches:
  // - Admin: matches approved by admin or directly involving admin
  // - User: matches where user is finder or owner (by id or full name)
  const userMatches = (matches || []).filter(m => {
    if (user?.role === 'admin') {
      return !m.approved_by || m.approved_by === user?.id || m.finder_id === user?.id || m.owner_id === user?.id;
    }
    const normUser = (user?.full_name || '').trim().toLowerCase();
    const isFinder = m.finder_id === user?.id || (normUser && m.finder_name && m.finder_name.toLowerCase().includes(normUser));
    const isOwner = m.owner_id === user?.id || (normUser && m.owner_name && m.owner_name.toLowerCase().includes(normUser));
    return isFinder || isOwner;
  });

  const [activeMatchId, setActiveMatchId] = useState(matchId || (userMatches.length > 0 ? userMatches[0].id : null));
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRunnerModal, setShowRunnerModal] = useState(false);
  const [showBASTModal, setShowBASTModal] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(true);
  const [showConversationsList, setShowConversationsList] = useState(true);
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

  const handleQuickReply = (text) => {
    setInputText(text);
  };

  const handleDeleteSession = async () => {
    if (!activeMatch) return;
    const confirmDelete = window.confirm(
      `Hapus sesi obrolan #${activeMatch.item_code}?\n\n` +
      `Seluruh riwayat percakapan pada sesi koordinasi ini akan dihapus permanen.\n` +
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
    const script = `[UNNES LOST & FOUND]\nHalo Kak @${activeMatch.owner_name} dan Kak @${activeMatch.finder_name}!\n\nKoordinasi resmi penyerahan barang #${activeMatch.item_code} (${activeMatch.item_title}).\nTitik temu yang direkomendasikan: Pos Satpam Fakultas / Rektorat UNNES.\n\nButuh bantuan antar? Gunakan Layanan Jasa Runner UNNES (Tarif Rp 7.000 - Rp 10.000).`;
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
    <div style={{ background: 'var(--bg-canvas)', height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {userMatches.length === 0 ? (
        /* Empty State */
        <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="archive-card" style={{ maxWidth: '460px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ 
              width: '52px', 
              height: '52px', 
              borderRadius: '50%', 
              background: 'var(--primary-50)', 
              color: 'var(--primary-indigo)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.25rem' 
            }}>
              <MessageSquare size={24} />
            </div>
            
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '0.4rem' }}>
              Belum Ada Obrolan Aktif
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-600)', lineHeight: 1.55, marginBottom: '1.75rem' }}>
              Ruang koordinasi resmi akan terbuka secara otomatis setelah klaim kepemilikan barang disetujui melalui verifikasi posko UNNES.
            </p>
            
            <Link 
              to="/jelajahi" 
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem' }}
            >
              Jelajahi Katalog Barang <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        /* Main Chat Layout: Dynamic Columns (List, Active Chat, Context Panel) */
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: (showConversationsList && showDetailsPanel) 
            ? '310px 1fr 310px' 
            : (showConversationsList && !showDetailsPanel) 
            ? '310px 1fr' 
            : (!showConversationsList && showDetailsPanel) 
            ? '1fr 310px' 
            : '1fr', 
          height: '100%',
          overflow: 'hidden'
        }} className="pro-chat-layout">
          
          {/* ================= COLUMN 1: SIDEBAR CONVERSATIONS ================= */}
          {showConversationsList && (
            <div style={{ 
              borderRight: '1px solid var(--border-subtle)', 
              background: 'var(--bg-canvas)', 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Header & Search */}
              <div style={{ padding: '0.85rem 1.15rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--ink-900)' }}>
                      Pesan &amp; Koordinasi
                    </h1>
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.68rem', 
                      letterSpacing: '0.04em', 
                      padding: '2px 7px', 
                      borderRadius: 'var(--radius-full)', 
                      background: 'var(--primary-50)', 
                      color: 'var(--primary-indigo)',
                      fontWeight: 700
                    }}>
                      {userMatches.length} AKTIF
                    </span>
                  </div>

                  {/* Hide Sidebar Button */}
                  <button
                    type="button"
                    onClick={() => setShowConversationsList(false)}
                    className="btn btn-secondary btn-sm"
                    title="Sembunyikan daftar obrolan"
                    style={{
                      padding: '0.3rem 0.45rem',
                      color: 'var(--ink-500)',
                      background: 'transparent',
                      borderColor: 'var(--border-subtle)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <PanelLeftClose size={16} />
                  </button>
                </div>

                {/* Search Box */}
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text"
                    placeholder="Cari nama atau kode barang..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.15rem',
                      fontSize: '0.8rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      fontFamily: 'var(--font-sans)'
                    }}
                  />
                  <Search size={14} color="var(--ink-400)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Conversation List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.35rem 0' }}>
                {filteredMatches.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--ink-400)', fontSize: '0.8rem' }}>
                    Tidak ada percakapan ditemukan
                  </div>
                ) : (
                  filteredMatches.map(m => {
                    const isActive = activeMatchId === m.id;
                    const otherPartyName = user?.id === m.owner_id ? m.finder_name : m.owner_name;
                    const initials = getInitials(otherPartyName);
                    const matchMsgs = (messages || []).filter(msg => msg.match_id === m.id);
                    const lastMsg = matchMsgs.length > 0 ? matchMsgs[matchMsgs.length - 1] : null;
                    const lastTime = lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';

                    return (
                      <div
                        key={m.id}
                        onClick={() => setActiveMatchId(m.id)}
                        className={`chat-conv-item ${isActive ? 'active' : ''}`}
                      >
                        {/* Avatar */}
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: isActive ? 'var(--primary-indigo)' : 'var(--bg-surface-alt)',
                          color: isActive ? '#FFFFFF' : 'var(--primary-indigo)',
                          border: isActive ? 'none' : '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {initials}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {otherPartyName}
                            </span>
                            <span style={{ 
                              fontSize: '0.68rem', 
                              color: 'var(--ink-400)',
                              fontWeight: 500,
                              flexShrink: 0
                            }}>
                              {lastTime || (m.status === 'selesai' ? 'Selesai' : 'Aktif')}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.74rem', color: 'var(--ink-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lastMsg ? (
                              <span>{lastMsg.sender_id === user?.id ? 'Anda: ' : ''}{(lastMsg.content || '').replace(/<!--BAST_.*?-->/g, '').trim()}</span>
                            ) : (
                              <span>#{m.item_code} · {m.item_title}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ================= COLUMN 2: ACTIVE CHAT MAIN AREA ================= */}
          {activeMatch ? (
            <div style={{ 
              background: 'var(--bg-canvas)', 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              overflow: 'hidden'
            }}>
              
              {/* Header Bar */}
              <div style={{
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                {/* Contact Info & Left Toggle Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  
                  {/* Toggle Sidebar Button */}
                  <button
                    type="button"
                    onClick={() => setShowConversationsList(!showConversationsList)}
                    className="btn btn-secondary btn-sm"
                    title={showConversationsList ? "Sembunyikan daftar obrolan" : "Tampilkan daftar obrolan"}
                    style={{
                      padding: '0.35rem 0.55rem',
                      color: showConversationsList ? 'var(--ink-600)' : 'var(--primary-indigo)',
                      backgroundColor: showConversationsList ? 'transparent' : 'var(--primary-50)',
                      borderColor: showConversationsList ? 'var(--border-subtle)' : 'var(--primary-300)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {showConversationsList ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
                    {!showConversationsList && (
                      <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Daftar Obrolan</span>
                    )}
                  </button>

                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--primary-indigo)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {getInitials(user?.id === activeMatch.owner_id ? activeMatch.finder_name : activeMatch.owner_name)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.975rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                        {user?.id === activeMatch.owner_id ? activeMatch.finder_name : activeMatch.owner_name}
                      </span>
                      <span className="badge badge-verified" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                        TERVERIFIKASI
                      </span>
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Seputar:</span>
                      <strong style={{ color: 'var(--ink-800)' }}>#{activeMatch.item_code} · {activeMatch.item_title}</strong>
                    </div>
                  </div>
                </div>

                {/* Header Action Tools */}
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  
                  {/* WhatsApp Coordination Button */}
                  <button 
                    onClick={handleCopyWAScript} 
                    className="btn btn-secondary btn-sm"
                    title="Salin ringkasan koordinasi untuk dikirimkan via WhatsApp"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    {copiedScript ? <Check size={13} color="var(--success)" /> : <Share2 size={13} />}
                    <span>{copiedScript ? 'Tersalin!' : 'Salin Info WA'}</span>
                  </button>                  {/* Runner Order Button (only if active) */}
                  {activeMatch.status !== 'selesai' && (
                    <button 
                      onClick={() => setShowRunnerModal(true)} 
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Bike size={13} />
                      <span>Pesan Runner</span>
                    </button>
                  )}

                  {/* BAST Handover Sign / Status Button */}
                  {activeMatch.status === 'selesai' ? (
                    <button 
                      onClick={() => setShowBASTModal(true)} 
                      className="btn btn-secondary btn-sm"
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.35rem 0.75rem', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.35rem', 
                        color: 'var(--success, #10b981)',
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        backgroundColor: 'rgba(16, 185, 129, 0.05)'
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Lihat BAST (Selesai)</span>
                    </button>
                  ) : ((user?.id === activeMatch.owner_id && activeMatch.owner_signed_at) || (user?.id === activeMatch.finder_id && activeMatch.finder_signed_at)) ? (
                    <button 
                      onClick={() => setShowBASTModal(true)} 
                      className="btn btn-secondary btn-sm"
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.35rem 0.75rem', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.35rem',
                        color: 'var(--primary-indigo)',
                        borderColor: 'var(--primary-300)'
                      }}
                    >
                      <Check size={13} />
                      <span>Status BAST (Sudah TTD)</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowBASTModal(true)} 
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <FileCheck size={13} />
                      <span>Tanda Tangan BAST</span>
                    </button>
                  )}

                  {/* Toggle Context Sidebar */}
                  <button 
                    onClick={() => setShowDetailsPanel(!showDetailsPanel)} 
                    className="btn btn-secondary btn-sm"
                    title={showDetailsPanel ? "Tutup rincian barang" : "Lihat rincian barang"}
                    style={{ 
                      padding: '0.35rem 0.6rem', 
                      backgroundColor: showDetailsPanel ? 'var(--bg-surface-alt)' : 'transparent',
                      color: showDetailsPanel ? 'var(--primary-indigo)' : 'var(--ink-700)'
                    }}
                  >
                    <Info size={14} />
                  </button>

                  {/* Delete Conversation */}
                  <button 
                    onClick={handleDeleteSession} 
                    className="btn btn-secondary btn-sm"
                    title="Hapus sesi percakapan ini"
                    style={{ padding: '0.35rem 0.55rem', color: 'var(--danger-500)', borderColor: 'var(--border-subtle)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Chat Stream Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                {/* Official Unified Verification Banner */}
                <div style={{
                  alignSelf: 'center',
                  maxWidth: '520px',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--primary-50)',
                    color: 'var(--primary-indigo)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div style={{ flex: 1, fontSize: '0.75rem', color: 'var(--ink-600)', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 700, color: 'var(--ink-900)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>Koordinasi Resmi Terverifikasi UNNES</span>
                      <span className="badge badge-verified" style={{ fontSize: '0.58rem', padding: '0px 5px' }}>AMAN</span>
                    </div>
                    Blind-test klaim kepemilikan telah disetujui. Bertemulah di area publik (Pos Satpam Fakultas / Rektorat) dan rekam serah terima dengan <strong>BAST digital</strong>.
                  </div>
                </div>

                {/* Date Divider */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', margin: '0.35rem 0' }}>
                  <div style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    HARI INI
                  </span>
                  <div style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }} />
                </div>

                {/* Messages Loop */}
                {matchMessages.map((msg, idx) => {
                  const isMe = msg.sender_id === user?.id;
                  const isSystem = msg.type === 'system';
                  const isSenderAdmin = msg.sender_role === 'admin' || msg.sender?.role === 'admin' || (activeMatch?.approved_by && msg.sender_id === activeMatch.approved_by);
                  const formattedTime = new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                  
                  const prevMsg = idx > 0 ? matchMessages[idx - 1] : null;
                  const isSameSenderAsPrev = prevMsg && prevMsg.sender_id === msg.sender_id && prevMsg.type !== 'system';

                  const displayContent = (msg.content || '').replace(/<!--BAST_.*?-->/g, '').trim();

                  if (isSystem) {
                    return (
                      <div key={msg.id} style={{
                        alignSelf: 'center',
                        maxWidth: '80%',
                        padding: '0.55rem 0.95rem',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-surface-alt)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.765rem',
                        color: 'var(--ink-700)',
                        textAlign: 'center',
                        lineHeight: 1.45
                      }}>
                        {displayContent}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '68%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        marginTop: !isSameSenderAsPrev && idx > 0 ? '0.4rem' : '0'
                      }}
                    >
                      {/* Sender label for other parties (only when first of cluster) */}
                      {!isMe && !isSameSenderAsPrev && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          paddingLeft: '6px',
                          marginBottom: '2px'
                        }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isSenderAdmin ? 'var(--primary-indigo)' : 'var(--ink-700)' }}>
                            {msg.sender_name || (isSenderAdmin ? 'Admin Posko' : 'Civitas UNNES')}
                          </span>
                          {isSenderAdmin && (
                            <span className="badge badge-admin" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>
                              PETUGAS POSKO
                            </span>
                          )}
                        </div>
                      )}

                      {/* Chat Bubble */}
                      <div className={isMe ? 'chat-bubble-outgoing' : 'chat-bubble-incoming'}>
                        <span>{displayContent}</span>
                        
                        {/* Inline Timestamp & Ticks */}
                        <span className={isMe ? 'chat-bubble-time-outgoing' : 'chat-bubble-time-incoming'}>
                          <span>{formattedTime}</span>
                          {isMe && <CheckCheck size={13} strokeWidth={2.5} />}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              {/* Chat Input or Closed Case Banner */}
              {activeMatch.status === 'selesai' ? (
                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: 'var(--success, #10b981)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Kasus Selesai &amp; Serah Terima Sah</span>
                        <span className="badge badge-verified" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>ARSIP</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-600)', marginTop: '2px' }}>
                        Berita Acara Serah Terima (BAST) telah ditandatangani kedua pihak. Pengiriman pesan ditutup demi privasi dan arsip penyerahan resmi.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBASTModal(true)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.775rem' }}
                  >
                    <FileCheck size={14} />
                    <span>Lihat Dokumen BAST</span>
                  </button>
                </div>
              ) : (
                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  padding: '0.65rem 1.25rem 0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {/* Quick Reply Suggestions */}
                  <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
                    {QUICK_REPLIES.map((reply, i) => (
                      <button
                        key={i}
                        type="button"
                        className="chat-quick-chip"
                        onClick={() => handleQuickReply(reply)}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>

                  {/* Form Input Container */}
                  <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Ketik pesan koordinasi... (identitas pribadi otomatis disensor)"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.65rem 1rem',
                        fontSize: '0.865rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-surface)',
                        outline: 'none',
                        color: 'var(--ink-900)'
                      }}
                    />
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={!inputText.trim()}
                      style={{ 
                        width: '38px', 
                        height: '38px', 
                        borderRadius: '50%', 
                        padding: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                        opacity: inputText.trim() ? 1 : 0.5,
                        cursor: inputText.trim() ? 'pointer' : 'default'
                      }}
                      title="Kirim pesan"
                    >
                      <Send size={15} style={{ marginLeft: '1px' }} />
                    </button>
                  </form>
                </div>
              )}

            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-500)', fontSize: '0.9rem', gap: '0.85rem', height: '100%', padding: '2rem' }}>
              <span>Pilih percakapan di bilah kiri untuk membuka koordinasi</span>
              {!showConversationsList && (
                <button
                  type="button"
                  onClick={() => setShowConversationsList(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem' }}
                >
                  <PanelLeftOpen size={16} />
                  <span>Buka Daftar Obrolan</span>
                </button>
              )}
            </div>
          )}

          {/* ================= COLUMN 3: ITEM CONTEXT SIDEBAR ================= */}
          {showDetailsPanel && activeMatch && (
            <div style={{ 
              background: 'var(--bg-card)', 
              borderLeft: '1px solid var(--border-subtle)',
              padding: '1.15rem', 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.15rem'
            }} className="chat-context-panel">
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-900)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Rincian Barang Terkait
                </span>
                <button 
                  onClick={() => setShowDetailsPanel(false)}
                  style={{ color: 'var(--ink-400)', cursor: 'pointer', background: 'transparent', border: 'none', padding: '2px' }}
                  title="Tutup panel"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>

              {/* Item Card */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.95rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                
                {/* Photo Thumbnail */}
                <div style={{
                  width: '100%',
                  height: '130px',
                  minHeight: '130px',
                  flexShrink: 0,
                  borderRadius: '6px',
                  overflow: 'hidden',
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {activeItem?.photo_urls && activeItem.photo_urls.length > 0 ? (
                    <img 
                      src={activeItem.photo_urls[0]} 
                      alt={activeMatch.item_title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--ink-400)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', padding: '0.5rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--ink-500)'
                      }}>
                        <Lock size={16} />
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-700)' }}>Foto Terproteksi</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--ink-400)' }}>Hanya pemilik terverifikasi</span>
                    </div>
                  )}
                </div>

                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--primary-indigo)', fontWeight: 700 }}>
                    #{activeMatch.item_code}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.975rem', fontWeight: 700, color: 'var(--ink-900)', margin: '2px 0 6px' }}>
                    {activeMatch.item_title}
                  </h3>
                  <div>
                    <span className={`badge ${activeMatch.match_type === 'found_report' ? 'badge-found' : 'badge-lost'}`} style={{ fontSize: '0.62rem' }}>
                      {activeMatch.match_type === 'found_report' ? 'BARANG TEMUAN' : 'BARANG HILANG'}
                    </span>
                  </div>
                </div>

                {/* Metadata Dotted Rows */}
                {activeItem && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.765rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                    <div className="dotted-row">
                      <span className="dotted-label">LOKASI:</span>
                      <span className="dotted-line"></span>
                      <span className="dotted-value" title={activeItem.location_building}>
                        {activeItem.location_building}
                      </span>
                    </div>
                    <div className="dotted-row">
                      <span className="dotted-label">KATEGORI:</span>
                      <span className="dotted-line"></span>
                      <span className="dotted-value">{activeItem.category}</span>
                    </div>
                  </div>
                )}

                <Link 
                  to={`/barang/${activeMatch.item_id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.35rem', 
                    fontSize: '0.74rem',
                    textDecoration: 'none',
                    marginTop: '0.25rem'
                  }}
                >
                  Buka Detail Barang <ExternalLink size={12} />
                </Link>
              </div>

              {/* Handover Safety Checklist */}
              <div style={{
                backgroundColor: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem'
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-800)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Protokol Serah Terima
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.73rem', color: 'var(--ink-600)', lineHeight: 1.45 }}>
                  <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--primary-indigo)', fontWeight: 700 }}>1.</span>
                    <span>Bertemu di <strong>Pos Satpam Fakultas / Rektorat</strong> yang terpantau CCTV.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--primary-indigo)', fontWeight: 700 }}>2.</span>
                    <span>Cek kesesuaian ciri barang &amp; verifikasi KTM pemilik asli secara langsung.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--primary-indigo)', fontWeight: 700 }}>3.</span>
                    <span>Tandatangani <strong>BAST digital</strong> di bilah atas sebagai bukti resmi sah.</span>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div style={{
                padding: '0.75rem',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.72rem',
                color: 'var(--ink-500)',
                lineHeight: 1.45
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--ink-700)', marginBottom: '3px' }}>
                  <ShieldAlert size={13} color="var(--primary-indigo)" />
                  <span>Sensor Otomatis Aktif</span>
                </div>
                Nomor HP, rekening, dan alamat pribadi disensor otomatis dalam obrolan demi melindungi privasi civitas UNNES.
              </div>

            </div>
          )}

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
          .chat-context-panel {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .pro-chat-layout {
            grid-template-columns: 1fr !important;
            height: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MessagesPage;
