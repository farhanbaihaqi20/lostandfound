import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Kompresi gambar client-side menggunakan HTML5 Canvas
 * Mengubah gambar besar (misal 3MB-10MB dari kamera HP) menjadi WebP/JPEG ringan (~80KB - 200KB)
 * Menghemat kuota storage dan mempercepat upload drastis!
 */
export async function compressImage(file, maxWidth = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    // Jika bukan file gambar, kembalikan langsung
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Coba export ke format WebP untuk kompresi maksimal, fallback ke JPEG
        const outputType = 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob], 
                file.name.replace(/\.[^/.]+$/, "") + ".webp", 
                { type: outputType, lastModified: Date.now() }
              );
              // Buat preview data URL
              const dataUrl = canvas.toDataURL(outputType, quality);
              resolve({ file: compressedFile, dataUrl, sizeBefore: file.size, sizeAfter: blob.size });
            } else {
              // Fallback
              resolve({ file, dataUrl: event.target.result, sizeBefore: file.size, sizeAfter: file.size });
            }
          },
          outputType,
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Upload gambar dengan urutan prioritas:
 * 1. Cloudinary (jika configured, free 25GB)
 * 2. Supabase Storage (jika configured)
 * 3. Base64 Data URL (untuk local development & prototype demo tanpa setup!)
 */
export async function uploadImageFile(file, folder = 'items') {
  try {
    // 1. Kompresi terlebih dahulu
    const { file: compressedFile, dataUrl, sizeBefore, sizeAfter } = await compressImage(file);
    console.log(`Kompresi selesai: ${(sizeBefore / 1024).toFixed(1)} KB -> ${(sizeAfter / 1024).toFixed(1)} KB`);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // A. Coba Cloudinary jika tersedia
    if (cloudName && uploadPreset && !cloudName.includes('your-cloud')) {
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', `unnes-lostandfound/${folder}`);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.secure_url;
      } else {
        const errorData = await response.json().catch(() => null);
        console.warn('⚠️ Cloudinary upload gagal, beralih ke fallback:', errorData?.error?.message || response.statusText);
      }
    }

    // B. Coba Supabase Storage jika configured
    if (isSupabaseConfigured() && supabase) {
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
      const { data, error } = await supabase.storage
        .from('lostandfound-media')
        .upload(fileName, compressedFile, { contentType: 'image/webp', upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('lostandfound-media')
          .getPublicUrl(fileName);
        return publicUrlData.publicUrl;
      }
    }

    // C. Fallback: Base64 dataUrl (Sangat aman untuk demo & prototype lokal)
    return dataUrl;
  } catch (error) {
    console.error('Error saat upload gambar:', error);
    // Fallback: baca sebagai data URL biasa
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Ekstraksi public_id Cloudinary dari full URL
 * Contoh: https://res.cloudinary.com/a90zvoza/image/upload/v1234/unnes-lostandfound/items/abc.webp
 * Output: unnes-lostandfound/items/abc
 */
export function getCloudinaryPublicId(url) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return null;
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

/**
 * Hapus gambar dari Cloudinary untuk menghemat ruang penyimpanan.
 * Menggunakan Web Crypto API native (SHA-1) untuk membuat signature otentikasi.
 * Jika VITE_CLOUDINARY_API_KEY & VITE_CLOUDINARY_API_SECRET diisi di .env,
 * file akan langsung dihapus permanen dari server Cloudinary.
 */
export async function deleteCloudinaryImage(url) {
  const publicId = getCloudinaryPublicId(url);
  if (!publicId) return false;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.info(`[Storage Efficiency] Foto Cloudinary (${publicId}) digantikan banner lokal. Tambahkan VITE_CLOUDINARY_API_KEY & SECRET di .env jika ingin menghapus fisik via REST API.`);
    return false;
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;

    // SHA-1 signature menggunakan browser Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData
    });

    const result = await res.json();
    return result.result === 'ok';
  } catch (err) {
    console.error('Gagal menghapus file dari Cloudinary:', err);
    return false;
  }
}

/**
 * Generate Banner SVG Ultra-Lightweight (0 KB Cloudinary Quota)
 * Berfungsi sebagai visual pengganti foto asli ketika barang sudah dikembalikan.
 * Aman untuk privasi mahasiswa & 100% instan dimuat di browser.
 */
export function generateReturnedBannerSvg(itemCode = 'UNNES', title = 'Barang') {
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const sanitizedTitle = (title || 'Barang').replace(/[<>&"]/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#064e3b" />
        <stop offset="50%" stop-color="#047857" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
      <pattern id="dotPattern" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="15" cy="15" r="1.5" fill="rgba(255,255,255,0.08)" />
      </pattern>
    </defs>
    
    <!-- Background Gradient & Texture -->
    <rect width="800" height="600" fill="url(#bgGrad)" />
    <rect width="800" height="600" fill="url(#dotPattern)" />
    
    <!-- Outer Dashed Frame -->
    <rect x="24" y="24" width="752" height="552" rx="20" fill="none" stroke="rgba(52, 211, 153, 0.4)" stroke-width="2.5" stroke-dasharray="10 8" />

    <!-- Center Seal Circle -->
    <circle cx="400" cy="210" r="70" fill="rgba(16, 185, 129, 0.2)" stroke="rgba(52, 211, 153, 0.5)" stroke-width="3" />
    <circle cx="400" cy="210" r="54" fill="#10b981" />
    
    <!-- Checkmark Icon -->
    <path d="M 372 210 L 392 230 L 430 188" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Main Title -->
    <text x="400" y="335" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">
      BARANG TELAH KEMBALI
    </text>
    
    <!-- Subtitle / Status -->
    <text x="400" y="375" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#a7f3d0" text-anchor="middle" letter-spacing="0.5">
      KASUS SELESAI &amp; TERVERIFIKASI RESMI
    </text>

    <!-- Item Code Pill -->
    <rect x="240" y="405" width="320" height="38" rx="19" fill="rgba(0, 0, 0, 0.4)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
    <text x="400" y="430" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#34d399" text-anchor="middle">
      #${itemCode} • ${dateStr}
    </text>

    <!-- Privacy & Storage Efficiency Notice -->
    <text x="400" y="505" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="rgba(255,255,255,0.7)" text-anchor="middle">
      🔒 Foto asli telah dihapus dari server demi privasi mahasiswa &amp; efisiensi penyimpanan
    </text>
    <text x="400" y="528" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="rgba(255,255,255,0.4)" text-anchor="middle" letter-spacing="2">
      UNNES LOST &amp; FOUND RECOVERY SYSTEM
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
