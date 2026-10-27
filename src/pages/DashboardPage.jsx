import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  ExternalLink, 
  Bike, 
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { StatusBadge } from '../components/StatusBadge';
import { getRunnerStatusInfo } from '../data/initialData';
import { RunnerOrderModal } from '../components/RunnerOrderModal';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { items, orders, deleteItem, markItemAsReturned } = useData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRunnerModal, setShowRunnerModal] = useState(false);

  // User's own items
  const userItems = (items || []).filter(i => i.user_id === user?.id);
  const myLostItems = userItems.filter(i => i.type === 'hilang');
  const myFoundItems = userItems.filter(i => i.type === 'ditemukan');
  const myOrders = (orders || []).filter(o => o.requester_id === user?.id);

  // Metrics counters
  const totalCount = userItems.length;
  const pendingCount = userItems.filter(i => i.post_status === 'menunggu_review').length;
  const verifiedCount = userItems.filter(i => i.post_status === 'approved' && i.status !== 'selesai').length;
  const completedCount = userItems.filter(i => i.status === 'selesai' || i.post_status === 'selesai').length;

  // Filtered Items based on Tab & Search
  const getFilteredItems = () => {
    let list = userItems;
    if (activeTab === 'hilang') list = myLostItems;
    if (activeTab === 'ditemukan') list = myFoundItems;
    if (activeTab === 'selesai') list = userItems.filter(i => i.status === 'selesai' || i.post_status === 'selesai');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i => 
        (i.title && i.title.toLowerCase().includes(q)) ||
        (i.item_code && i.item_code.toLowerCase().includes(q)) ||
        (i.location_building && i.location_building.toLowerCase().includes(q)) ||
        (i.category && i.category.toLowerCase().includes(q))
      );
    }
    return list;
  };

  const filteredItems = getFilteredItems();

  const handleDelete = async (item) => {
    const confirm = window.confirm(
      `HAPUS LAPORAN #${item.item_code}?\n\n` +
      `Apakah Anda yakin ingin menghapus laporan "${item.title}"?\n` +
      `Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirm) return;

    try {
      await deleteItem(item.id);
      alert('Laporan berhasil dihapus.');
    } catch (err) {
      console.error('Gagal menghapus laporan:', err);
      alert('Terjadi kesalahan saat menghapus laporan.');
    }
  };

  const handleMarkReturned = async (item) => {
    const confirm = window.confirm(
      `TANDAI SELESAI #${item.item_code}?\n\n` +
      `Konfirmasi bahwa barang "${item.title}" telah berhasil diserahkan/diterima kembali?`
    );
    if (!confirm) return;

    try {
      await markItemAsReturned(item.id);
      alert('Status laporan diperbarui: SELESAI / KEMBALI!');
    } catch (err) {
      console.error('Gagal memperbarui status laporan:', err);
      alert('Terjadi kesalahan saat memperbarui status.');
    }
  };

  return (
    <div style={{ background: 'var(--bg-canvas)', minHeight: 'calc(100vh - 72px)', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container">
        
        {/* ================= 1. HEADER ROW ================= */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.08em', color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              DASHBOARD LAPORAN SAYA
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink-900)', margin: '0 0 0.35rem' }}>
              Laporan Saya
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-700)', maxWidth: '640px', lineHeight: 1.5, margin: 0 }}>
              Pantau status verifikasi posko, proses blind test klaim, dan riwayat pengembalian barang milik Anda.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowRunnerModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', padding: '0.65rem 1.15rem', borderRadius: '6px' }}
            >
              <Bike size={16} /> Pesan Jasa Runner
            </button>
            <Link 
              to="/lapor/pilih" 
              className="btn btn-primary btn-sm"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', padding: '0.65rem 1.25rem', borderRadius: '6px' }}
            >
              <Plus size={16} /> Buat Laporan Baru
            </Link>
          </div>
        </div>

        {/* ================= 2. METRICS TICKER BOXES ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {/* Card 1: Total */}
          <div className="archive-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.06em', color: 'var(--ink-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                  TOTAL LAPORAN
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.1rem', fontWeight: 800, color: 'var(--ink-900)', marginTop: '2px', lineHeight: 1.1 }}>
                  {totalCount}
                </div>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} color="var(--primary-indigo)" />
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>Semua kategori terdaftar</span>
          </div>

          {/* Card 2: Menunggu Review */}
          <div className="archive-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.06em', color: 'var(--ink-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                  MENUNGGU REVIEW
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.1rem', fontWeight: 800, color: 'var(--ink-900)', marginTop: '2px', lineHeight: 1.1 }}>
                  {pendingCount}
                </div>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color="#D97706" />
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>Proses kurasi Admin Posko</span>
          </div>

          {/* Card 3: Terverifikasi */}
          <div className="archive-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.06em', color: 'var(--ink-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                  TERVERIFIKASI AKTIF
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.1rem', fontWeight: 800, color: 'var(--ink-900)', marginTop: '2px', lineHeight: 1.1 }}>
                  {verifiedCount}
                </div>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={18} color="#059669" />
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>Tayang di katalog publik</span>
          </div>

          {/* Card 4: Selesai */}
          <div className="archive-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.06em', color: 'var(--ink-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                  SELESAI / KEMBALI
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.1rem', fontWeight: 800, color: 'var(--primary-indigo)', marginTop: '2px', lineHeight: 1.1 }}>
                  {completedCount}
                </div>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={18} color="var(--primary-indigo)" />
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>Berhasil diserahterimakan</span>
          </div>
        </div>

        {/* ================= 3. FILTER TABS & SEARCH ================= */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem',
          marginBottom: '1.5rem'
        }}>
          {/* Tab Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'semua', label: `SEMUA (${totalCount})` },
              { id: 'hilang', label: `KEHILANGAN (${myLostItems.length})` },
              { id: 'ditemukan', label: `TEMUAN (${myFoundItems.length})` },
              { id: 'runner', label: `PESANAN RUNNER (${myOrders.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`filter-chip ${activeTab === tab.id ? 'active' : ''}`}
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.95rem' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          {activeTab !== 'runner' && (
            <div style={{ position: 'relative', width: '280px' }}>
              <input 
                type="text"
                placeholder="Cari dalam laporan saya..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  fontSize: '0.8rem',
                  borderRadius: '2px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)'
                }}
              />
              <Search size={14} color="var(--ink-500)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          )}
        </div>

        {/* ================= 4. CONTENT AREA ================= */}
        {activeTab === 'runner' ? (
          /* ================= RUNNER ORDERS TAB ================= */
          myOrders.length === 0 ? (
            <div className="archive-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
              <Bike size={36} color="var(--ink-500)" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink-900)' }}>
                Belum Ada Pesanan Jasa Runner
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-700)', maxWidth: '420px', margin: '0.35rem auto 1.5rem' }}>
                Gunakan Jasa Runner UNNES untuk mengambil dan mengantar barang temuan langsung ke fakultas Anda.
              </p>
              <button 
                onClick={() => setShowRunnerModal(true)} 
                className="btn-dark"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}
              >
                <Bike size={15} /> PESAN RUNNER SEKARANG
              </button>
            </div>
          ) : (
            <div className="archive-card" style={{ overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(15, 23, 42, 0.03)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-500)', letterSpacing: '0.06em' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>ORDER ID</th>
                    <th style={{ padding: '0.85rem 1rem' }}>BARANG TERKAIT</th>
                    <th style={{ padding: '0.85rem 1rem' }}>LOKASI PENGANTARAN</th>
                    <th style={{ padding: '0.85rem 1rem' }}>RUNNER</th>
                    <th style={{ padding: '0.85rem 1rem' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {myOrders.map(order => {
                    const statusInfo = getRunnerStatusInfo(order.status);
                    return (
                      <tr key={order.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink-900)' }}>
                          #{order.item_code || order.id?.slice(0, 8)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{order.item_title || 'Barang UNNES'}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-500)' }}>Ongkir: Rp {(order.delivery_fee || 7000).toLocaleString('id-ID')}</div>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--ink-700)' }}>
                          {order.delivery_location}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{order.runner_name || 'Menunggu Penugasan'}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--ink-500)' }}>{order.runner_phone || 'Tim Logistik'}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`badge ${statusInfo.badgeClass}`} style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                            {statusInfo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* ================= ARSIP ITEMS TABLE ================= */
          filteredItems.length === 0 ? (
            <div className="archive-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: '10px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'var(--primary-50)', color: 'var(--primary-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.12)' }}>
                <FileText size={28} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink-900)', margin: '0 0 0.5rem' }}>
                {searchQuery ? `Tidak ada laporan yang cocok dengan "${searchQuery}"` : 'Belum Ada Laporan Terdaftar'}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-600)', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                {searchQuery 
                  ? 'Coba periksa ejaan kata kunci atau ganti filter kategori laporan.' 
                  : 'Mulai laporkan barang Anda untuk memantau status pencocokan dan klaim secara cepat.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                <Link 
                  to="/lapor/hilang" 
                  className="btn btn-sm"
                  style={{
                    background: 'var(--danger-50)',
                    color: 'var(--danger-700)',
                    border: '1px solid var(--danger-300)',
                    padding: '0.7rem 1.25rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    borderRadius: '6px',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--danger-600)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--danger-50)';
                    e.currentTarget.style.color = 'var(--danger-700)';
                  }}
                >
                  <AlertCircle size={15} /> Buat Laporan Kehilangan
                </Link>
                <Link 
                  to="/lapor/temuan" 
                  className="btn btn-primary btn-sm"
                  style={{
                    padding: '0.7rem 1.25rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    borderRadius: '6px',
                    textDecoration: 'none'
                  }}
                >
                  <Plus size={15} /> Catat Barang Temuan
                </Link>
              </div>
            </div>
          ) : (
            <div className="archive-card" style={{ overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(15, 23, 42, 0.03)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-500)', letterSpacing: '0.06em' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>KODE BARANG</th>
                    <th style={{ padding: '0.85rem 1rem' }}>NAMA BARANG</th>
                    <th style={{ padding: '0.85rem 1rem' }}>JENIS</th>
                    <th style={{ padding: '0.85rem 1rem' }}>TANGGAL</th>
                    <th style={{ padding: '0.85rem 1rem' }}>STATUS</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => {
                    const isResolved = item.status === 'selesai' || item.post_status === 'selesai';
                    const isPending = item.post_status === 'menunggu_review';

                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        {/* Kode */}
                        <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink-900)' }}>
                          #{item.item_code}
                        </td>

                        {/* Foto & Nama Barang */}
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '2px',
                              background: '#EAE3DC',
                              overflow: 'hidden',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ink-500)' }}>FOTO</span>
                              )}
                            </div>
                            <div>
                              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--ink-900)' }}>
                                {item.title}
                              </div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-500)' }}>
                                {item.location_building} · {item.category}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Jenis */}
                        <td style={{ padding: '1rem' }}>
                          <StatusBadge label={item.type === 'hilang' ? 'BARANG HILANG' : 'DITEMUKAN'} />
                        </td>

                        {/* Tanggal */}
                        <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-700)' }}>
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '24 Sep 2024'}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '1rem' }}>
                          {isResolved ? (
                            <StatusBadge label="SELESAI / KEMBALI" />
                          ) : isPending ? (
                            <StatusBadge label="MENUNGGU REVIEW" />
                          ) : (
                            <StatusBadge label="TERVERIFIKASI" />
                          )}
                        </td>

                        {/* Aksi */}
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                            <Link 
                              to={`/barang/${item.id}`}
                              className="btn-secondary"
                              title="Lihat rincian barang"
                              style={{ 
                                textDecoration: 'none', 
                                padding: '0.35rem 0.65rem', 
                                fontSize: '0.72rem', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.25rem' 
                              }}
                            >
                              LIHAT <ArrowRight size={12} />
                            </Link>

                            {!isResolved && !isPending && (
                              <button
                                onClick={() => handleMarkReturned(item)}
                                className="btn-secondary"
                                title="Konfirmasi barang telah diserahkan / kembali"
                                style={{ 
                                  padding: '0.35rem 0.65rem', 
                                  fontSize: '0.72rem',
                                  color: 'var(--tag-found-ink)',
                                  borderColor: 'var(--tag-found-border)',
                                  background: 'var(--tag-found-bg)'
                                }}
                              >
                                TANDAI SELESAI
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(item)}
                              className="btn-secondary"
                              title="Hapus laporan"
                              style={{ 
                                padding: '0.35rem 0.55rem', 
                                fontSize: '0.72rem',
                                color: 'var(--tag-lost-ink)',
                                borderColor: 'var(--tag-lost-border)'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

      </div>

      {/* Modal Pesan Runner */}
      <RunnerOrderModal
        isOpen={showRunnerModal}
        onClose={() => setShowRunnerModal(false)}
        onSuccess={() => alert('Pesanan Jasa Runner UNNES berhasil dibuat! Runner terdekat akan menghubungi Anda.')}
      />
    </div>
  );
};

export default DashboardPage;
