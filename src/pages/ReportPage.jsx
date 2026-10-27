import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  CheckCircle2, 
  AlertCircle, 
  PackageCheck, 
  Lock, 
  Award, 
  Send,
  Building2,
  FileText
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
      alert(`Laporan #${submitted?.item_code || 'LF-UNNES'} berhasil diajukan! Status: Menunggu Review Admin.`);
      navigate(`/barang/${submitted?.id || ''}`);
    } catch (err) {
      setSubmitting(false);
      console.error('Gagal mengajukan laporan:', err);
      alert('Terjadi kendala saat mengajukan laporan. Silakan coba lagi.');
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: 04 Lapor — Pilih Jenis (Desktop)
  // -------------------------------------------------------------
  if (isPickScreen) {
    return (
      <div className="container pb-mobile-nav" style={{ paddingTop: '3rem', maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-500)'
          }}>
            BUAT LAPORAN BARU &bull; UNNES LOST &amp; FOUND
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
            Pilih Jenis Laporan Anda
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--ink-700)', maxWidth: '580px', margin: 0 }}>
            Tentukan apakah Anda sedang mencari barang milik Anda yang hilang, atau ingin mengamankan barang tercecer yang Anda temukan di kampus.
          </p>
        </div>

        {/* Two Big Choice Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem'
        }}>
          {/* Option 1: Hilang */}
          <div 
            onClick={() => navigate('/lapor/hilang')}
            className="archive-card"
            style={{
              padding: '2rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.15rem',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-lost">
                <AlertCircle size={12} strokeWidth={2.5} /> KATEGORI 01 • KEHILANGAN
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-500)' }}>
                FORM LAPORAN
              </span>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink-900)', margin: '0 0 0.4rem' }}>
                Saya Kehilangan Barang
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-700)', lineHeight: 1.6, margin: 0 }}>
                Laporkan barang milik Anda yang tertinggal atau tercecer di area UNNES agar seluruh civitas kampus dan posko keamanan dapat mengenali dan membantu menemukan.
              </p>
            </div>

            <div style={{
              background: 'var(--bg-app)',
              padding: '0.75rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              color: 'var(--ink-700)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <div>• Notifikasi real-time saat posko menemukan barang serupa</div>
              <div>• Verifikasi blind test rahasia mencegah klaim pihak tak bertanggung jawab</div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-outline"
                style={{
                  width: '100%',
                  borderColor: 'var(--tag-lost-border)',
                  color: 'var(--tag-lost-ink)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700
                }}
              >
                BUAT LAPORAN KEHILANGAN &rarr;
              </button>
            </div>
          </div>

          {/* Option 2: Temuan */}
          <div 
            onClick={() => navigate('/lapor/temuan')}
            className="archive-card"
            style={{
              padding: '2rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.15rem',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-found">
                <PackageCheck size={12} strokeWidth={2.5} /> KATEGORI 02 • PENEMUAN
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-500)' }}>
                POSKO KAMPUS
              </span>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink-900)', margin: '0 0 0.4rem' }}>
                Saya Menemukan Barang
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-700)', lineHeight: 1.6, margin: 0 }}>
                Anda memegang barang milik orang lain? Laporkan ciri umumnya ke platform tanpa membocorkan ciri rahasia untuk diverifikasi via blind-test kepemilikan.
              </p>
            </div>

            <div style={{
              background: 'var(--bg-app)',
              padding: '0.75rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              color: 'var(--ink-700)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <div>• Sensor otomatis foto kartu berharga (KTM/SIM/ATM) demi privasi</div>
              <div>• Berita acara serah terima resmi (BAST) dengan tanda tangan digital</div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-outline"
                style={{
                  width: '100%',
                  borderColor: 'var(--primary-200)',
                  color: 'var(--primary-indigo)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700
                }}
              >
                LAPORKAN BARANG TEMUAN &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Archival Security Box */}
        <div style={{
          backgroundColor: 'var(--bg-card-alt)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
          <Lock size={20} color="var(--ink-900)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.825rem', color: 'var(--ink-700)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--ink-900)' }}>Aturan Publikasi &amp; Sensor Otomatis Kampus:</strong> Foto dokumen berharga (seperti KTM, SIM, Kartu ATM, atau STNK) akan disensor otomatis oleh sistem untuk publik demi melindungi kerahasiaan identitas pemilik sah.
          </div>
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: 05 Lapor — Form Hilang / Temuan (Desktop)
  // -------------------------------------------------------------
  return (
    <div className="container pb-mobile-nav" style={{ paddingTop: '2.5rem', maxWidth: '1080px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            type="button" 
            onClick={() => navigate('/lapor/pilih')} 
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '6px 10px',
              cursor: 'pointer',
              color: 'var(--ink-700)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem'
            }}
          >
            <ArrowLeft size={14} /> GANTI JENIS
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
              {reportType === 'hilang' ? 'Formulir Laporan Barang Hilang' : 'Formulir Laporan Barang Temuan'}
            </h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-500)', letterSpacing: '0.04em' }}>
              LOST &amp; FOUND &bull; UNIVERSITAS NEGERI SEMARANG
            </div>
          </div>
        </div>

        {/* Type indicator badge */}
        <div>
          {reportType === 'hilang' ? (
            <span className="badge badge-lost">
              <AlertCircle size={12} strokeWidth={2.5} /> SAYA KEHILANGAN
            </span>
          ) : (
            <span className="badge badge-found">
              <PackageCheck size={12} strokeWidth={2.5} /> SAYA MENEMUKAN
            </span>
          )}
        </div>
      </div>

      {/* Progress Steps Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        padding: '0.85rem 1.5rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem'
      }}>
        {[
          { num: 1, label: 'DATA BARANG' },
          { num: 2, label: 'LOKASI & WAKTU' },
          { num: 3, label: 'FOTO BARANG' },
          { num: 4, label: 'BLIND TEST & SELESAI' }
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: currentStep === s.num ? 'var(--primary-indigo)' : currentStep > s.num ? '#10B981' : 'var(--ink-500)',
              fontWeight: currentStep === s.num ? 700 : 500
            }}>
              <span style={{
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                backgroundColor: currentStep === s.num ? 'var(--primary-indigo)' : currentStep > s.num ? '#10B981' : 'var(--bg-card-alt)',
                color: currentStep >= s.num ? '#FFFFFF' : 'var(--ink-500)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                {currentStep > s.num ? '✓' : s.num}
              </span>
              <span>{s.label}</span>
            </div>
            {idx < 3 && (
              <span style={{ color: 'var(--border-subtle)', userSelect: 'none' }}>&mdash;</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form & Guidelines Grid (05 Lapor — Form Hilang Desktop) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left: Form Controls */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          
          {/* STEP 1: INFORMASI BARANG */}
          {currentStep === 1 && (
            <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
                  Langkah 1: Identitas &amp; Deskripsi Barang
                </h2>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  JUDUL LAPORAN BARANG *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: KTM UNNES an Siti Nurhaliza atau Helm KYT Hitam Doff"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card-alt)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem',
                    color: 'var(--ink-900)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  KATEGORI BARANG *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card-alt)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem',
                    color: 'var(--ink-900)'
                  }}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  DESKRIPSI UMUM &amp; CIRI FISIK *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Deskripsikan merk, warna dominan, kondisi fisik luar, atau kronologi singkat tanpa membocorkan ciri rahasia..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card-alt)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem',
                    color: 'var(--ink-900)',
                    lineHeight: 1.5
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-dark" style={{ gap: '0.4rem', textTransform: 'uppercase' }}>
                  LANJUT KE LOKASI <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: LOKASI & WAKTU */}
          {currentStep === 2 && (
            <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
                  Langkah 2: Lokasi Kampus &amp; Tanggal Kejadian
                </h2>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  FAKULTAS / GEDUNG LOKASI *
                </label>
                <select
                  value={formData.location_building}
                  onChange={(e) => handleChange('location_building', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card-alt)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem',
                    color: 'var(--ink-900)'
                  }}
                >
                  {UNNES_BUILDINGS.map(b => (
                    <option key={b.id || b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    LANTAI (OPSIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Lantai 2"
                    value={formData.location_floor}
                    onChange={(e) => handleChange('location_floor', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-card-alt)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    RUANG / BAGIAN
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Ruang 103"
                    value={formData.location_room}
                    onChange={(e) => handleChange('location_room', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-card-alt)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  DETAIL POSISI PRESISI
                </label>
                <input
                  type="text"
                  placeholder="Misal: Di atas meja dosen baris paling depan dekat proyektor"
                  value={formData.location_detail}
                  onChange={(e) => handleChange('location_detail', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card-alt)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  TANGGAL KEJADIAN *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date_lost_found}
                  onChange={(e) => handleChange('date_lost_found', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card-alt)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button type="button" onClick={handlePrev} className="btn btn-secondary">
                  &larr; KEMBALI
                </button>
                <button type="submit" className="btn btn-dark" style={{ gap: '0.4rem', textTransform: 'uppercase' }}>
                  LANJUT KE FOTO <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: UPLOAD FOTO */}
          {currentStep === 3 && (
            <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
                  Langkah 3: Unggah Foto Dokumentasi
                </h2>
              </div>

              <ImageUploadCompressor
                photos={photos}
                onPhotosChange={setPhotos}
                maxPhotos={4}
                label="Foto Dokumentasi (Maks. 4 foto, otomatis kompresi gambar)"
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button type="button" onClick={handlePrev} className="btn btn-secondary">
                  &larr; KEMBALI
                </button>
                <button type="submit" className="btn btn-dark" style={{ gap: '0.4rem', textTransform: 'uppercase' }}>
                  LANJUT KE BLIND TEST <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: BLIND TEST & BOUNTY */}
          {currentStep === 4 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
                  Langkah 4: Verifikasi Blind-Test &amp; Imbalan
                </h2>
              </div>

              {/* Secret Details for Blind Test */}
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  CIRI RAHASIA KHUSUS (TIDAK DITAMPILKAN KE PUBLIK) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Misal: Di balik case HP terselip uang Rp 20.000 atau di dompet ada kartu timezone..."
                  value={formData.hidden_details}
                  onChange={(e) => handleChange('hidden_details', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card-alt)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '4px', display: 'block' }}>
                  🔒 Informasi ini hanya akan digunakan oleh sistem dan Admin untuk menguji orang yang mengklaim kepemilikan.
                </span>
              </div>

              {/* Bounty Field (Hilang) */}
              {reportType === 'hilang' && (
                <div style={{
                  backgroundColor: '#FFFDF5',
                  border: '1px solid #FEF08A',
                  borderRadius: '4px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: '#A16207' }}>
                    <Award size={16} /> PROGRAM HADIAH SUKARELA (OPSIONAL)
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#713F12', margin: 0 }}>
                    Berikan apresiasi finansial bagi civitas yang mengembalikan barang berharga Anda.
                  </p>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    placeholder="Nominal rupiah, misal: 50000"
                    value={formData.bounty_amount || ''}
                    onChange={(e) => handleChange('bounty_amount', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #FDE047',
                      backgroundColor: '#FFFFFF',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button type="button" onClick={handlePrev} className="btn btn-secondary">
                  &larr; KEMBALI
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="btn btn-dark"
                  style={{ gap: '0.45rem', textTransform: 'uppercase' }}
                >
                  <Send size={15} /> {submitting ? 'MENGIRIM LAPORAN...' : 'KIRIM LAPORAN SEKARANG'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Right: Archival Guidelines Sidebar (From Figma 05 Lapor Screen) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'var(--ink-900)',
              textTransform: 'uppercase'
            }}>
              <FileText size={16} /> PANDUAN PEMBUATAN LAPORAN
            </div>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '1.15rem', 
              fontSize: '0.825rem', 
              color: 'var(--ink-700)', 
              lineHeight: 1.6,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <li>Gunakan judul yang jelas dan mencantumkan jenis barang utama.</li>
              <li>Jangan cantumkan nomor PIN, password, atau kombinasi gembok di deskripsi.</li>
              <li>Sebutkan gedung dan ruangan secara spesifik agar memudahkan civitas sekitar mencari.</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'var(--ink-900)',
              textTransform: 'uppercase'
            }}>
              <Lock size={16} /> ATURAN SENSOR IDENTITAS
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--ink-700)', lineHeight: 1.6, margin: 0 }}>
              Sistem menyensor otomatis data sensitif pada kartu identitas seperti NIK atau nomor kartu ATM agar tidak disalahgunakan pihak ketiga.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
