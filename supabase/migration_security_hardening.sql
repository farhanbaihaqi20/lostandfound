-- =========================================================================
-- UNNES LOST & FOUND - SECURITY HARDENING & ROW LEVEL SECURITY ENHANCEMENT
-- =========================================================================
-- Skrip migrasi ini menutup semua celah privilege escalation, data leak,
-- self-approval klaim, pemalsuan BAST, spam, dan manipulasi data melalui AI Agent / REST API.
-- =========================================================================

-- 1. HELPER FUNCTIONS
-- Helper: Cek apakah user adalah admin aktif
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.uid() IS NOT NULL) AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_banned = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: Cek apakah user aktif (tidak diblokir)
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.uid() IS NOT NULL) AND NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_banned = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. ITEM SECRETS TABLE (Menutup celah kebocoran hidden_details / blind test)
CREATE TABLE IF NOT EXISTS public.item_secrets (
  item_id UUID PRIMARY KEY REFERENCES public.items(id) ON DELETE CASCADE,
  hidden_details TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pindahkan hidden_details yang sudah ada di tabel items ke tabel item_secrets
INSERT INTO public.item_secrets (item_id, hidden_details)
SELECT id, hidden_details
FROM public.items
WHERE hidden_details IS NOT NULL AND hidden_details != ''
ON CONFLICT (item_id) DO UPDATE SET hidden_details = EXCLUDED.hidden_details;

-- Kosongkan kolom hidden_details di tabel public.items agar tidak terbaca oleh select('*')
UPDATE public.items SET hidden_details = NULL WHERE hidden_details IS NOT NULL;

-- Aktifkan RLS ketat pada item_secrets: HANYA pembuat postingan & admin yang bisa akses
ALTER TABLE public.item_secrets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only item owner or admin can select item_secrets" ON public.item_secrets;
CREATE POLICY "Only item owner or admin can select item_secrets" ON public.item_secrets
  FOR SELECT USING (
    public.is_admin() OR
    auth.uid() = (SELECT user_id FROM public.items WHERE id = item_id)
  );

DROP POLICY IF EXISTS "Only item owner or admin can insert item_secrets" ON public.item_secrets;
CREATE POLICY "Only item owner or admin can insert item_secrets" ON public.item_secrets
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    auth.uid() = (SELECT user_id FROM public.items WHERE id = item_id)
  );

DROP POLICY IF EXISTS "Only item owner or admin can update item_secrets" ON public.item_secrets;
CREATE POLICY "Only item owner or admin can update item_secrets" ON public.item_secrets
  FOR UPDATE USING (
    public.is_admin() OR
    auth.uid() = (SELECT user_id FROM public.items WHERE id = item_id)
  );

DROP POLICY IF EXISTS "Only item owner or admin can delete item_secrets" ON public.item_secrets;
CREATE POLICY "Only item owner or admin can delete item_secrets" ON public.item_secrets
  FOR DELETE USING (
    public.is_admin() OR
    auth.uid() = (SELECT user_id FROM public.items WHERE id = item_id)
  );

-- Trigger: Otomatis sinkronisasi hidden_details saat item dibuat/diedit ke item_secrets
-- Catatan: Menggunakan AFTER INSERT OR UPDATE agar relasi FK (item_secrets_item_id_fkey) valid
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

DROP TRIGGER IF EXISTS trg_sync_item_secrets ON public.items;
CREATE TRIGGER trg_sync_item_secrets
  AFTER INSERT OR UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_item_secrets();


-- 3. PERLINDUNGAN TABEL PROFILES (Mencegah Privilege Escalation & Unban Sendiri)
CREATE OR REPLACE FUNCTION public.protect_profile_modifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Cegah eskalasi hak akses pada UPDATE
  IF (NEW.role IS DISTINCT FROM OLD.role OR 
      NEW.is_super_admin IS DISTINCT FROM OLD.is_super_admin OR 
      NEW.is_banned IS DISTINCT FROM OLD.is_banned) THEN
      
    -- Hanya admin yang boleh mengubah role atau status banned
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Akses Ditolak: Anda tidak memiliki izin untuk mengubah role, status super admin, atau status blokir.';
    END IF;

    -- Hanya Super Admin yang boleh mengangkat/mencopot status is_super_admin
    IF (NEW.is_super_admin IS DISTINCT FROM OLD.is_super_admin) THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_super_admin = true
      ) THEN
        RAISE EXCEPTION 'Akses Ditolak: Hanya Super Admin yang dapat mengubah status Super Admin.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_modifications ON public.profiles;
