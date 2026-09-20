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
  Edit2
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export const OrdersPage = () => {
  const { orders, updateOrderStatus } = useData();

  const [filter, setFilter] = useState('semua');
  const [editingOrder, setEditingOrder] = useState(null);
  const [runnerName, setRunnerName] = useState('');
  const [runnerNotes, setRunnerNotes] = useState('');
  const [newStatus, setNewStatus] = useState('dalam_proses');

  const filteredOrders = orders.filter(o => {
    if (filter === 'semua') return true;
    return o.status === filter;
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingOrder) return;

    updateOrderStatus(editingOrder.id, {
      runner_name: runnerName || editingOrder.runner_name || 'Runner Shift Posko UNNES',
      runner_notes: runnerNotes,
      status: newStatus
    });

    alert('Status pesanan runner berhasil diperbarui!');
    setEditingOrder(null);
  };

  const markPaymentPaid = (orderId) => {
    updateOrderStatus(orderId, {
      payment_status: 'lunas'
    });
    alert('Status pembayaran ditandai LUNAS!');
  };

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin" className="btn btn-ghost btn-sm" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={16} /> Panel
          </Link>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Manajemen Jasa Runner UNNES</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Penugasan shift runner, tracking pengantaran barang, dan konfirmasi tarif jasa.
            </p>
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['semua', 'menunggu', 'dalam_proses', 'selesai'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`btn btn-sm ${filter === st ? 'btn-primary' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredOrders.length === 0 ? (
          <div className="glass-card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bike size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <p>Tidak ada pesanan runner dalam kategori ini.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div 
              key={order.id} 
              className="glass-card" 
              style={{ padding: '1.25rem', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                      #{order.item_code}
                    </span>
                    <span className="badge badge-review" style={{ textTransform: 'capitalize', fontSize: '0.65rem' }}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className={`badge ${order.payment_status === 'lunas' ? 'badge-found' : 'badge-lost'}`} style={{ fontSize: '0.65rem' }}>
                      {order.payment_status === 'lunas' ? 'Lunas' : 'Belum Bayar'}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>
                    {order.item_title}
                  </h2>

                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Pemesan: <strong>{order.requester_name}</strong> • WhatsApp: {order.requester_phone || '-'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {order.payment_status !== 'lunas' && (
                    <button
                      onClick={() => markPaymentPaid(order.id)}
                      className="btn btn-teal btn-sm"
                    >
                      Tandai Lunas
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingOrder(order);
                      setRunnerName(order.runner_name || '');
                      setRunnerNotes(order.runner_notes || '');
                      setNewStatus(order.status);
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ gap: '0.3rem' }}
                  >
                    <Edit2 size={13} /> Update Status Runner
                  </button>
                </div>
              </div>

              {/* Delivery Details Route */}
              <div style={{
                padding: '0.75rem 1rem',
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
                  <div style={{ fontWeight: 700, color: 'var(--primary-800)' }}>Rp {order.fee_amount.toLocaleString('id-ID')}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Runner Ditugaskan:</span>
                  <div style={{ fontWeight: 600 }}>🏃 {order.runner_name || 'Belum ditugaskan'}</div>
                </div>
              </div>

              {order.runner_notes && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Catatan Progres: <em>"{order.runner_notes}"</em>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Update Runner Status Modal */}
      {editingOrder && (
        <div className="modal-backdrop" onClick={() => setEditingOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Update Penugasan Runner (#{editingOrder.item_code})
            </h3>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nama Runner Mahasiswa:</label>
                <input
                  type="text"
                  placeholder="Misal: Mas Agil (Shift Pagi Sekaran)"
                  value={runnerName}
                  onChange={(e) => setRunnerName(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Status Pengantaran:</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="menunggu">Menunggu Penugasan</option>
                  <option value="diterima">Pesanan Diterima Runner</option>
                  <option value="dalam_proses">Runner Sedang OTW Menuju Lokasi</option>
                  <option value="selesai">Selesai (Sudah Diterima Pemilik)</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Catatan Progres / Lokasi:</label>
                <input
                  type="text"
                  placeholder="Contoh: Sudah mengambil barang dari satpam, sedang menuju lobi FMIPA..."
                  value={runnerNotes}
                  onChange={(e) => setRunnerNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
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
