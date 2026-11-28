-- =========================================================================
-- FIX BAST DIGITAL SIGNATURES:
-- 1. Enforce that BOTH owner_signed_at AND finder_signed_at are required
--    before a match can become 'selesai'.
-- 2. Auto-complete match atomically in DB when the second party signs
--    (prevents race condition when client has stale local match state).
-- 3. Prevent erasing already-recorded signatures by non-admins.
-- 4. Sync item_status='dikembalikan' and approved claim status='selesai'
--    when BAST becomes 'selesai', regardless of which party signed last.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.protect_match_signatures()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NOT public.is_active_user() THEN
      RAISE EXCEPTION 'Akun Anda sedang diblokir.';
    END IF;

    -- Dilarang mengubah relasi match
    IF NEW.finder_id IS DISTINCT FROM OLD.finder_id OR 
       NEW.owner_id IS DISTINCT FROM OLD.owner_id OR 
       NEW.item_id IS DISTINCT FROM OLD.item_id OR
       NEW.approved_by IS DISTINCT FROM OLD.approved_by THEN
      RAISE EXCEPTION 'Tidak dapat mengubah pihak terkait pada pertemuan (match).';
    END IF;

    -- Dilarang mengubah match yang sudah dibatalkan
    IF OLD.status = 'dibatalkan' THEN
      RAISE EXCEPTION 'Sesi koordinasi ini telah dibatalkan.';
    END IF;

    -- Dilarang memalsukan tanda tangan admin posko
    IF NEW.admin_signed_at IS DISTINCT FROM OLD.admin_signed_at OR 
       NEW.admin_signer_name IS DISTINCT FROM OLD.admin_signer_name THEN
      RAISE EXCEPTION 'Hanya admin posko yang berhak menandatangani BAST sebagai Admin.';
    END IF;

    -- Pemilik tidak boleh mengubah atau memalsukan tanda tangan penemu
    IF auth.uid() = OLD.owner_id AND auth.uid() != OLD.finder_id THEN
      IF NEW.finder_signed_at IS DISTINCT FROM OLD.finder_signed_at OR
         NEW.finder_signer_name IS DISTINCT FROM OLD.finder_signer_name OR
         NEW.finder_signer_nim IS DISTINCT FROM OLD.finder_signer_nim THEN
        RAISE EXCEPTION 'Pemilik barang tidak dapat mengubah tanda tangan penemu.';
      END IF;
    END IF;

    -- Penemu tidak boleh mengubah atau memalsukan tanda tangan pemilik
    IF auth.uid() = OLD.finder_id AND auth.uid() != OLD.owner_id THEN
      IF NEW.owner_signed_at IS DISTINCT FROM OLD.owner_signed_at OR
         NEW.owner_signer_name IS DISTINCT FROM OLD.owner_signer_name OR
         NEW.owner_signer_nim IS DISTINCT FROM OLD.owner_signer_nim THEN
        RAISE EXCEPTION 'Penemu barang tidak dapat mengubah tanda tangan pemilik.';
      END IF;
    END IF;

    -- Tanda tangan yang sudah tercatat tidak boleh dihapus oleh non-admin
    IF OLD.owner_signed_at IS NOT NULL AND NEW.owner_signed_at IS NULL THEN
      RAISE EXCEPTION 'Tanda tangan pemilik sudah tercatat dan tidak dapat dihapus.';
    END IF;
    IF OLD.finder_signed_at IS NOT NULL AND NEW.finder_signed_at IS NULL THEN
      RAISE EXCEPTION 'Tanda tangan penemu sudah tercatat dan tidak dapat dihapus.';
    END IF;

    -- Non-admin tidak boleh menyelesaikan BAST sebelum Penemu dan Pemilik sama-sama TTD
    IF NEW.status = 'selesai' AND (NEW.owner_signed_at IS NULL OR NEW.finder_signed_at IS NULL) THEN
      RAISE EXCEPTION 'BAST hanya dapat diselesaikan setelah Penemu dan Pemilik masing-masing menandatangani.';
    END IF;
  END IF;

  -- Otomatis tetapkan status 'selesai' hanya jika Penemu DAN Pemilik sama-sama telah menandatangani
  IF NEW.status IS DISTINCT FROM 'dibatalkan' THEN
    IF NEW.owner_signed_at IS NOT NULL AND NEW.finder_signed_at IS NOT NULL THEN
      NEW.status := 'selesai';
      NEW.completed_at := COALESCE(OLD.completed_at, NEW.completed_at, NOW());
    ELSIF NEW.status = 'selesai' THEN
      RAISE EXCEPTION 'BAST hanya dapat diselesaikan setelah Penemu dan Pemilik masing-masing menandatangani.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_match_signatures ON public.matches;
