-- =========================================================================
-- MIGRATION: DELETE & STORAGE EFFICIENCY POLICIES
-- Jalankan di Supabase Dashboard (SQL Editor)
-- =========================================================================

-- 1. Aktifkan kebijakan RLS agar Admin & Pemilik dapat menghapus postingan di Supabase
DROP POLICY IF EXISTS "Admins and owners can delete items" ON public.items;
CREATE POLICY "Admins and owners can delete items" ON public.items
  FOR DELETE USING (
    auth.uid() = user_id OR public.is_admin()
  );

-- 2. Pastikan relasi cascading bersih saat item dihapus (claims, matches, notifications)
-- Catatan: ON DELETE CASCADE pada schema awal sudah otomatis membersihkan claims dan matches
-- sehingga storage database Supabase tetap ramping dan optimal.
