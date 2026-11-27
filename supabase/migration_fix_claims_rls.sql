-- =========================================================================
-- UNNES LOST & FOUND - FIX CLAIMS INSERT RLS & REAPPLICATION TRIGGER
-- =========================================================================
-- Masalah:
-- 1. Policy INSERT "Authenticated users can submit a claim" mewajibkan
--    blind_test_score = 0, padahal frontend mengirim skor otomatis (80-100).
--    Akibatnya pengajuan klaim dari user biasa ditolak RLS Supabase (42501),
--    sementara notifikasi ke admin tetap terkirim -> klaim tidak muncul di
--    dashboard admin.
-- 2. Trigger protect_claim_modifications() memblokir update blind_test_score
--    dan reset admin_notes saat user mengajukan ulang klaim yang ditolak.
-- =========================================================================

-- 1. Perbaiki RLS INSERT policy pada public.claims
DROP POLICY IF EXISTS "Authenticated users can submit a claim" ON public.claims;
CREATE POLICY "Authenticated users can submit a claim" ON public.claims
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    (
      public.is_active_user() AND
      auth.uid() = claimer_id AND
      status = 'menunggu_admin' AND
      blind_test_score >= 0 AND
      blind_test_score <= 100 AND
      verified_by IS NULL AND
      verified_at IS NULL
    )
  );

-- 2. Perbaiki trigger protect_claim_modifications() agar mendukung pengajuan ulang (ditolak -> menunggu_admin)
--    namun tetap memblokir self-approval, manipulasi klaim disetujui/dibatalkan, dan pemalsuan stempel admin.
CREATE OR REPLACE FUNCTION public.protect_claim_modifications()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NOT public.is_active_user() THEN
      RAISE EXCEPTION 'Akun Anda sedang diblokir.';
    END IF;

    -- Dilarang mengubah pihak terkait atau item target
    IF NEW.claimer_id IS DISTINCT FROM OLD.claimer_id OR NEW.item_id IS DISTINCT FROM OLD.item_id THEN
      RAISE EXCEPTION 'Tidak dapat mengubah pemilik klaim atau target barang.';
    END IF;

    -- Klaim yang sudah disetujui, selesai, atau dibatalkan permanen tidak boleh diubah oleh non-admin
    IF OLD.status IN ('disetujui', 'selesai', 'dibatalkan') THEN
      RAISE EXCEPTION 'Klaim yang sudah disetujui, selesai, atau dibatalkan tidak dapat diubah kembali.';
    END IF;

    -- Non-admin hanya boleh mempertahankan atau mengembalikan status ke 'menunggu_admin'
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status != 'menunggu_admin' THEN
      RAISE EXCEPTION 'Hanya admin posko yang berhak memverifikasi dan mengubah status akhir klaim barang.';
    END IF;

    -- Jika mengajukan ulang dari status 'ditolak' -> 'menunggu_admin'
    IF OLD.status = 'ditolak' AND NEW.status = 'menunggu_admin' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.items
        WHERE id = NEW.item_id
          AND post_status = 'disetujui'
          AND item_status NOT IN ('dikembalikan', 'ditutup', 'diproses')
      ) THEN
        RAISE EXCEPTION 'Barang tidak tersedia untuk pengajuan ulang klaim.';
      END IF;

      -- Saat pengajuan ulang, pemohon hanya boleh mengosongkan admin_notes atau membiarkannya tetap
      IF NEW.admin_notes IS DISTINCT FROM OLD.admin_notes AND COALESCE(NEW.admin_notes, '') != '' THEN
        RAISE EXCEPTION 'Anda tidak diizinkan mengubah catatan verifikasi admin.';
      END IF;
    ELSE
      -- Di luar pengajuan ulang, dilarang mengubah admin_notes
      IF NEW.admin_notes IS DISTINCT FROM OLD.admin_notes THEN
        RAISE EXCEPTION 'Anda tidak diizinkan memodifikasi catatan verifikasi admin.';
      END IF;
    END IF;

    -- Pastikan blind_test_score tetap dalam rentang valid 0..100
    IF NEW.blind_test_score < 0 OR NEW.blind_test_score > 100 THEN
      RAISE EXCEPTION 'Skor pengujian blind test tidak valid.';
    END IF;

    -- Dilarang memalsukan stempel verifikasi admin
    IF NEW.verified_by IS DISTINCT FROM OLD.verified_by OR
       NEW.verified_at IS DISTINCT FROM OLD.verified_at THEN
      RAISE EXCEPTION 'Anda tidak diizinkan memodifikasi stempel verifikasi admin.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