CREATE TRIGGER trg_protect_match_signatures
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_match_signatures();

-- Sinkronisasi otomatis status barang & klaim ketika BAST resmi selesai
CREATE OR REPLACE FUNCTION public.sync_bast_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'selesai' AND OLD.status IS DISTINCT FROM 'selesai' THEN
    PERFORM set_config('app.bast_completing', 'true', true);

    UPDATE public.items
    SET item_status = 'dikembalikan',
        updated_at = NOW()
    WHERE id = NEW.item_id
      AND item_status IS DISTINCT FROM 'dikembalikan';

    UPDATE public.claims
    SET status = 'selesai',
        updated_at = NOW()
    WHERE item_id = NEW.item_id
      AND status = 'disetujui';

    PERFORM set_config('app.bast_completing', '', true);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_bast_completion ON public.matches;
CREATE TRIGGER trg_sync_bast_completion
  AFTER UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_bast_completion();

-- Izinkan transisi internal trigger BAST dari 'disetujui' -> 'selesai' pada public.claims
CREATE OR REPLACE FUNCTION public.protect_claim_modifications()
RETURNS TRIGGER AS $$
BEGIN
  IF current_setting('app.bast_completing', true) = 'true'
     AND pg_trigger_depth() >= 2
     AND OLD.status = 'disetujui'
     AND NEW.status = 'selesai'
     AND NEW.claimer_id IS NOT DISTINCT FROM OLD.claimer_id
     AND NEW.item_id IS NOT DISTINCT FROM OLD.item_id THEN
    RETURN NEW;
  END IF;

  IF NOT public.is_admin() THEN
    IF NOT public.is_active_user() THEN
      RAISE EXCEPTION 'Akun Anda sedang diblokir.';
    END IF;

    IF NEW.claimer_id IS DISTINCT FROM OLD.claimer_id OR NEW.item_id IS DISTINCT FROM OLD.item_id THEN
      RAISE EXCEPTION 'Tidak dapat mengubah pemilik klaim atau target barang.';
    END IF;

    IF OLD.status IN ('disetujui', 'selesai', 'dibatalkan') THEN
      RAISE EXCEPTION 'Klaim yang sudah disetujui, selesai, atau dibatalkan tidak dapat diubah kembali.';
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status != 'menunggu_admin' THEN
      RAISE EXCEPTION 'Hanya admin posko yang berhak memverifikasi dan mengubah status akhir klaim barang.';
    END IF;

    IF OLD.status = 'ditolak' AND NEW.status = 'menunggu_admin' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.items
        WHERE id = NEW.item_id
          AND post_status = 'disetujui'
          AND item_status NOT IN ('dikembalikan', 'ditutup', 'diproses')
      ) THEN
        RAISE EXCEPTION 'Barang tidak tersedia untuk pengajuan ulang klaim.';
      END IF;

      IF NEW.admin_notes IS DISTINCT FROM OLD.admin_notes AND COALESCE(NEW.admin_notes, '') != '' THEN
        RAISE EXCEPTION 'Anda tidak diizinkan mengubah catatan verifikasi admin.';
      END IF;
    ELSE
      IF NEW.admin_notes IS DISTINCT FROM OLD.admin_notes THEN
        RAISE EXCEPTION 'Anda tidak diizinkan memodifikasi catatan verifikasi admin.';
      END IF;
    END IF;

    IF NEW.blind_test_score < 0 OR NEW.blind_test_score > 100 THEN
      RAISE EXCEPTION 'Skor pengujian blind test tidak valid.';
    END IF;

    IF NEW.verified_by IS DISTINCT FROM OLD.verified_by OR
       NEW.verified_at IS DISTINCT FROM OLD.verified_at THEN
      RAISE EXCEPTION 'Anda tidak diizinkan memodifikasi stempel verifikasi admin.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