CREATE TRIGGER trg_protect_profile_modifications
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_modifications();

-- Trigger INSERT profiles: Wajibkan default 'user' dan is_super_admin false
CREATE OR REPLACE FUNCTION public.protect_profile_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true) THEN
    NEW.role := 'user';
    NEW.is_super_admin := false;
    NEW.is_banned := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_insert ON public.profiles;
CREATE TRIGGER trg_protect_profile_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_insert();

-- RLS Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are readable by anyone" ON public.profiles;
CREATE POLICY "Public profiles are readable by anyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (
    (auth.uid() = id AND public.is_active_user()) OR public.is_admin()
  );


-- 4. PERLINDUNGAN TABEL ITEMS (Mencegah Bypass Moderasi & Pemalsuan Pemilik)
CREATE OR REPLACE FUNCTION public.protect_item_modifications()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NOT public.is_active_user() THEN
      RAISE EXCEPTION 'Akun Anda sedang diblokir.';
    END IF;

    IF TG_OP = 'INSERT' THEN
      NEW.post_status := 'menunggu_review';
      NEW.reviewed_by := NULL;
      NEW.reviewed_at := NULL;
      NEW.rejection_reason := NULL;
      NEW.user_id := auth.uid();
    END IF;

    IF TG_OP = 'UPDATE' THEN
      -- Dilarang memindahkan kepemilikan
      IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'Tidak dapat memindahkan kepemilikan postingan.';
      END IF;

      -- Dilarang bypass status moderasi menjadi disetujui sendiri
      IF NEW.post_status IS DISTINCT FROM OLD.post_status THEN
        IF NEW.post_status = 'disetujui' THEN
          RAISE EXCEPTION 'Hanya admin posko yang dapat menyetujui postingan barang.';
        END IF;
      END IF;

      -- Dilarang memalsukan catatan & stempel verifikasi admin
      IF NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at THEN
        RAISE EXCEPTION 'Anda tidak diizinkan memodifikasi verifikasi admin.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_item_modifications ON public.items;
CREATE TRIGGER trg_protect_item_modifications
  BEFORE INSERT OR UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_item_modifications();

-- RLS Items
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved items are viewable by everyone" ON public.items;
CREATE POLICY "Approved items are viewable by everyone" ON public.items
  FOR SELECT USING (
    post_status = 'disetujui' OR 
    auth.uid() = user_id OR 
    public.is_admin()
  );

DROP POLICY IF EXISTS "Users can insert their own items" ON public.items;
CREATE POLICY "Users can insert their own items" ON public.items
  FOR INSERT WITH CHECK (
    public.is_active_user() AND 
    auth.uid() = user_id AND 
    (post_status = 'menunggu_review' OR public.is_admin())
  );

DROP POLICY IF EXISTS "Users can update their own open items or Admin can update anyth" ON public.items;
DROP POLICY IF EXISTS "Users can update their own items or Admin can update anything" ON public.items;
CREATE POLICY "Users can update their own items or Admin can update anything" ON public.items
  FOR UPDATE USING (
    public.is_admin() OR 
    (auth.uid() = user_id AND public.is_active_user())
  );

DROP POLICY IF EXISTS "Admins and owners can delete items" ON public.items;
CREATE POLICY "Admins and owners can delete items" ON public.items
  FOR DELETE USING (
    public.is_admin() OR 
    (auth.uid() = user_id AND public.is_active_user())
  );


-- 5. PERLINDUNGAN TABEL CLAIMS (Mencegah Self-Approval & Manipulasi Skor Uji)
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

    -- Dilarang mengubah status menjadi disetujui / cocok sendiri
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NEW.status IN ('disetujui', 'cocok') THEN
        RAISE EXCEPTION 'Hanya admin posko yang berhak memverifikasi dan menyetujui klaim barang.';
      END IF;
    END IF;

    -- Dilarang memalsukan skor uji blind test atau catatan admin
    IF NEW.blind_test_score IS DISTINCT FROM OLD.blind_test_score OR
       NEW.admin_notes IS DISTINCT FROM OLD.admin_notes OR
       NEW.verified_by IS DISTINCT FROM OLD.verified_by OR
       NEW.verified_at IS DISTINCT FROM OLD.verified_at THEN
      RAISE EXCEPTION 'Anda tidak diizinkan memodifikasi verifikasi admin atau skor pengujian.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_claim_modifications ON public.claims;
