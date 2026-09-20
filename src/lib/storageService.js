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
