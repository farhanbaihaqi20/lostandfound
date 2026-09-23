-- =========================================================================
-- MIGRATION: CLAIMS & MATCHES REALTIME & DATABASE SYNC
-- =========================================================================

-- 1. Tambah kolom pendukung ke tabel public.claims
ALTER TABLE public.claims 
  ADD COLUMN IF NOT EXISTS item_title TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS item_code TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS claimer_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS claimer_email TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS claimer_phone TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_reapplication BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Tambah kolom pendukung ke public.items
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS returned_to TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS returned_at TIMESTAMP WITH TIME ZONE;

-- 3. Kebijakan Row Level Security (RLS) untuk public.claims
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Claimer, Item Owner, or Admin can see claims" ON public.claims;
DROP POLICY IF EXISTS "Authenticated users can submit a claim" ON public.claims;
DROP POLICY IF EXISTS "Admins can update claims status" ON public.claims;
DROP POLICY IF EXISTS "Claimer or Admin can update claims" ON public.claims;
DROP POLICY IF EXISTS "Claimer or Admin can delete claims" ON public.claims;

-- SELECT policy: Pemohon klaim, pemilik/penemu item, atau Admin dapat melihat klaim
CREATE POLICY "Claimer, Item Owner, or Admin can see claims" ON public.claims
  FOR SELECT USING (
    auth.uid() = claimer_id OR
    auth.uid() IN (SELECT user_id FROM public.items WHERE id = item_id) OR
    public.is_admin()
  );

-- INSERT policy: Mahasiswa / User terautentikasi dapat mengajukan klaim untuk dirinya, atau Admin
CREATE POLICY "Authenticated users can submit a claim" ON public.claims
  FOR INSERT WITH CHECK (
    auth.uid() = claimer_id OR public.is_admin()
  );

-- UPDATE policy: Pemohon dapat merevisi/mengajukan ulang klaimnya, Admin dapat memverifikasi/menolak
CREATE POLICY "Claimer or Admin can update claims" ON public.claims
  FOR UPDATE USING (
    auth.uid() = claimer_id OR public.is_admin()
  );

-- DELETE policy: Pemohon atau Admin dapat menghapus klaim
CREATE POLICY "Claimer or Admin can delete claims" ON public.claims
  FOR DELETE USING (
    auth.uid() = claimer_id OR public.is_admin()
  );

-- 4. Kebijakan Row Level Security (RLS) untuk public.matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Involved parties or admin can see match" ON public.matches;
DROP POLICY IF EXISTS "Admins or involved parties can insert matches" ON public.matches;
DROP POLICY IF EXISTS "Admins or involved parties can update matches" ON public.matches;
DROP POLICY IF EXISTS "Admins or involved parties can delete matches" ON public.matches;

CREATE POLICY "Involved parties or admin can see match" ON public.matches
  FOR SELECT USING (
    auth.uid() = finder_id OR auth.uid() = owner_id OR public.is_admin()
  );

CREATE POLICY "Admins or involved parties can insert matches" ON public.matches
  FOR INSERT WITH CHECK (
    public.is_admin() OR auth.uid() = finder_id OR auth.uid() = owner_id
  );

CREATE POLICY "Admins or involved parties can update matches" ON public.matches
  FOR UPDATE USING (
    public.is_admin() OR auth.uid() = finder_id OR auth.uid() = owner_id
  );

CREATE POLICY "Admins or involved parties can delete matches" ON public.matches
  FOR DELETE USING (
    public.is_admin() OR auth.uid() = finder_id OR auth.uid() = owner_id
  );

-- 5. Aktifkan Realtime untuk table claims & matches
ALTER TABLE public.claims REPLICA IDENTITY FULL;
ALTER TABLE public.matches REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'claims'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.claims;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  END IF;
END $$;
