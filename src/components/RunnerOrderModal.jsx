import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bike, Lock } from 'lucide-react';
import { UNNES_BUILDINGS } from '../data/initialData';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export const RunnerOrderModal = ({ item, isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { createOrder, matches, claims } = useData();
  const { user } = useAuth();

  const isFoundItem = item?.type === 'temuan';
  const isItemOwner = Boolean(user && item?.user_id && user.id === item.user_id);
  const isVerifiedForThisItem = !isFoundItem || isItemOwner || 
    matches?.some(m => m.item_id === item?.id && (m.owner_id === user?.id || m.finder_id === user?.id)) ||
    claims?.some(c => c.item_id === item?.id && (c.claimer_id === user?.id || (user?.email && c.claimer_email?.toLowerCase() === user.email.toLowerCase())) && c.status === 'disetujui');

  const [serviceType, setServiceType] = useState('pickup_delivery');
  const [pickupLocation, setPickupLocation] = useState(item?.location_building || UNNES_BUILDINGS[0].name);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;
  if (!user) {
    onClose();
    navigate('/masuk');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFoundItem && !isVerifiedForThisItem) {
      alert('Pemesanan dibatalkan: Anda wajib melakukan verifikasi kepemilikan via Blind Test terlebih dahulu untuk barang temuan ini.');
      return;
    }

    if (!deliveryLocation.trim()) {
      alert('Mohon isi lokasi pengantaran / titik temu Anda di kampus UNNES.');
      return;
    }

    setSubmitting(true);
    try {
      await createOrder({
        item_id: item?.item_id || (item?.id && !item?.match_id ? item.id : null),
        match_id: item?.match_id || null,
        item_title: item?.title || 'Pengambilan Barang Kampus',
        item_code: item?.item_code || 'LF-RUNNER',
        service_type: serviceType,
        pickup_location: pickupLocation,
        delivery_location: deliveryLocation,
        requester_phone: phone,
        runner_notes: notes
      });

      setSubmitting(false);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saat membuat pesanan runner:', err);
      setSubmitting(false);
      alert('Terjadi kesalahan saat mengirim pesanan runner. Silakan coba lagi.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ 
              background: 'var(--amber-100)', 
              color: 'var(--amber-700)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.5rem',
              display: 'flex'
            }}>
              <Bike size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Pesan Jasa Runner UNNES</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Pengantaran & Pengambilan Barang Resmi Kampus
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Blueprint Model Promo */}
        <div style={{ 
          background: 'var(--warning-bg)', 
          border: '1px solid rgba(245, 158, 11, 0.3)', 
          borderRadius: 'var(--radius-md)', 
          padding: '0.75rem', 
          fontSize: '0.8rem', 
          color: 'var(--amber-700)',
          marginBottom: '1rem'
        }}>
          <strong>Garansi "No Find, No Fee":</strong> Jika barang tidak ditemukan di lokasi, Anda bebas biaya! Pembayaran dilakukan langsung saat serah terima barang (Cash / QRIS).
        </div>

        {/* Peringatan jika barang temuan belum lolos blind test */}
        {isFoundItem && !isVerifiedForThisItem && (
          <div style={{ 
            background: 'var(--danger-bg)', 
            border: '1.5px solid rgba(239, 68, 68, 0.4)', 
            borderRadius: 'var(--radius-md)', 
            padding: '0.85rem 1rem', 
            fontSize: '0.825rem', 
            color: 'var(--danger)',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
              <Lock size={18} />
              <span>Verifikasi Blind Test Diperlukan</span>
            </div>
            <p style={{ margin: 0, lineHeight: 1.45 }}>
              Untuk keamanan barang temuan (#{item?.item_code}), pemesanan Runner hanya dapat diproses setelah Anda menyelesaikan dan disetujui melalui verifikasi <strong>Blind Test</strong> untuk membuktikan kepemilikan Anda.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Layanan Option */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pilih Jenis Layanan:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div 
                onClick={() => setServiceType('pickup_delivery')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: serviceType === 'pickup_delivery' ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
                  background: serviceType === 'pickup_delivery' ? 'var(--primary-50)' : 'var(--bg-surface)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-800)' }}>
                  📦 Ambil & Antar
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Tarif: <strong>Rp 8.000</strong>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Runner ambil dari penemu/satpam lalu diantar ke Anda
                </div>
              </div>

              <div 
                onClick={() => setServiceType('active_hunting')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: serviceType === 'active_hunting' ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
                  background: serviceType === 'active_hunting' ? 'var(--primary-50)' : 'var(--bg-surface)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-800)' }}>
                  🔍 Active Hunting
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Tarif: <strong>Rp 15.000</strong>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Pencarian teliti ke ruang kelas, koordinasi satpam/CCTV
                </div>
              </div>
            </div>
          </div>

          {/* Lokasi Ambil */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Lokasi Pengambilan Barang:</label>
            <select
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              style={{ width: '100%' }}
            >
              {UNNES_BUILDINGS.map(b => (
                <option key={b.id} value={b.name}>{b.name} ({b.zone})</option>
              ))}
            </select>
          </div>

          {/* Lokasi Antar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Lokasi Pengantaran (Titik Temu Anda di UNNES):</label>
            <input
              type="text"
              required
              placeholder="Misal: Gedung D1 FMIPA Lantai 2 / Gazebo FISIP"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Nomor WhatsApp */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nomor WhatsApp Aktif:</label>
            <input
              type="tel"
              required
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Catatan Tambahan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Catatan Tambahan untuk Runner:</label>
            <input
              type="text"
              placeholder="Contoh: Tolong hubungi saat sudah sampai di lobi..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '0.75rem', 
            paddingTop: '0.75rem', 
            borderTop: '1px solid var(--border-light)' 
          }}>
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
              Batal
            </button>
            {isFoundItem && !isVerifiedForThisItem ? (
              <button 
                type="button" 
                disabled 
                className="btn btn-outline btn-sm"
                style={{ opacity: 0.65, cursor: 'not-allowed', gap: '0.4rem' }}
                title="Wajib lulus verifikasi Blind Test terlebih dahulu"
              >
                <Lock size={14} color="var(--amber-600)" /> Wajib Verifikasi Blind Test Dahulu
              </button>
            ) : (
              <button type="submit" disabled={submitting} className="btn btn-accent btn-sm">
                {submitting ? 'Memproses...' : 'Pesan Runner Sekarang'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
