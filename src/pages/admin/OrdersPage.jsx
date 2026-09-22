import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bike, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  DollarSign, 
  User, 
  ArrowLeft,
  Edit2,
  Trash2,
  MessageCircle,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { AdminNavTabs } from '../../components/AdminNavTabs';

export const OrdersPage = () => {
  const { orders, updateOrderStatus, deleteOrder } = useData();

  const [filter, setFilter] = useState('semua');
  const [editingOrder, setEditingOrder] = useState(null);
  const [runnerName, setRunnerName] = useState('');
  const [runnerNotes, setRunnerNotes] = useState('');
  const [newStatus, setNewStatus] = useState('dalam_proses');
  const [newPaymentStatus, setNewPaymentStatus] = useState('belum_bayar');

  // Metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'menunggu').length;
  const inProgressOrders = orders.filter(o => o.status === 'dalam_proses' || o.status === 'diterima').length;
  const completedOrders = orders.filter(o => o.status === 'selesai').length;
  const totalRevenue = orders
    .filter(o => o.status === 'selesai' || o.payment_status === 'lunas')
    .reduce((sum, o) => sum + (o.fee_amount || 0), 0);

  const filteredOrders = orders.filter(o => {
    if (filter === 'semua') return true;
    if (filter === 'dalam_proses') return o.status === 'dalam_proses' || o.status === 'diterima';
    return o.status === filter;
  });

  const runnerPresets = [
    'Runner Shift Posko UNNES',
    'Mas Agil (Shift Pagi Sekaran)',
    'Mbak Nisa (Shift Siang)',
    'Tim Runner Posko Gedung Digital',
    'Pak Joko (Satpam Gerbang Utama)'
  ];

  const handleOpenEdit = (order) => {
    setEditingOrder(order);
    setRunnerName(order.runner_name || '');
    setRunnerNotes(order.runner_notes || '');
    setNewStatus(order.status || 'dalam_proses');
    setNewPaymentStatus(order.payment_status || 'belum_bayar');
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingOrder) return;

    updateOrderStatus(editingOrder.id, {
      runner_name: runnerName.trim() || 'Runner Shift Posko UNNES',
      runner_notes: runnerNotes.trim(),
      status: newStatus,
      payment_status: newPaymentStatus
    });

    alert('Status penugasan runner berhasil diperbarui!');
    setEditingOrder(null);
  };

  const togglePaymentStatus = (order) => {
    const nextStatus = order.payment_status === 'lunas' ? 'belum_bayar' : 'lunas';
    updateOrderStatus(order.id, {
      payment_status: nextStatus
    });
    alert(`Status pembayaran diubah menjadi: ${nextStatus === 'lunas' ? 'LUNAS' : 'BELUM BAYAR'}`);
  };

  const handleDelete = (order) => {
    const confirm = window.confirm(`Hapus pesanan runner #${order.item_code} (${order.item_title})?`);
    if (confirm && deleteOrder) {
      deleteOrder(order.id);
      alert('Pesanan berhasil dihapus.');
    }
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
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Manajemen Jasa Runner UNNES</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Penugasan shift runner mahasiswa, tracking pengantaran barang, dan konfirmasi tarif posko.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'semua', label: 'Semua', count: totalOrders },
            { id: 'menunggu', label: 'Menunggu', count: pendingOrders },
            { id: 'dalam_proses', label: 'Proses / OTW', count: inProgressOrders },
            { id: 'selesai', label: 'Selesai', count: completedOrders }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`btn btn-sm ${filter === tab.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ gap: '0.35rem' }}
            >
              <span>{tab.label}</span>
              <span style={{
                background: filter === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-alt)',
                color: filter === tab.id ? '#fff' : 'var(--text-secondary)',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid var(--primary-600)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Pesanan</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>{totalOrders}</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid var(--amber-500)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Menunggu Penugasan</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--amber-600)' }}>{pendingOrders}</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid var(--teal-600)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sedang Proses / OTW</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--teal-600)' }}>{inProgressOrders}</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid var(--success)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Selesai Diantar</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--success)' }}>{completedOrders}</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Tarif Terkonfirmasi</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.2rem', color: '#6d28d9' }}>
            Rp {totalRevenue.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredOrders.length === 0 ? (
          <div className="glass-card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bike size={44} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Tidak ada pesanan runner dalam kategori ini.</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Pesanan baru dari mahasiswa akan muncul secara otomatis di sini dan di notifikasi Anda.
            </p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const rawPhone = (order.requester_phone || '').replace(/\D/g, '');
            const waNumber = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : rawPhone;
            const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo ${order.requester_name}, saya Tim Posko UNNES Lost & Found terkait pesanan jasa runner barang "${order.item_title}" (Kode #${order.item_code}).`)}` : null;

            return (
              <div 
                key={order.id} 
                className="glass-card" 
                style={{ padding: '1.25rem', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                        #{order.item_code}
                      </span>
                      <span className="badge badge-review" style={{ textTransform: 'capitalize', fontSize: '0.65rem' }}>
                        {order.status.replace('_', ' ')}
                      </span>
                      <span className={`badge ${order.payment_status === 'lunas' ? 'badge-found' : 'badge-lost'}`} style={{ fontSize: '0.65rem' }}>
                        {order.payment_status === 'lunas' ? 'Lunas' : 'Belum Bayar'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.3rem' }}>
                      {order.item_title}
                    </h2>

                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      Pemesan: <strong>{order.requester_name}</strong> • Telepon / WA: {order.requester_phone || '-'}
                    </div>
                  </div>

                  {/* Actions Header */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm"
                        style={{
                          background: '#25D366',
                          color: '#fff',
                          gap: '0.3rem',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                        title="Chat WhatsApp Pemesan"
                      >
                        <MessageCircle size={14} /> Hubungi Pemesan
                      </a>
                    )}

                    <button
                      onClick={() => togglePaymentStatus(order)}
                      className={`btn btn-sm ${order.payment_status === 'lunas' ? 'btn-outline' : 'btn-teal'}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {order.payment_status === 'lunas' ? 'Tandai Belum Lunas' : 'Tandai Lunas'}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(order)}
                      className="btn btn-primary btn-sm"
                      style={{ gap: '0.3rem', fontSize: '0.75rem' }}
                    >
                      <Edit2 size={13} /> Update Status Runner
                    </button>

                    <button
                      onClick={() => handleDelete(order)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger)', padding: '0.4rem' }}
                      title="Hapus Pesanan"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Delivery Details Route */}
                <div style={{
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                  fontSize: '0.825rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Titik Ambil:</span>
                    <div style={{ fontWeight: 600 }}>📍 {order.pickup_location}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Titik Antar:</span>
                    <div style={{ fontWeight: 600 }}>🎯 {order.delivery_location}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Tarif Jasa:</span>
                    <div style={{ fontWeight: 700, color: 'var(--primary-800)' }}>Rp {order.fee_amount?.toLocaleString('id-ID')} ({order.payment_method?.replace('_', ' ') || 'tunai'})</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Runner Ditugaskan:</span>
                    <div style={{ fontWeight: 600, color: order.runner_name ? 'var(--text-primary)' : 'var(--amber-600)' }}>
                      🏃 {order.runner_name || 'Menunggu Penugasan'}
                    </div>
                  </div>
                </div>

                {order.runner_notes && (
                  <div style={{ fontSize: '0.8rem', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Catatan Progres Runner:</strong> "{order.runner_notes}"
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Update Runner Status Modal */}
      {editingOrder && (
        <div className="modal-backdrop" onClick={() => setEditingOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem', maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  Kelola Penugasan Runner
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Kode Barang: #{editingOrder.item_code} • {editingOrder.item_title}
                </p>
              </div>
              <button onClick={() => setEditingOrder(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              {/* Runner Selection & Presets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Nama Runner / Petugas Shift:</label>
                <input
                  type="text"
                  placeholder="Misal: Mas Agil (Shift Pagi Sekaran)"
                  value={runnerName}
                  onChange={(e) => setRunnerName(e.target.value)}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  {runnerPresets.map(preset => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setRunnerName(preset)}
                      style={{
                        fontSize: '0.68rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: runnerName === preset ? 'var(--primary-100)' : 'var(--bg-surface-alt)',
                        color: runnerName === preset ? 'var(--primary-800)' : 'var(--text-secondary)',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Status Pengantaran:</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ width: '100%' }}>
                  <option value="menunggu">Menunggu Penugasan</option>
                  <option value="diterima">Pesanan Diterima Runner</option>
                  <option value="dalam_proses">Runner Sedang OTW Menuju Lokasi</option>
                  <option value="selesai">Selesai (Sudah Diterima Pemilik)</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>

              {/* Payment Status Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Status Pembayaran:</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="payment_status"
                      value="belum_bayar"
                      checked={newPaymentStatus === 'belum_bayar'}
                      onChange={() => setNewPaymentStatus('belum_bayar')}
                    />
                    <span>Belum Bayar</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="payment_status"
                      value="lunas"
                      checked={newPaymentStatus === 'lunas'}
                      onChange={() => setNewPaymentStatus('lunas')}
                    />
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>Lunas</span>
                  </label>
                </div>
              </div>

              {/* Runner Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Catatan Progres / Lokasi:</label>
                <input
                  type="text"
                  placeholder="Contoh: Sudah mengambil barang dari satpam, sedang otw ke lobi FMIPA..."
                  value={runnerNotes}
                  onChange={(e) => setRunnerNotes(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEditingOrder(null)} className="btn btn-outline btn-sm">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

