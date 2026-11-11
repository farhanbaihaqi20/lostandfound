-- =========================================================================
-- UNNES LOST & FOUND - REPAIR FOREIGN KEY TRIGGER ERROR 23503
-- =========================================================================
-- Masalah sebelumnya: trg_sync_item_secrets berjalan BEFORE INSERT.
-- Pada saat BEFORE INSERT, baris items belum tersimpan di tabel public.items,
-- sehingga INSERT INTO public.item_secrets gagal karena melanggar Foreign Key:
-- Key (item_id)=(...) is not present in table "items".
--
-- Jalankan skrip ini di Supabase SQL Editor jika ingin memperbarui trigger di sisi database.
-- =========================================================================

DROP TRIGGER IF EXISTS trg_sync_item_secrets ON public.items;

CREATE OR REPLACE FUNCTION public.sync_item_secrets()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.hidden_details IS NOT NULL AND NEW.hidden_details != '' THEN
    INSERT INTO public.item_secrets (item_id, hidden_details)
    VALUES (NEW.id, NEW.hidden_details)
    ON CONFLICT (item_id) DO UPDATE
    SET hidden_details = EXCLUDED.hidden_details, updated_at = NOW();

    -- Hapus isi plaintext dari items agar tetap aman
    UPDATE public.items SET hidden_details = NULL WHERE id = NEW.id AND hidden_details IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_sync_item_secrets
  AFTER INSERT OR UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_item_secrets();

