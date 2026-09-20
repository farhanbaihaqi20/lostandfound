-- =========================================================================
-- MIGRATION: ADMIN MANAGEMENT SYSTEM
-- Jalankan script ini di Supabase SQL Editor (Dashboard → SQL Editor)
-- =========================================================================

-- 1. Tambah kolom is_super_admin ke profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- 2. Function untuk admin mengubah role user lain (via RPC)
CREATE OR REPLACE FUNCTION public.set_user_role(target_user_id UUID, new_role user_role)
RETURNS VOID AS $$
BEGIN
  -- Hanya admin yang boleh mengubah role
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Hanya admin yang dapat mengubah role pengguna';
  END IF;
  
  -- Admin tidak bisa mengubah role dirinya sendiri
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Tidak dapat mengubah role diri sendiri';
  END IF;

  -- Super Admin tidak bisa di-demote
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = target_user_id AND is_super_admin = true
  ) AND new_role = 'user' THEN
    RAISE EXCEPTION 'Tidak dapat menghapus role Super Admin';
  END IF;
  
  -- Eksekusi update role
  UPDATE public.profiles 
  SET role = new_role, updated_at = NOW()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Policy agar admin bisa update profile user lain (khusus role)
-- (Profile SELECT sudah public, jadi tidak perlu tambah policy SELECT)
-- Policy UPDATE sudah ada tapi hanya untuk user sendiri.
-- Kita tidak perlu ubah policy karena set_user_role pakai SECURITY DEFINER.

-- =========================================================================
-- SETUP SUPER ADMIN PERTAMA
-- =========================================================================
-- Setelah menjalankan migration di atas, jalankan query ini 
-- untuk menjadikan akun kamu sebagai Super Admin.
--
-- Ganti 'EMAIL_KAMU@students.unnes.ac.id' dengan email akun kamu:
--
-- UPDATE public.profiles 
-- SET role = 'admin', is_super_admin = true, updated_at = NOW()
-- WHERE email = 'EMAIL_KAMU@students.unnes.ac.id';
-- =========================================================================
