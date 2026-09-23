-- =========================================================================
-- MIGRATION: REALTIME CHAT & FOUND REPORTS SYSTEM
-- Jalankan script ini di Supabase SQL Editor (Dashboard → SQL Editor)
-- =========================================================================

-- 1. TABEL BARU: found_reports
-- Menyimpan laporan pengguna yang menemukan barang hilang dari postingan user lain
CREATE TABLE IF NOT EXISTS public.found_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Info kontak pelapor penemuan
    reporter_name TEXT DEFAULT '',
    reporter_phone TEXT DEFAULT '',
    
    -- Bukti / Ciri yang dilaporkan oleh penemu
    description TEXT NOT NULL,                  -- Deskripsi ciri barang yang ditemukan
    found_location TEXT DEFAULT '',              -- Lokasi penemuan barang
    photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],   -- Foto bukti barang yang ditemukan
    
    -- Status review admin
    status TEXT DEFAULT 'menunggu_review',       -- 'menunggu_review' | 'disetujui' | 'ditolak'
    admin_notes TEXT DEFAULT '',                 -- Catatan dari admin jika disetujui / ditolak
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ALTER TABLE matches: Tambah tipe match, referensi ke found_reports & admin yang menyetujui
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS match_type TEXT DEFAULT 'claim_verified'; 
-- Nilai: 'claim_verified' (dari klaim barang temuan) atau 'found_report' (dari laporan penemuan barang hilang)

ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS found_report_id UUID REFERENCES public.found_reports(id) ON DELETE SET NULL;

-- Admin yang menyetujui match ini (hanya admin ini yang ikut sesi chat untuk hemat kuota realtime)
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. INDEX UNTUK OPTIMASI PERFORMA
CREATE INDEX IF NOT EXISTS idx_found_reports_item_id ON public.found_reports(item_id);
CREATE INDEX IF NOT EXISTS idx_found_reports_reporter_id ON public.found_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_found_reports_status ON public.found_reports(status);
CREATE INDEX IF NOT EXISTS idx_matches_approved_by ON public.matches(approved_by);
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON public.messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- 4. ROW LEVEL SECURITY (RLS) UNTUK found_reports
ALTER TABLE public.found_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Reporter, item owner, or admin can see found_reports" ON public.found_reports;
  CREATE POLICY "Reporter, item owner, or admin can see found_reports" 
    ON public.found_reports FOR SELECT USING (
      auth.uid() = reporter_id OR
      auth.uid() IN (SELECT user_id FROM public.items WHERE id = item_id) OR
      public.is_admin()
    );
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can submit found_reports" ON public.found_reports;
  CREATE POLICY "Authenticated users can submit found_reports" 
    ON public.found_reports FOR INSERT WITH CHECK (
      auth.uid() = reporter_id OR public.is_admin()
    );
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admin can update found_reports" ON public.found_reports;
  CREATE POLICY "Admin can update found_reports" 
    ON public.found_reports FOR UPDATE USING (
      public.is_admin() OR auth.uid() = reporter_id
    );
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- 5. RLS POLICIES UNTUK matches (Dibatasi hanya ke Finder, Owner, dan Admin yang Menyetujui)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Involved parties or admin can see match" ON public.matches;
  DROP POLICY IF EXISTS "Involved parties or approving admin can see match" ON public.matches;
  CREATE POLICY "Involved parties or approving admin can see match" ON public.matches
    FOR SELECT USING (
      auth.uid() = finder_id OR 
      auth.uid() = owner_id OR 
      auth.uid() = approved_by
    );
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins or involved parties can delete matches" ON public.matches;
  DROP POLICY IF EXISTS "Involved parties or approving admin can delete matches" ON public.matches;
  CREATE POLICY "Involved parties or approving admin can delete matches" ON public.matches
    FOR DELETE USING (
      auth.uid() = finder_id OR 
      auth.uid() = owner_id OR 
      auth.uid() = approved_by OR
      public.is_admin()
    );
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- 6. RLS POLICIES UNTUK messages (Dibatasi hanya ke Finder, Owner, dan Admin yang Menyetujui)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Involved parties can read messages" ON public.messages;
  DROP POLICY IF EXISTS "Involved parties or approving admin can read messages" ON public.messages;
  CREATE POLICY "Involved parties or approving admin can read messages" ON public.messages
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.matches m
        WHERE m.id = match_id AND (m.finder_id = auth.uid() OR m.owner_id = auth.uid() OR m.approved_by = auth.uid())
      )
    );
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Involved parties can post messages" ON public.messages;
  DROP POLICY IF EXISTS "Admin can post messages in any match" ON public.messages;
  DROP POLICY IF EXISTS "Involved parties or approving admin can post messages" ON public.messages;
  CREATE POLICY "Involved parties or approving admin can post messages" ON public.messages
    FOR INSERT WITH CHECK (
      auth.uid() = sender_id AND
      EXISTS (
        SELECT 1 FROM public.matches m
        WHERE m.id = match_id AND (m.finder_id = auth.uid() OR m.owner_id = auth.uid() OR m.approved_by = auth.uid())
      )
    );
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Involved parties can update messages" ON public.messages;
  DROP POLICY IF EXISTS "Involved parties or approving admin can update messages" ON public.messages;
  CREATE POLICY "Involved parties or approving admin can update messages" ON public.messages
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.matches m
        WHERE m.id = match_id AND (m.finder_id = auth.uid() OR m.owner_id = auth.uid() OR m.approved_by = auth.uid())
      )
    );
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- 7. RLS POLICIES UNTUK notifications
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
  CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
  CREATE POLICY "Authenticated users can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
  CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
  CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- 8. REALTIME PUBLICATION SETUP
-- Mengaktifkan Realtime broadcast untuk pesan, notifikasi, dan laporan penemuan
DO $$ 
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.found_reports;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
