import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  MapPin, 
  UploadCloud, 
  Lock, 
  Award, 
  Send,
  Building2
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { UNNES_BUILDINGS, CATEGORIES } from '../data/initialData';
import { ImageUploadCompressor } from '../components/ImageUploadCompressor';

export const ReportPage = () => {
  const { type: urlType } = useParams();
  const navigate = useNavigate();
  const { submitItem } = useData();
  const { user } = useAuth();

  // If URL is /lapor/pilih or invalid, default to 'hilang'
  const [reportType, setReportType] = useState(
    urlType === 'temuan' ? 'temuan' : 'hilang'
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    category: 'elektronik',
    description: '',
    location_building: UNNES_BUILDINGS[0].name,
    location_floor: '',
    location_room: '',
    location_detail: '',
    hidden_details: '',
    bounty_amount: 0,
    date_lost_found: new Date().toISOString().split('T')[0]
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!formData.title.trim() || !formData.description.trim()) {
        alert('Mohon lengkapi judul dan deskripsi barang.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.location_building) {
        alert('Mohon pilih gedung lokasi barang.');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const questions = reportType === 'temuan'
      ? [
          'Sebutkan ciri khas tersembunyi yang ada pada barang ini?',
          'Sebutkan isi detail atau tanda khusus yang tidak tampak pada foto publik?'
        ]
      : [
          'Sebutkan detail tersembunyi barang milik Anda?',
          'Sebutkan isi di dalamnya atau ciri khusus untuk verifikasi?'
        ];

    try {
      const submitted = await submitItem({
        type: reportType,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        location_building: formData.location_building,
        location_floor: formData.location_floor,
        location_room: formData.location_room,
        location_detail: formData.location_detail,
        hidden_details: formData.hidden_details,
        blind_test_questions: questions,
        bounty_amount: Number(formData.bounty_amount) || 0,
        bounty_status: Number(formData.bounty_amount) > 0 ? 'aktif' : 'tidak_ada',
        photo_urls: photos,
        date_lost_found: formData.date_lost_found
      });

      setSubmitting(false);
      alert(`Laporan #${submitted?.item_code || 'LF-UNNES'} berhasil diajukan! Status: Menunggu Review Admin.`);
      navigate(`/barang/${submitted?.id || ''}`);
    } catch (err) {
      setSubmitting(false);
      console.error('Gagal mengajukan laporan:', err);
      alert('Terjadi kendala saat mengajukan laporan. Silakan coba lagi.');
    }
  };

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '1.5rem', maxWidth: '720px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Buat Laporan Baru</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Laporan Anda akan ditinjau Admin Posko UNNES sebelum ditampilkan di feed.
          </p>
        </div>
      </div>

      {/* Tipe Selector: Hilang vs Temuan */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        background: 'var(--bg-surface-alt)',
        padding: '0.35rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <button
          type="button"
          onClick={() => setReportType('hilang')}
          style={{
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            background: reportType === 'hilang' ? 'var(--danger-bg)' : 'transparent',
            color: reportType === 'hilang' ? 'var(--danger)' : 'var(--text-secondary)',
            border: reportType === 'hilang' ? '1.5px solid rgba(239, 68, 68, 0.3)' : 'none'
          }}
        >
          <AlertCircle size={16} /> Barang Hilang
        </button>

        <button
          type="button"
          onClick={() => setReportType('temuan')}
          style={{
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            background: reportType === 'temuan' ? 'var(--success-bg)' : 'transparent',
            color: reportType === 'temuan' ? 'var(--success)' : 'var(--text-secondary)',
            border: reportType === 'temuan' ? '1.5px solid rgba(16, 185, 129, 0.3)' : 'none'
          }}
        >
          <Sparkles size={16} /> Barang Temuan
        </button>
      </div>

      {/* Progress Steps Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        {[
          { num: 1, label: 'Info' },
          { num: 2, label: 'Lokasi' },
          { num: 3, label: 'Foto' },
          { num: 4, label: 'Blind Test' }
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: currentStep >= s.num ? 'var(--primary-800)' : 'var(--bg-surface-alt)',
                color: currentStep >= s.num ? '#fff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: '2px solid var(--border-light)'
              }}>
                {currentStep > s.num ? <CheckCircle2 size={16} /> : s.num}
              </div>
              <span style={{ fontSize: '0.7rem', color: currentStep >= s.num ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                {s.label}
              </span>
            </div>
            {idx < 3 && (
              <div style={{
                flex: 1,
                height: '2px',
                background: currentStep > idx + 1 ? 'var(--primary-800)' : 'var(--border-light)',
                margin: '0 0.5rem',
                transform: 'translateY(-10px)'
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Container */}
      <div className="glass-card" style={{ padding: '1.75rem', border: '1px solid var(--border-light)' }}>
        
        {/* STEP 1: INFORMASI DASAR */}
        {currentStep === 1 && (
          <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Langkah 1: Informasi Barang</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Judul Barang (Contoh: "KTM UNNES & Dompet Cokelat"):</label>
              <input
                type="text"
                required
                placeholder="Sebutkan jenis dan merk/warna barang..."
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pilih Kategori Barang:</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '0.65rem'
              }}>
                {CATEGORIES.map(c => {
                  const isSelected = formData.category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleChange('category', c.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.75rem 0.5rem',
                        borderRadius: 'var(--radius-lg)',
                        border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
                        background: isSelected ? 'var(--primary-50)' : 'var(--bg-surface)',
                        boxShadow: isSelected ? '0 4px 12px rgba(30, 58, 95, 0.15)' : 'var(--shadow-sm)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#FAF6EB',
                        border: '1px solid rgba(0,0,0,0.06)',
                        flexShrink: 0
                      }}>
                        <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: isSelected ? 700 : 600,
                        color: isSelected ? 'var(--primary-800)' : 'var(--text-primary)',
                        lineHeight: 1.2
                      }}>
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tanggal Kejadian:</label>
              <input
                type="date"
                required
                value={formData.date_lost_found}
                onChange={(e) => handleChange('date_lost_found', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Deskripsi Umum:</label>
              <textarea
                rows={3}
                required
                placeholder="Ceritakan kronologi singkat dan ciri-ciri fisik yang boleh diketahui publik..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">
                Lanjut ke Lokasi Kampus
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: LOKASI KAMPUS UNNES */}
        {currentStep === 2 && (
          <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Langkah 2: Lokasi di Lingkungan UNNES</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Gedung / Tempat Utama UNNES:</label>
              <select
                value={formData.location_building}
                onChange={(e) => handleChange('location_building', e.target.value)}
              >
                {UNNES_BUILDINGS.map(b => (
                  <option key={b.id} value={b.name}>{b.name} ({b.zone})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Lantai (Opsional):</label>
                <input
                  type="text"
                  placeholder="Misal: Lantai 2 / Lantai Dasar"
                  value={formData.location_floor}
                  onChange={(e) => handleChange('location_floor', e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ruangan / Bagian (Opsional):</label>
                <input
                  type="text"
                  placeholder="Misal: Lab Komputer D1 / Lobi"
                  value={formData.location_room}
                  onChange={(e) => handleChange('location_room', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Detail Posisi Presisi:</label>
              <input
                type="text"
                placeholder="Misal: Di atas meja baris ke-2 belakang dekat colokan..."
                value={formData.location_detail}
                onChange={(e) => handleChange('location_detail', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button type="button" onClick={handlePrev} className="btn btn-outline">
                Kembali
              </button>
              <button type="submit" className="btn btn-primary">
                Lanjut ke Upload Foto
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: UPLOAD FOTO & SENSOR */}
        {currentStep === 3 && (
          <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Langkah 3: Unggah Foto Barang</h2>

            <ImageUploadCompressor
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={4}
              label="Foto Barang (Otomatis Dikompres Ringan)"
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button type="button" onClick={handlePrev} className="btn btn-outline">
                Kembali
              </button>
              <button type="submit" className="btn btn-primary">
                Lanjut ke Data Blind Test
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: BLIND TEST & BOUNTY */}
        {currentStep === 4 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Langkah 4: Data Rahasia (Blind Test)</h2>

            {/* SOP Explanation */}
            <div style={{
              background: 'var(--primary-50)',
              border: '1px solid var(--primary-200)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              fontSize: '0.825rem',
              color: 'var(--primary-900)',
              lineHeight: 1.5
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                <Lock size={16} /> Rahasia Verifikasi Admin UNNES
              </div>
              Tuliskan ciri khas tersembunyi yang <strong>TIDAK DITAMPILKAN DI WEB</strong>. Informasi ini hanya akan dibaca oleh Admin saat memverifikasi jawaban orang yang mengaku pemilik barang.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Ciri Khas Rahasia / Isi Tersembunyi:
              </label>
              <textarea
                rows={3}
                required
                placeholder="Contoh: Ada stiker kucing di balik case, atau ada pecahan uang 20 ribuan 2 lembar di dompet..."
                value={formData.hidden_details}
                onChange={(e) => handleChange('hidden_details', e.target.value)}
              />
            </div>

            {/* Bounty Option (Especially for Lost Items) */}
            {reportType === 'hilang' && (
              <div style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--amber-50)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--amber-800)', fontSize: '0.9rem' }}>
                  <Award size={18} /> Pasang Hadiah / Bounty Sukarela (Opsional)
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--amber-700)' }}>
                  Memberikan imbalan bagi civitas atau penemu yang berhasil mengembalikan barang Anda.
                </p>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  placeholder="Jumlah hadiah, misal: 50000"
                  value={formData.bounty_amount || ''}
                  onChange={(e) => handleChange('bounty_amount', e.target.value)}
                  style={{ background: '#fff' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button type="button" onClick={handlePrev} className="btn btn-outline">
                Kembali
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ gap: '0.4rem' }}>
                <Send size={16} /> {submitting ? 'Mengirim Laporan...' : 'Kirim Laporan ke Admin'}
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
};
