import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Camera, 
  Save, 
  FileText, 
  Bike, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Edit3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { uploadImageFile } from '../lib/storageService';
import { ItemCard } from '../components/ItemCard';
import { getRunnerStatusInfo } from '../data/initialData';

export const ProfilePage = () => {
  const { user, isAdmin, updateProfile, switchDemoAccount } = useAuth();
  const { items, orders } = useData();

  const [activeTab, setActiveTab] = useState('laporan');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    nim: user?.nim || '',
    fakultas: user?.fakultas || 'FMIPA',
    prodi: user?.prodi || ''
  });

  const myReports = items.filter(i => i.user_id === user?.id);
  const myOrders = orders.filter(o => o.requester_id === user?.id);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImageFile(file, 'avatars');
      updateProfile({ avatar_url: url });
      alert('Foto profil berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal mengunggah foto profil.');
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaving(true);
    updateProfile(profileData);
    setSaving(false);
    setEditing(false);
    alert('Profil berhasil diperbarui!');
  };

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.5rem', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Profile Header Card */}
      <div className="glass-card" style={{ padding: '1.75rem', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {/* Avatar with Camera upload button */}
            <div style={{ position: 'relative' }}>
              <img 
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'} 
                alt={user?.full_name} 
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-700)' }}
              />
              <label 
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'var(--primary-700)',
                  color: '#fff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
                title="Ubah Foto Profil"
              >
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                <Camera size={14} />
              </label>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{user?.full_name}</h1>
                <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-found'}`}>
                  {isAdmin ? '🛡️ Administrator Posko' : '🎓 Mahasiswa UNNES'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                NIM: {user?.nim || 'Belum diisi'} • {user?.fakultas || 'UNNES'} ({user?.prodi || 'Program Studi'})
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                {user?.bio || 'Civitas akademika Universitas Negeri Semarang.'}
              </p>
            </div>
          </div>

          {/* Edit Profile Toggle Button */}
          <button 
            onClick={() => setEditing(!editing)} 
            className="btn btn-outline btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <Edit3 size={14} /> {editing ? 'Tutup Edit' : 'Edit Profil'}
          </button>

        </div>

        {/* Edit Form Drawer */}
        {editing && (
          <form onSubmit={handleSaveProfile} style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Pengaturan Data Profil Mahasiswa</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nama Lengkap:</label>
                <input 
                  type="text" 
                  required 
                  value={profileData.full_name} 
                  onChange={(e) => setProfileData(p => ({ ...p, full_name: e.target.value }))} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>NIM Mahasiswa:</label>
                <input 
                  type="text" 
                  value={profileData.nim} 
                  onChange={(e) => setProfileData(p => ({ ...p, nim: e.target.value }))} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fakultas:</label>
                <select 
                  value={profileData.fakultas} 
                  onChange={(e) => setProfileData(p => ({ ...p, fakultas: e.target.value }))}
                >
                  {['FMIPA', 'FT', 'FBS', 'FEB', 'FIP', 'FISIP', 'FIK', 'FKK', 'FH'].map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Program Studi:</label>
                <input 
                  type="text" 
                  value={profileData.prodi} 
                  onChange={(e) => setProfileData(p => ({ ...p, prodi: e.target.value }))} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nomor WhatsApp:</label>
                <input 
                  type="tel" 
                  placeholder="08xxxxxxxxxx"
                  value={profileData.phone} 
                  onChange={(e) => setProfileData(p => ({ ...p, phone: e.target.value }))} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Bio Singkat:</label>
                <input 
                  type="text" 
                  value={profileData.bio} 
                  onChange={(e) => setProfileData(p => ({ ...p, bio: e.target.value }))} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setEditing(false)} className="btn btn-outline btn-sm">Batal</button>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
                <Save size={14} /> Simpan Perubahan
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tabs: Laporan Saya vs Pesanan Runner */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border-light)', gap: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('laporan')}
          style={{
            padding: '0.65rem 0.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'laporan' ? 'var(--primary-700)' : 'var(--text-muted)',
            borderBottom: activeTab === 'laporan' ? '3px solid var(--primary-700)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <FileText size={18} /> Laporan Saya ({myReports.length})
        </button>

        <button
          onClick={() => setActiveTab('pesanan')}
          style={{
            padding: '0.65rem 0.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'pesanan' ? 'var(--primary-700)' : 'var(--text-muted)',
            borderBottom: activeTab === 'pesanan' ? '3px solid var(--primary-700)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Bike size={18} /> Pesanan Jasa Runner ({myOrders.length})
        </button>
      </div>

      {/* Content Tab 1: My Reports */}
      {activeTab === 'laporan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myReports.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>Anda belum pernah mengajukan laporan barang hilang atau temuan.</p>
              <Link to="/lapor/pilih" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                Buat Laporan Sekarang
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.25rem'
            }}>
              {myReports.map(item => (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Status Banner above card */}
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.35rem 0.75rem',
                    borderTopLeftRadius: 'var(--radius-md)',
                    borderTopRightRadius: 'var(--radius-md)',
                    background: item.post_status === 'disetujui' ? 'var(--teal-50)' : item.post_status === 'ditolak' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                    color: item.post_status === 'disetujui' ? 'var(--teal-700)' : item.post_status === 'ditolak' ? 'var(--danger)' : 'var(--amber-700)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    {item.post_status === 'disetujui' ? <CheckCircle2 size={13} /> : item.post_status === 'ditolak' ? <XCircle size={13} /> : <Clock size={13} />}
                    Status: {item.post_status === 'disetujui' ? 'Tayang di Feed Publik' : item.post_status === 'ditolak' ? `Ditolak: ${item.rejection_reason}` : 'Menunggu Review Admin'}
                  </div>
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Tab 2: Runner Orders */}
      {activeTab === 'pesanan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          {/* Admin Banner for Runner Service Management */}
          {isAdmin && (
            <div className="glass-card" style={{
              padding: '1rem 1.25rem',
              background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.08) 0%, rgba(13, 148, 136, 0.12) 100%)',
              border: '1.5px solid var(--teal-600)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--teal-600)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)',
                  flexShrink: 0
                }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.925rem', color: 'var(--primary-900)' }}>
                    Mode Administrator Posko Jasa Runner
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                    Kelola penugasan shift runner kampus, perbarui status OTW/Selesai, dan konfirmasi tarif jasa secara terpusat di Panel Admin.
                  </div>
                </div>
              </div>
              <Link 
                to="/admin/pesanan" 
                className="btn btn-teal btn-sm"
                style={{ gap: '0.4rem', fontWeight: 700 }}
              >
                <Bike size={16} /> Kelola di Panel Admin
              </Link>
            </div>
          )}

          {myOrders.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>Belum ada riwayat pesanan jasa runner kampus.</p>
              {isAdmin && (
                <Link to="/admin/pesanan" className="btn btn-teal btn-sm" style={{ marginTop: '0.75rem', gap: '0.35rem' }}>
                  <Bike size={15} /> Lihat Semua Pesanan di Panel Admin
                </Link>
              )}
            </div>
          ) : (
            myOrders.map(o => {
              const statusInfo = getRunnerStatusInfo(o.status);
              return (
                <div 
                  key={o.id} 
                  className="glass-card" 
                  style={{ 
                    padding: '1.25rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem', 
                    border: '1px solid var(--border-light)',
                    borderLeft: `4px solid ${statusInfo.border || 'var(--teal-600)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{o.item_title}</span>
                      <span className={`badge ${statusInfo.badgeClass}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                        {statusInfo.fullLabel || statusInfo.label}
                      </span>
                    </div>
                  {isAdmin && (
                    <Link
                      to="/admin/pesanan"
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', gap: '0.35rem' }}
                    >
                      <Bike size={13} /> Kelola di Panel Admin
                    </Link>
                  )}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  📍 Ambil: <strong>{o.pickup_location}</strong> ➔ Antar ke: <strong>{o.delivery_location}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Biaya: <strong>Rp {o.fee_amount.toLocaleString('id-ID')}</strong> ({o.payment_method.replace('_', ' ')}) • Runner: {o.runner_name || 'Menunggu penugasan'}
                </div>
                  {o.runner_notes && (
                    <div style={{ fontSize: '0.78rem', background: 'var(--bg-surface-alt)', padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
                      Catatan Runner: {o.runner_notes}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
