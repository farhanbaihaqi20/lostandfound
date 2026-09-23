import React, { useState } from 'react';
import { UploadCloud, X, ShieldAlert, Check } from 'lucide-react';
import { uploadImageFile } from '../lib/storageService';

export const ImageUploadCompressor = ({ photos = [], onPhotosChange, maxPhotos = 4, label = 'Upload Foto Barang' }) => {
  const [uploading, setUploading] = useState(false);
  const [compressInfo, setCompressInfo] = useState('');

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (photos.length + files.length > maxPhotos) {
      alert(`Maksimal hanya dapat mengunggah ${maxPhotos} foto.`);
      return;
    }

    setUploading(true);
    setCompressInfo('Mengompres & memproses foto di browser...');

    try {
      const uploadPromises = files.map(file => uploadImageFile(file, 'items'));
      const uploadedUrls = await Promise.all(uploadPromises);
      onPhotosChange([...photos, ...uploadedUrls]);
      setCompressInfo('Foto berhasil dikompres & siap diunggah!');
      setTimeout(() => setCompressInfo(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Gagal memproses foto. Silakan coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          {label} ({photos.length}/{maxPhotos})
        </label>
        {compressInfo && (
          <span style={{ fontSize: '0.75rem', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Check size={12} /> {compressInfo}
          </span>
        )}
      </div>

      {/* Grid Thumbnail Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.75rem' }}>
        {photos.map((url, idx) => (
          <div 
            key={idx} 
            style={{ 
              position: 'relative', 
              aspectRatio: '1', 
              borderRadius: 'var(--radius-md)', 
              overflow: 'hidden',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <img 
              src={url} 
              alt={`Upload ${idx + 1}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: 'rgba(0,0,0,0.65)',
                color: '#fff',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Hapus foto"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* Upload Button Tile */}
        {photos.length < maxPhotos && (
          <label 
            style={{
              aspectRatio: '1',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              cursor: uploading ? 'wait' : 'pointer',
              background: 'var(--bg-surface-alt)',
              transition: 'all var(--trans-fast)',
              color: 'var(--text-secondary)'
            }}
          >
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleFileSelect} 
              disabled={uploading}
              style={{ display: 'none' }} 
            />
            {uploading ? (
              <div style={{ fontSize: '0.7rem', textAlign: 'center', padding: '0.25rem' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid var(--primary-500)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 4px' }}></div>
                Kompres...
              </div>
            ) : (
              <>
                <UploadCloud size={20} color="var(--primary-600)" />
                <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Tambah Foto</span>
              </>
            )}
          </label>
        )}
      </div>

      {/* SOP Keamanan Sensor */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '0.5rem', 
        padding: '0.5rem 0.75rem', 
        background: 'var(--warning-bg)', 
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        color: 'var(--amber-700)',
        border: '1px solid rgba(245, 158, 11, 0.25)'
      }}>
        <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          <strong>SOP Sensor Privasi UNNES:</strong> Dilarang menampilkan nomor identitas lengkap (NIM, NIK, No. Rekening). Detail stiker/gantungan kunci rahasia simpan untuk bahan Blind Test kepemilikan.
        </span>
      </div>
    </div>
  );
};
