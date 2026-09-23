-- =========================================================================
-- MIGRATION: RUNNER ORDERS REALTIME & DATABASE SYNC
-- =========================================================================

-- 1. Tambah kolom yang dibutuhkan ke public.orders
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS item_title TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS item_code TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS requester_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS requester_phone TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS runner_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS runner_phone TEXT DEFAULT '';

-- 2. Pastikan foreign key match_id berstatus ON DELETE SET NULL
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_match_id_fkey;
ALTER TABLE public.orders 
  ADD CONSTRAINT orders_match_id_fkey 
  FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE SET NULL;

-- 3. Kebijakan Row Level Security (RLS) untuk public.orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Orders can be viewed by requester or admin" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Orders can be updated by requester or admin" ON public.orders;
DROP POLICY IF EXISTS "Orders can be deleted by requester or admin" ON public.orders;

-- SELECT policy: Pemesan melihat pesanannya sendiri, Admin dapat melihat seluruh pesanan
CREATE POLICY "Orders can be viewed by requester or admin" ON public.orders
  FOR SELECT USING (
    auth.uid() = requester_id OR public.is_admin()
  );

-- INSERT policy: Mahasiswa / User yang login dapat memesan atas nama akunnya sendiri, Admin juga bisa
CREATE POLICY "Authenticated users can create orders" ON public.orders
  FOR INSERT WITH CHECK (
    auth.uid() = requester_id OR public.is_admin()
  );

-- UPDATE policy: Pemesan bisa update pesanannya, Admin bisa update untuk tugaskan runner, update status, dan tarif
CREATE POLICY "Orders can be updated by requester or admin" ON public.orders
  FOR UPDATE USING (
    auth.uid() = requester_id OR public.is_admin()
  );

-- DELETE policy: Pemesan atau Admin bisa menghapus pesanan
CREATE POLICY "Orders can be deleted by requester or admin" ON public.orders
  FOR DELETE USING (
    auth.uid() = requester_id OR public.is_admin()
  );

-- 4. Aktifkan Realtime untuk table orders & items
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.items REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
  END IF;
END $$;
