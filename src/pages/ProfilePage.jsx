import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  Save, 
  FileText, 
  Bike, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Edit3,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { uploadImageFile } from '../lib/storageService';
import { ItemCard } from '../components/ItemCard';
import { getRunnerStatusInfo } from '../data/initialData';
import { StatusBadge } from '../components/StatusBadge';

export const ProfilePage = () => {
  const { user, isAdmin, updateProfile } = useAuth();
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

  const myReports = (items || []).filter(i => i.user_id === user?.id);
  const myOrders = (orders || []).filter(o => o.requester_id === user?.id);

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
    <div style={{ background: 'var(--bg-canvas)', minHeight: 'calc(100vh - 72px)', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Profile Header Card */}
        <div className="archive-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              {/* Avatar with Camera upload button */}
              <div style={{ position: 'relative' }}>
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user?.full_name}
                    style={{ width: '84px', height: '84px', borderRadius: '6px', objectFit: 'cover', border: '2px solid var(--border-subtle)', background: 'var(--ink-100)' }}
                  />
                ) : (
                  <div style={{ width: '84px', height: '84px', borderRadius: '6px', border: '2px solid var(--border-subtle)', background: 'var(--primary-indigo)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700 }}>
                    {(user?.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <label 
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    right: '-6px',
                    background: 'var(--primary-indigo)',
                    color: '#FFFFFF',
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.4)'
                  }}
                  title="Ubah Foto Profil"
                >
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                  <Camera size={13} />
                </label>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--ink-900)', margin: 0 }}>
                    {user?.full_name}
                  </h1>
                  <span style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.68rem', 
                    fontWeight: 700, 
                    padding: '0.2rem 0.55rem', 
                    borderRadius: '4px', 
                    background: isAdmin ? 'var(--primary-indigo)' : 'var(--tag-found-bg)', 
                    color: isAdmin ? '#FFFFFF' : 'var(--tag-found-ink)',
                    border: `1px solid ${isAdmin ? 'var(--primary-indigo)' : 'var(--tag-found-border)'}`
                  }}>
                    {isAdmin ? 'PETUGAS LOST & FOUND' : 'MAHASISWA UNNES'}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ink-500)', marginTop: '0.35rem' }}>
                  NIM: {user?.nim || 'Belum diisi'} · {user?.fakultas || 'UNNES'} ({user?.prodi || 'Program Studi'})
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-700)', marginTop: '0.45rem', margin: 0, lineHeight: 1.5 }}>
                  {user?.bio || 'Civitas akademika Universitas Negeri Semarang.'}
                </p>
              </div>
            </div>

            {/* Edit Profile Toggle Button */}
            <button 
              onClick={() => setEditing(!editing)} 
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
            >
              <Edit3 size={14} /> {editing ? 'TUTUP FORM' : 'EDIT BIODATA'}
            </button>

          </div>

          {/* Edit Form Drawer */}
          {editing && (
            <form onSubmit={handleSaveProfile} style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.06em', color: 'var(--ink-500)', textTransform: 'uppercase' }}>
                PERBARUI BIODATA CIVITAS AKADEMIKA
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-700)' }}>NAMA LENGKAP:</label>
                  <input 
                    type="text" 
                    required 
                    value={profileData.full_name} 
                    onChange={(e) => setProfileData(p => ({ ...p, full_name: e.target.value }))} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-700)' }}>NIM MAHASISWA:</label>
                  <input 
                    type="text" 
                    value={profileData.nim} 
                    onChange={(e) => setProfileData(p => ({ ...p, nim: e.target.value }))} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-700)' }}>FAKULTAS:</label>
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
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-700)' }}>PROGRAM STUDI:</label>
                  <input 
                    type="text" 
                    value={profileData.prodi} 
                    onChange={(e) => setProfileData(p => ({ ...p, prodi: e.target.value }))} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-700)' }}>NOMOR WHATSAPP:</label>
                  <input 
                    type="tel" 
                    placeholder="08xxxxxxxxxx"
                    value={profileData.phone} 
                    onChange={(e) => setProfileData(p => ({ ...p, phone: e.target.value }))} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-700)' }}>BIO SINGKAT:</label>
                  <input 
                    type="text" 
                    value={profileData.bio} 
                    onChange={(e) => setProfileData(p => ({ ...p, bio: e.target.value }))} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
                  BATAL
                </button>
                <button type="submit" disabled={saving} className="btn-dark" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                  <Save size={14} /> SIMPAN BIODATA
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Tabs: Laporan Saya vs Pesanan Runner */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('laporan')}
            className={`filter-chip ${activeTab === 'laporan' ? 'active' : ''}`}
            style={{ fontSize: '0.8rem' }}
          >
            LAPORAN SAYA ({myReports.length})
          </button>

          <button
            onClick={() => setActiveTab('pesanan')}
            className={`filter-chip ${activeTab === 'pesanan' ? 'active' : ''}`}
            style={{ fontSize: '0.8rem' }}
          >
            PESANAN RUNNER ({myOrders.length})
          </button>
        </div>

        {/* Content Tab 1: My Reports */}
        {activeTab === 'laporan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myReports.length === 0 ? (
              <div className="archive-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
                <FileText size={36} color="var(--ink-500)" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--ink-900)', fontWeight: 600 }}>
                  Belum Ada Laporan Terdaftar
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-700)', marginTop: '0.35rem', marginBottom: '1.5rem' }}>
                  Laporkan barang yang hilang atau Anda temukan di lingkungan kampus UNNES.
                </p>
                <Link to="/lapor/pilih" className="btn-dark" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
                  BUAT LAPORAN SEKARANG <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.25rem'
              }}>
                {myReports.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Tab 2: Runner Orders */}
        {activeTab === 'pesanan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myOrders.length === 0 ? (
              <div className="archive-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
                <Bike size={36} color="var(--ink-500)" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--ink-900)', fontWeight: 600 }}>
                  Belum Ada Pesanan Runner
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-700)', marginTop: '0.35rem' }}>
                  Riwayat penugasan runner kampus akan tercatat di sini.
                </p>
              </div>
            ) : (
              myOrders.map(o => {
                const statusInfo = getRunnerStatusInfo(o.status);
                return (
                  <div 
                    key={o.id} 
                    className="archive-card" 
                    style={{ 
                      padding: '1.25rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.65rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--ink-900)' }}>
                          {o.item_title}
                        </span>
                        <span className={`badge ${statusInfo.badgeClass}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                          {statusInfo.fullLabel || statusInfo.label}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-500)' }}>
                        #{o.item_code}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.825rem', color: 'var(--ink-700)' }}>
                      📍 Ambil: <strong>{o.pickup_location}</strong> ➔ Antar ke: <strong>{o.delivery_location}</strong>
                    </div>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-500)' }}>
                      Biaya: Rp {o.fee_amount.toLocaleString('id-ID')} · Runner: {o.runner_name || 'Menunggu penugasan tim'}
                    </div>

                    {o.runner_notes && (
                      <div style={{ fontSize: '0.78rem', background: 'rgba(15, 23, 42, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '2px', color: 'var(--ink-700)' }}>
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
    </div>
  );
};

export default ProfilePage;
