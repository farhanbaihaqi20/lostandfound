-- =========================================================================
-- MIGRATION: BAST DIGITAL SIGNATURES FOR MATCHES
-- Jalankan script ini di Supabase SQL Editor (Dashboard → SQL Editor)
-- agar tanda tangan BAST tersimpan langsung di tabel public.matches
-- =========================================================================

ALTER TABLE public.matches 
  ADD COLUMN IF NOT EXISTS owner_signed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS owner_signer_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS owner_signer_nim TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS finder_signed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS finder_signer_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS finder_signer_nim TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS admin_signed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS admin_signer_name TEXT DEFAULT '';

-- Pastikan policy UPDATE mengizinkan pihak yang terlibat memperbarui tanda tangan
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins or involved parties can update matches" ON public.matches;
  CREATE POLICY "Admins or involved parties can update matches" 
    ON public.matches FOR UPDATE USING (
      auth.uid() = finder_id OR 
      auth.uid() = owner_id OR 
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
END $$;
