import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  PackageCheck, 
  Lock, 
  Award, 
  Send,
  Building2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Check,
  Info
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

  const isPickScreen = urlType === 'pilih';

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
      alert(`Laporan #${submitted?.item_code || 'LF-UNNES'} berhasil diajukan! Status: Menunggu Verifikasi Posko.`);
      navigate(`/barang/${submitted?.id || ''}`);
    } catch (err) {
      setSubmitting(false);
      console.error('Gagal mengajukan laporan:', err);
      alert('Terjadi kendala saat mengajukan laporan. Silakan coba lagi.');
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: PILIH JENIS LAPORAN (MINIMALIST & ZERO AI SLOP)
  // -------------------------------------------------------------
  if (isPickScreen) {
    return (
      <div className="container pb-mobile-nav" style={{ paddingTop: '2.5rem', maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Navigation & Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
          
          <Link 
            to="/" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              color: 'var(--ink-500)', 
              fontSize: '0.8rem', 
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: '0.25rem'
            }}
          >
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '3px 12px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--primary-indigo)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            Layanan Pelaporan Kampus UNNES
          </div>

          <h1 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', 
            fontWeight: 700, 
            color: 'var(--ink-900)', 
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            Pilih Jenis Laporan
          </h1>

          <p style={{ fontSize: '0.9rem', color: 'var(--ink-600)', maxWidth: '520px', margin: 0, lineHeight: 1.5 }}>
            Tentukan status barang yang ingin Anda laporkan untuk membuka formulir pendataan yang sesuai.
          </p>
        </div>

        {/* Dual Choice Cards: Sleek & Tactile */}
        <div className="report-pick-container">
          
          {/* Option 1: Kehilangan */}
          <div 
            onClick={() => navigate('/lapor/hilang')}
            className="report-pick-card lost"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="report-pick-badge lost">
                  <AlertCircle size={11} strokeWidth={2.5} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                  KEHILANGAN
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-400)', fontFamily: 'var(--font-mono)' }}>
                  01
                </span>
              </div>

              <div>
                <h2 style={{ 
                  fontFamily: 'var(--font-sans)', 
                  fontSize: '1.25rem', 
                  fontWeight: 700, 
                  color: 'var(--ink-900)', 
                  margin: '0 0 0.35rem' 
                }}>
                  Saya Kehilangan Barang
                </h2>
                <p style={{ fontSize: '0.835rem', color: 'var(--ink-600)', lineHeight: 1.5, margin: 0 }}>
                  Barang pribadi Anda tertinggal di area kampus? Catat ciri-cirinya agar posko fakultas dan penemu dapat mengidentifikasinya.
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                <span style={{ 
                  fontSize: '0.72rem', 
                  color: 'var(--ink-700)', 
                  backgroundColor: 'var(--bg-surface-alt)', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  fontWeight: 500
                }}>
                  Pencocokan Otomatis
                </span>
                <span style={{ 
                  fontSize: '0.72rem', 
                  color: 'var(--ink-700)', 
                  backgroundColor: 'var(--bg-surface-alt)', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  fontWeight: 500
                }}>
                  Verifikasi Blind-Test
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'var(--danger-600)',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <span>BUAT LAPORAN KEHILANGAN</span>
                <ArrowRight size={15} />
              </div>
            </div>
          </div>

          {/* Option 2: Temuan */}
          <div 
            onClick={() => navigate('/lapor/temuan')}
            className="report-pick-card found"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="report-pick-badge found">
                  <PackageCheck size={11} strokeWidth={2.5} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                  TEMUAN
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-400)', fontFamily: 'var(--font-mono)' }}>
                  02
                </span>
              </div>

              <div>
                <h2 style={{ 
                  fontFamily: 'var(--font-sans)', 
                  fontSize: '1.25rem', 
                  fontWeight: 700, 
                  color: 'var(--ink-900)', 
                  margin: '0 0 0.35rem' 
                }}>
                  Saya Menemukan Barang
                </h2>
                <p style={{ fontSize: '0.835rem', color: 'var(--ink-600)', lineHeight: 1.5, margin: 0 }}>
                  Menemukan barang milik orang lain di kampus? Amankan dan catat ciri umumnya untuk diserahterimakan melalui posko fakultas.
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                <span style={{ 
                  fontSize: '0.72rem', 
                  color: 'var(--ink-700)', 
                  backgroundColor: 'var(--bg-surface-alt)', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  fontWeight: 500
                }}>
                  Sensor Privasi Identitas
                </span>
                <span style={{ 
                  fontSize: '0.72rem', 
                  color: 'var(--ink-700)', 
                  backgroundColor: 'var(--bg-surface-alt)', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  fontWeight: 500
                }}>
                  Berita Acara Digital (BAST)
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'var(--primary-indigo)',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <span>LAPORKAN BARANG TEMUAN</span>
                <ArrowRight size={15} />
              </div>
            </div>
          </div>

        </div>

        {/* Micro Security & Trust Note */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          fontSize: '0.785rem',
          color: 'var(--ink-500)',
          textAlign: 'center'
        }}>
          <ShieldCheck size={16} color="var(--primary-indigo)" style={{ flexShrink: 0 }} />
          <span>Foto kartu identitas (KTM, KTP, ATM) otomatis disensor sistem untuk publik demi privasi pemilik sah.</span>
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: FORM INPUT LAPORAN (MINIMALIST & STREAMLINED)
  // -------------------------------------------------------------
  const STEPS = [
    { num: 1, label: 'Identitas Barang' },
    { num: 2, label: 'Lokasi & Waktu' },
    { num: 3, label: 'Foto Dokumentasi' },
    { num: 4, label: 'Verifikasi & Selesai' }
  ];

  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '2rem', maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Header Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            type="button" 
            onClick={() => navigate('/lapor/pilih')} 
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: 'pointer',
              color: 'var(--ink-700)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.775rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
            title="Kembali ke pemilihan jenis"
          >
            <ArrowLeft size={14} /> Ganti Kategori
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
              {reportType === 'hilang' ? 'Lapor Barang Hilang' : 'Lapor Barang Temuan'}
            </h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '2px' }}>
              {reportType === 'hilang' 
                ? 'Lengkapi rincian barang Anda yang tercecer di kampus' 
                : 'Catat temuan barang untuk diamankan di posko fakultas'}
            </div>
          </div>
        </div>

        <div>
          {reportType === 'hilang' ? (
            <span className="badge badge-lost" style={{ fontSize: '0.7rem', padding: '3px 9px' }}>
              <AlertCircle size={12} strokeWidth={2.5} /> SAYA KEHILANGAN
            </span>
          ) : (
            <span className="badge badge-found" style={{ fontSize: '0.7rem', padding: '3px 9px' }}>
              <PackageCheck size={12} strokeWidth={2.5} /> SAYA MENEMUKAN
            </span>
          )}
        </div>
      </div>

      {/* Modern Stepper */}
      <div className="modern-stepper">
        {STEPS.map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className={`step-node ${currentStep === s.num ? 'active' : currentStep > s.num ? 'completed' : ''}`}>
              <div className="step-circle">
                {currentStep > s.num ? <Check size={13} strokeWidth={3} /> : s.num}
              </div>
              <span>{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`step-line ${currentStep > s.num ? 'completed' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Main Focused Form Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '2rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        
        {/* STEP 1: INFORMASI BARANG */}
        {currentStep === 1 && (
          <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
                1. Identitas &amp; Rincian Barang
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-500)', margin: '3px 0 0' }}>
                Tuliskan informasi dasar agar barang mudah dikenali dalam katalog.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-800)', marginBottom: '6px' }}>
                Nama / Judul Barang <span style={{ color: 'var(--danger-500)' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: KTM UNNES a/n Siti Nurhaliza atau Helm KYT Hitam Doff"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  fontSize: '0.9rem',
                  color: 'var(--ink-900)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-800)', marginBottom: '6px' }}>
                Kategori Barang <span style={{ color: 'var(--danger-500)' }}>*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  fontSize: '0.9rem',
                  color: 'var(--ink-900)',
                  cursor: 'pointer'
                }}
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-800)', marginBottom: '6px' }}>
                Deskripsi Fisik Umum <span style={{ color: 'var(--danger-500)' }}>*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Sebutkan warna dominan, merk, stiker yang menempel, atau kondisi fisik luar. Jangan tuliskan ciri rahasia di sini..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  fontSize: '0.9rem',
                  color: 'var(--ink-900)',
                  lineHeight: 1.5
                }}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--ink-500)', marginTop: '4px', display: 'block' }}>
                Tip: Deskripsi ini tampil di katalog publik untuk membantu pencocokan visual.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ gap: '0.45rem', fontSize: '0.85rem' }}
              >
                Lanjut: Lokasi &amp; Waktu <ArrowRight size={15} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: LOKASI & WAKTU */}
        {currentStep === 2 && (
          <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
                2. Lokasi Kampus &amp; Tanggal Kejadian
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-500)', margin: '3px 0 0' }}>
                Pilih area fakultas atau gedung tempat barang hilang atau ditemukan.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-800)', marginBottom: '6px' }}>
                Gedung / Fakultas <span style={{ color: 'var(--danger-500)' }}>*</span>
              </label>
              <select
                value={formData.location_building}
                onChange={(e) => handleChange('location_building', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  fontSize: '0.9rem',
                  color: 'var(--ink-900)',
                  cursor: 'pointer'
                }}
              >
                {UNNES_BUILDINGS.map(b => (
                  <option key={b.id || b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-800)', marginBottom: '6px' }}>
                  Lantai (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Misal: Lantai 2"
                  value={formData.location_floor}
                  onChange={(e) => handleChange('location_floor', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-800)', marginBottom: '6px' }}>
                  Ruang / Area
                </label>
                <input
                  type="text"
                  placeholder="Misal: Ruang Lab Komputer 103"
                  value={formData.location_room}
                  onChange={(e) => handleChange('location_room', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-800)', marginBottom: '6px' }}>
                Detail Posisi Presisi
              </label>
              <input
                type="text"
                placeholder="Misal: Di atas meja dosen deretan depan atau dekat colokan"
                value={formData.location_detail}
                onChange={(e) => handleChange('location_detail', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-800)', marginBottom: '6px' }}>
                Tanggal Kejadian <span style={{ color: 'var(--danger-500)' }}>*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date_lost_found}
                onChange={(e) => handleChange('date_lost_found', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button type="button" onClick={handlePrev} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                &larr; Kembali
              </button>
              <button type="submit" className="btn btn-primary" style={{ gap: '0.45rem', fontSize: '0.85rem' }}>
                Lanjut: Foto Barang <ArrowRight size={15} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: UPLOAD FOTO */}
        {currentStep === 3 && (
          <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
                3. Unggah Foto Dokumentasi
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-500)', margin: '3px 0 0' }}>
                Tambahkan foto barang untuk memudahkan identifikasi visual oleh posko.
              </p>
            </div>

            <ImageUploadCompressor
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={4}
              label="Foto Dokumentasi (Maks. 4 foto, otomatis kompresi)"
            />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: 'var(--bg-surface-alt)',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.785rem',
              color: 'var(--ink-600)'
            }}>
              <ShieldCheck size={16} color="var(--primary-indigo)" style={{ flexShrink: 0 }} />
              <span>Privasi Terjaga: Foto kartu identitas penting otomatis disensor untuk umum oleh sistem.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button type="button" onClick={handlePrev} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                &larr; Kembali
              </button>
              <button type="submit" className="btn btn-primary" style={{ gap: '0.45rem', fontSize: '0.85rem' }}>
                Lanjut: Blind-Test <ArrowRight size={15} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: BLIND TEST & BOUNTY */}
        {currentStep === 4 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
                4. Verifikasi Blind-Test &amp; Konfirmasi
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-500)', margin: '3px 0 0' }}>
                Kunci rahasia untuk mencegah klaim palsu saat serah terima di posko.
              </p>
            </div>

            {/* Secret Details for Blind Test */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-800)', marginBottom: '6px' }}>
                Ciri Rahasia Khusus (Kerahasiaan Terjamin) <span style={{ color: 'var(--danger-500)' }}>*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Contoh: Di balik casing HP ada struk ATM, atau di dompet terselip kartu Timezone..."
                value={formData.hidden_details}
                onChange={(e) => handleChange('hidden_details', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5
                }}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--ink-500)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={12} color="var(--primary-indigo)" />
                Ciri ini TIDAK ditampilkan ke publik. Hanya dipakai admin posko untuk memverifikasi pengklaim.
              </span>
            </div>

            {/* Bounty Field (Hilang) */}
            {reportType === 'hilang' && (
              <div style={{
                backgroundColor: 'var(--tag-bounty-bg)',
                border: '1px solid var(--tag-bounty-border)',
                borderRadius: '8px',
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', fontWeight: 700, color: 'var(--tag-bounty-ink)' }}>
                  <Award size={15} /> Program Apresiasi Sukarela (Opsional)
                </div>
                <p style={{ fontSize: '0.785rem', color: 'var(--ink-700)', margin: 0, lineHeight: 1.45 }}>
                  Sertakan imbalan terbuka bagi civitas yang mengembalikan barang berharga Anda.
                </p>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  placeholder="Nominal rupiah, misal: 50000 (kosongkan jika tanpa imbalan)"
                  value={formData.bounty_amount || ''}
                  onChange={(e) => handleChange('bounty_amount', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--tag-bounty-border)',
                    backgroundColor: 'var(--bg-card)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            )}

            {/* Ringkasan Singkat */}
            <div style={{
              backgroundColor: 'var(--bg-surface-alt)',
              padding: '0.85rem 1rem',
              borderRadius: '6px',
              fontSize: '0.785rem',
              color: 'var(--ink-700)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <div><strong>Barang:</strong> {formData.title || '-'} ({formData.category})</div>
              <div><strong>Lokasi:</strong> {formData.location_building}</div>
              <div><strong>Tanggal:</strong> {formData.date_lost_found}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button type="button" onClick={handlePrev} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                &larr; Kembali
              </button>
              <button 
                type="submit" 
                disabled={submitting} 
                className="btn btn-primary"
                style={{ gap: '0.45rem', fontSize: '0.85rem' }}
              >
                <Send size={14} /> {submitting ? 'Mengirim Laporan...' : 'Kirim Laporan Sekarang'}
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
};
