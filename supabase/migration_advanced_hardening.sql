-- =========================================================================
-- UNNES LOST & FOUND - ADVANCED SECURITY HARDENING (SQLi, IDOR, XSS, DoS)
-- =========================================================================
-- Menutup celah eksploitasi Kali Linux: Burp Suite parameter tampering,
-- SQL injection fuzzing, Stored XSS payload, IDOR, dan payload DoS.
-- =========================================================================

-- 1. DATABASE CONSTRAINTS (Mencegah DoS, Nilai Negatif, dan Fuzzing Malicious Input)

-- Items: Batasan panjang judul, deskripsi, dan bounty
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS chk_items_title_length;
ALTER TABLE public.items ADD CONSTRAINT chk_items_title_length CHECK (length(title) >= 1 AND length(title) <= 200);

ALTER TABLE public.items DROP CONSTRAINT IF EXISTS chk_items_desc_length;
ALTER TABLE public.items ADD CONSTRAINT chk_items_desc_length CHECK (length(description) <= 5000);

ALTER TABLE public.items DROP CONSTRAINT IF EXISTS chk_items_bounty_positive;
ALTER TABLE public.items ADD CONSTRAINT chk_items_bounty_positive CHECK (bounty_amount >= 0 AND bounty_amount <= 10000000);

-- Claims: Batasan skor 0-100 dan panjang pesan
ALTER TABLE public.claims DROP CONSTRAINT IF EXISTS chk_claims_score_range;
ALTER TABLE public.claims ADD CONSTRAINT chk_claims_score_range CHECK (blind_test_score >= 0 AND blind_test_score <= 100);

ALTER TABLE public.claims DROP CONSTRAINT IF EXISTS chk_claims_message_length;
ALTER TABLE public.claims ADD CONSTRAINT chk_claims_message_length CHECK (length(message) <= 3000);

-- Orders: Batasan tarif ongkir (tidak boleh negatif) dan panjang alamat
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS chk_orders_fee_range;
ALTER TABLE public.orders ADD CONSTRAINT chk_orders_fee_range CHECK (fee_amount >= 0 AND fee_amount <= 1000000);

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS chk_orders_location_length;
ALTER TABLE public.orders ADD CONSTRAINT chk_orders_location_length CHECK (length(pickup_location) <= 300 AND length(delivery_location) <= 300);

-- Messages: Batasan panjang isi chat (1-5000 karakter)
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS chk_messages_content_length;
ALTER TABLE public.messages ADD CONSTRAINT chk_messages_content_length CHECK (length(content) >= 1 AND length(content) <= 5000);

-- Notifications: Batasan panjang judul dan body
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS chk_notifs_title_length;
ALTER TABLE public.notifications ADD CONSTRAINT chk_notifs_title_length CHECK (length(title) >= 1 AND length(title) <= 200);

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS chk_notifs_body_length;
ALTER TABLE public.notifications ADD CONSTRAINT chk_notifs_body_length CHECK (length(body) <= 1000);

-- Profiles: Validasi format NIM dan Nomor Telepon (Mencegah injeksi karakter aneh)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_phone_format;
ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_phone_format CHECK (phone = '' OR (length(phone) >= 8 AND length(phone) <= 20 AND phone ~ '^[0-9+ ]+$'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_nim_format;
ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_nim_format CHECK (nim = '' OR (length(nim) >= 4 AND length(nim) <= 30 AND nim ~ '^[a-zA-Z0-9]+$'));


-- 2. VALIDASI PROTOKOL MEDIA & ANTI-STORED XSS PADA FOTO & AVATAR
CREATE OR REPLACE FUNCTION public.validate_item_media()
RETURNS TRIGGER AS $$
DECLARE
  url_item TEXT;
BEGIN
  IF NEW.photo_urls IS NOT NULL THEN
    FOREACH url_item IN ARRAY NEW.photo_urls LOOP
      IF url_item IS NOT NULL AND url_item != '' THEN
        IF NOT (url_item ~* '^(https?://|data:image/)') THEN
          RAISE EXCEPTION 'URL media tidak valid atau berbahaya: protokol tidak diizinkan.';
        END IF;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.validate_profile_media()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url != '' THEN
    IF NOT (NEW.avatar_url ~* '^(https?://|data:image/)') THEN
      RAISE EXCEPTION 'URL avatar tidak valid atau berbahaya: protokol tidak diizinkan.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_validate_items_media ON public.items;
CREATE TRIGGER trg_validate_items_media
  BEFORE INSERT OR UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_item_media();

DROP TRIGGER IF EXISTS trg_validate_profiles_media ON public.profiles;
CREATE TRIGGER trg_validate_profiles_media
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_media();


-- 3. ANTI-IDOR & ANTI-TAMPERING PADA PENGAJUAN KLAIM (CLAIMS)
CREATE OR REPLACE FUNCTION public.validate_claim_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.items 
      WHERE id = NEW.item_id AND post_status = 'disetujui' AND item_status NOT IN ('dikembalikan', 'ditutup')
    ) THEN
      RAISE EXCEPTION 'Barang tidak tersedia untuk diklaim.';
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.items WHERE id = NEW.item_id AND user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Anda tidak dapat mengajukan klaim atas barang yang Anda laporkan sendiri.';
    END IF;

    NEW.claimer_id := auth.uid();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_validate_claim_insert ON public.claims;
CREATE TRIGGER trg_validate_claim_insert
  BEFORE INSERT ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_claim_insert();


-- 4. ANTI-IDOR PADA LAPORAN PENEMUAN (FOUND_REPORTS)
CREATE OR REPLACE FUNCTION public.validate_found_report_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.items WHERE id = NEW.item_id AND post_status = 'disetujui'
    ) THEN
      RAISE EXCEPTION 'Barang yang dilaporkan tidak ditemukan atau belum disetujui.';
    END IF;

    NEW.reporter_id := auth.uid();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_validate_found_report_insert ON public.found_reports;
CREATE TRIGGER trg_validate_found_report_insert
  BEFORE INSERT ON public.found_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_found_report_insert();


-- 5. ANTI-BURP SUITE PARAMETER TAMPERING PADA RUNNER ORDERS
CREATE OR REPLACE FUNCTION public.validate_order_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.requester_id := auth.uid();
    NEW.fee_amount := 8000;
    NEW.payment_status := 'belum_bayar';
    NEW.status := 'menunggu';
    NEW.runner_name := '';
    NEW.runner_phone := '';
    NEW.managed_by := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_validate_order_insert ON public.orders;
CREATE TRIGGER trg_validate_order_insert
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_insert();