CREATE TRIGGER trg_protect_claim_modifications
  BEFORE UPDATE ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_claim_modifications();

-- RLS Claims
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Claimer, Item Owner, or Admin can see claims" ON public.claims;
CREATE POLICY "Claimer, Item Owner, or Admin can see claims" ON public.claims
  FOR SELECT USING (
    auth.uid() = claimer_id OR
    auth.uid() IN (SELECT user_id FROM public.items WHERE id = item_id) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Authenticated users can submit a claim" ON public.claims;
CREATE POLICY "Authenticated users can submit a claim" ON public.claims
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    (
      public.is_active_user() AND 
      auth.uid() = claimer_id AND
      status = 'menunggu_admin' AND
      blind_test_score = 0 AND
      verified_by IS NULL
    )
  );

DROP POLICY IF EXISTS "Claimer or Admin can update claims" ON public.claims;
CREATE POLICY "Claimer or Admin can update claims" ON public.claims
  FOR UPDATE USING (
    public.is_admin() OR 
    (auth.uid() = claimer_id AND public.is_active_user())
  );

DROP POLICY IF EXISTS "Claimer or Admin can delete claims" ON public.claims;
CREATE POLICY "Claimer or Admin can delete claims" ON public.claims
  FOR DELETE USING (
    public.is_admin() OR 
    (auth.uid() = claimer_id AND public.is_active_user())
  );


-- 6. PERLINDUNGAN TABEL FOUND_REPORTS (Laporan Penemuan)
CREATE OR REPLACE FUNCTION public.protect_found_report_modifications()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NOT public.is_active_user() THEN
      RAISE EXCEPTION 'Akun Anda sedang diblokir.';
    END IF;

    IF NEW.reporter_id IS DISTINCT FROM OLD.reporter_id OR NEW.item_id IS DISTINCT FROM OLD.item_id THEN
      RAISE EXCEPTION 'Tidak dapat mengubah pelapor atau item target.';
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Hanya admin posko yang dapat menyetujui laporan penemuan barang.';
    END IF;

    IF NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by OR 
       NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at OR 
       NEW.admin_notes IS DISTINCT FROM OLD.admin_notes THEN
      RAISE EXCEPTION 'Anda tidak diizinkan memodifikasi verifikasi admin.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_found_report_modifications ON public.found_reports;
CREATE TRIGGER trg_protect_found_report_modifications
  BEFORE UPDATE ON public.found_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_found_report_modifications();

-- RLS Found Reports
ALTER TABLE public.found_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reporter, item owner, or admin can see found_reports" ON public.found_reports;
CREATE POLICY "Reporter, item owner, or admin can see found_reports" ON public.found_reports
  FOR SELECT USING (
    auth.uid() = reporter_id OR
    auth.uid() IN (SELECT user_id FROM public.items WHERE id = item_id) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Authenticated users can submit found_reports" ON public.found_reports;
CREATE POLICY "Authenticated users can submit found_reports" ON public.found_reports
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    (
      public.is_active_user() AND 
      auth.uid() = reporter_id AND 
      status = 'menunggu_review' AND 
      reviewed_by IS NULL
    )
  );

DROP POLICY IF EXISTS "Admin can update found_reports" ON public.found_reports;
CREATE POLICY "Admin can update found_reports" ON public.found_reports
  FOR UPDATE USING (
    public.is_admin() OR
    (auth.uid() = reporter_id AND public.is_active_user())
  );


-- 7. PERLINDUNGAN TABEL MATCHES & TANDA TANGAN DIGITAL BAST
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

    -- Dilarang memalsukan tanda tangan admin posko
    IF NEW.admin_signed_at IS DISTINCT FROM OLD.admin_signed_at OR 
       NEW.admin_signer_name IS DISTINCT FROM OLD.admin_signer_name THEN
      RAISE EXCEPTION 'Hanya admin posko yang berhak menandatangani BAST sebagai Admin.';
    END IF;

    -- Pemilik tidak boleh memalsukan tanda tangan penemu
    IF auth.uid() = OLD.owner_id AND auth.uid() != OLD.finder_id THEN
      IF NEW.finder_signed_at IS DISTINCT FROM OLD.finder_signed_at OR
         NEW.finder_signer_name IS DISTINCT FROM OLD.finder_signer_name OR
         NEW.finder_signer_nim IS DISTINCT FROM OLD.finder_signer_nim THEN
        RAISE EXCEPTION 'Pemilik barang tidak dapat memalsukan tanda tangan penemu.';
      END IF;
    END IF;

    -- Penemu tidak boleh memalsukan tanda tangan pemilik
    IF auth.uid() = OLD.finder_id AND auth.uid() != OLD.owner_id THEN
      IF NEW.owner_signed_at IS DISTINCT FROM OLD.owner_signed_at OR
         NEW.owner_signer_name IS DISTINCT FROM OLD.owner_signer_name OR
         NEW.owner_signer_nim IS DISTINCT FROM OLD.owner_signer_nim THEN
        RAISE EXCEPTION 'Penemu barang tidak dapat memalsukan tanda tangan pemilik.';
      END IF;
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

-- RLS Matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Involved parties or admin can see match" ON public.matches;
DROP POLICY IF EXISTS "Involved parties or approving admin can see match" ON public.matches;
CREATE POLICY "Involved parties or approving admin can see match" ON public.matches
  FOR SELECT USING (
    public.is_admin() OR
    auth.uid() = finder_id OR 
    auth.uid() = owner_id OR 
    auth.uid() = approved_by
  );

DROP POLICY IF EXISTS "Admins or involved parties can insert matches" ON public.matches;
CREATE POLICY "Only admins can insert matches" ON public.matches
  FOR INSERT WITH CHECK (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins or involved parties can update matches" ON public.matches;
CREATE POLICY "Involved parties or admin can update matches" ON public.matches
  FOR UPDATE USING (
    public.is_admin() OR
    (
      public.is_active_user() AND 
      (auth.uid() = finder_id OR auth.uid() = owner_id)
    )
  );

DROP POLICY IF EXISTS "Admins or involved parties can delete matches" ON public.matches;
DROP POLICY IF EXISTS "Involved parties or approving admin can delete matches" ON public.matches;
CREATE POLICY "Only admins can delete matches" ON public.matches
  FOR DELETE USING (
    public.is_admin()
  );


-- 8. PERLINDUNGAN TABEL MESSAGES (Chat)
CREATE OR REPLACE FUNCTION public.protect_message_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    -- Jika bukan pengirim aslinya, hanya diizinkan menandai pesan dibaca (is_read = true)
    IF auth.uid() != OLD.sender_id THEN
      IF NEW.content IS DISTINCT FROM OLD.content OR 
         NEW.sender_id IS DISTINCT FROM OLD.sender_id OR 
         NEW.type IS DISTINCT FROM OLD.type THEN
        RAISE EXCEPTION 'Anda tidak diizinkan mengubah teks chat yang dikirim oleh pengguna lain.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_message_updates ON public.messages;
CREATE TRIGGER trg_protect_message_updates
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_message_updates();

-- RLS Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Involved parties can read messages" ON public.messages;
DROP POLICY IF EXISTS "Involved parties or approving admin can read messages" ON public.messages;
CREATE POLICY "Involved parties or approving admin can read messages" ON public.messages
  FOR SELECT USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id AND (m.finder_id = auth.uid() OR m.owner_id = auth.uid() OR m.approved_by = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Involved parties can post messages" ON public.messages;
DROP POLICY IF EXISTS "Admin can post messages in any match" ON public.messages;
DROP POLICY IF EXISTS "Involved parties or approving admin can post messages" ON public.messages;
CREATE POLICY "Involved parties or approving admin can post messages" ON public.messages
  FOR INSERT WITH CHECK (
    public.is_active_user() AND
    auth.uid() = sender_id AND
    (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.matches m
        WHERE m.id = match_id AND (m.finder_id = auth.uid() OR m.owner_id = auth.uid() OR m.approved_by = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Involved parties can update messages" ON public.messages;
DROP POLICY IF EXISTS "Involved parties or approving admin can update messages" ON public.messages;
CREATE POLICY "Involved parties can update messages" ON public.messages
  FOR UPDATE USING (
    public.is_admin() OR
    (
      public.is_active_user() AND
      EXISTS (
        SELECT 1 FROM public.matches m
        WHERE m.id = match_id AND (m.finder_id = auth.uid() OR m.owner_id = auth.uid() OR m.approved_by = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Sender or admin can delete messages" ON public.messages;
CREATE POLICY "Sender or admin can delete messages" ON public.messages
  FOR DELETE USING (
    public.is_admin() OR
    (auth.uid() = sender_id AND public.is_active_user())
  );


-- 9. PERLINDUNGAN TABEL ORDERS (Runner)
CREATE OR REPLACE FUNCTION public.protect_order_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NOT public.is_active_user() THEN
      RAISE EXCEPTION 'Akun Anda sedang diblokir.';
    END IF;

    IF NEW.requester_id IS DISTINCT FROM OLD.requester_id THEN
      RAISE EXCEPTION 'Tidak dapat mengubah pemesan order.';
    END IF;

    -- Non-admin dilarang mengubah ongkir, status bayar, atau runner
    IF NEW.fee_amount IS DISTINCT FROM OLD.fee_amount OR
       NEW.payment_status IS DISTINCT FROM OLD.payment_status OR
       NEW.runner_name IS DISTINCT FROM OLD.runner_name OR
       NEW.runner_phone IS DISTINCT FROM OLD.runner_phone OR
       NEW.managed_by IS DISTINCT FROM OLD.managed_by THEN
      RAISE EXCEPTION 'Hanya admin posko yang dapat menetapkan ongkir, pembayaran, dan penugasan runner.';
    END IF;

    -- Pemesan hanya boleh membatalkan jika status masih 'menunggu'
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NOT (OLD.status = 'menunggu' AND NEW.status = 'dibatalkan') THEN
        RAISE EXCEPTION 'Pemesan hanya dapat membatalkan pesanan yang masih berstatus menunggu.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_order_updates ON public.orders;
CREATE TRIGGER trg_protect_order_updates
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_order_updates();

-- RLS Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Orders can be viewed by requester or admin" ON public.orders;
CREATE POLICY "Orders can be viewed by requester or admin" ON public.orders
  FOR SELECT USING (
    public.is_admin() OR auth.uid() = requester_id
  );

DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
CREATE POLICY "Authenticated users can create orders" ON public.orders
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    (
      public.is_active_user() AND 
      auth.uid() = requester_id AND 
      status = 'menunggu' AND 
      payment_status = 'belum_bayar' AND 
      managed_by IS NULL
    )
  );

DROP POLICY IF EXISTS "Orders can be updated by requester or admin" ON public.orders;
CREATE POLICY "Orders can be updated by requester or admin" ON public.orders
  FOR UPDATE USING (
    public.is_admin() OR 
    (auth.uid() = requester_id AND public.is_active_user())
  );

DROP POLICY IF EXISTS "Orders can be deleted by requester or admin" ON public.orders;
CREATE POLICY "Orders can be deleted by requester or admin" ON public.orders
  FOR DELETE USING (
    public.is_admin()
  );


-- 10. PERLINDUNGAN TABEL NOTIFICATIONS (Anti-Phishing & Anti-Spam)
CREATE OR REPLACE FUNCTION public.protect_notification_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NOT public.is_active_user() THEN
      RAISE EXCEPTION 'Akun Anda sedang diblokir.';
    END IF;

    IF LENGTH(NEW.title) > 200 OR LENGTH(NEW.body) > 1000 THEN
      RAISE EXCEPTION 'Ukuran notifikasi melebihi batas yang diizinkan.';
    END IF;

    -- Cegah phishing URL eksternal
    IF NEW.link IS NOT NULL AND NEW.link != '' AND (NEW.link ~* '^https?://' AND NOT NEW.link ~* '^https?://(localhost|[a-zA-Z0-9-]+\.unnes\.ac\.id|[a-zA-Z0-9-]+\.vercel\.app)') THEN
      RAISE EXCEPTION 'Tautan notifikasi tidak diizinkan.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_notification_insert ON public.notifications;
CREATE TRIGGER trg_protect_notification_insert
  BEFORE INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_notification_insert();

-- RLS Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin()
  );

DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    public.is_active_user()
  );

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (
    auth.uid() = user_id OR public.is_admin()
  );

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (
    auth.uid() = user_id OR public.is_admin()
  );


-- 11. RPC FUNCTION UNTUK ADMIN MEMBLOKIR/UNBLOCK USER
CREATE OR REPLACE FUNCTION public.set_user_ban_status(target_user_id UUID, ban_status BOOLEAN)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Hanya admin yang dapat mengubah status blokir pengguna';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Tidak dapat memblokir akun sendiri';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = target_user_id AND is_super_admin = true
  ) THEN
    RAISE EXCEPTION 'Tidak dapat memblokir Super Admin';
  END IF;

  UPDATE public.profiles 
  SET is_banned = ban_status, updated_at = NOW()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

