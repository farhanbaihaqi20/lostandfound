-- =========================================================================
-- UNNES LOST & FOUND - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_type AS ENUM ('hilang', 'temuan');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE post_status AS ENUM ('menunggu_review', 'disetujui', 'ditolak');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_status AS ENUM ('terbuka', 'diklaim', 'cocok', 'dikembalikan', 'ditutup');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    nim TEXT DEFAULT '',
    fakultas TEXT DEFAULT '',
    prodi TEXT DEFAULT '',
    role user_role DEFAULT 'user',
    is_banned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    item_code TEXT UNIQUE NOT NULL,
    type item_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location_building TEXT NOT NULL,
    location_floor TEXT DEFAULT '',
    location_room TEXT DEFAULT '',
    location_detail TEXT DEFAULT '',
    post_status post_status DEFAULT 'menunggu_review',
    item_status item_status DEFAULT 'terbuka',
    rejection_reason TEXT DEFAULT '',
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    hidden_details TEXT DEFAULT '',
    blind_test_questions JSONB DEFAULT '[]'::jsonb,
    bounty_amount INTEGER DEFAULT 0,
    bounty_status TEXT DEFAULT 'tidak_ada',
    date_lost_found TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    returned_to TEXT DEFAULT '',
    returned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
    claimer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    item_title TEXT DEFAULT '',
    item_code TEXT DEFAULT '',
    claimer_name TEXT DEFAULT '',
    claimer_email TEXT DEFAULT '',
    claimer_phone TEXT DEFAULT '',
    status TEXT DEFAULT 'menunggu_admin',
    blind_test_answers JSONB DEFAULT '[]'::jsonb,
    blind_test_score INTEGER DEFAULT 0,
    admin_notes TEXT DEFAULT '',
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    message TEXT DEFAULT '',
    is_reapplication BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
    item_title TEXT,
    item_code TEXT,
    finder_id UUID REFERENCES public.profiles(id) NOT NULL,
    finder_name TEXT,
    owner_id UUID REFERENCES public.profiles(id) NOT NULL,
    owner_name TEXT,
    status TEXT DEFAULT 'aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 7. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ORDERS TABLE (Runner / Jasa Antar Kampus)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
    item_title TEXT DEFAULT '',
    item_code TEXT DEFAULT '',
    requester_id UUID REFERENCES public.profiles(id) NOT NULL,
    requester_name TEXT DEFAULT '',
    requester_phone TEXT DEFAULT '',
    service_type TEXT NOT NULL,
    status TEXT DEFAULT 'menunggu',
    pickup_location TEXT NOT NULL,
    delivery_location TEXT NOT NULL,
    fee_amount INTEGER DEFAULT 8000,
    payment_status TEXT DEFAULT 'belum_bayar',
    payment_method TEXT DEFAULT 'tunai',
    runner_name TEXT DEFAULT '',
    runner_phone TEXT DEFAULT '',
    runner_notes TEXT DEFAULT '',
    evidence_photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    managed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link TEXT DEFAULT '',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by anyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Items Policies: Public can only see approved items
CREATE POLICY "Approved items are viewable by everyone" ON public.items
  FOR SELECT USING (post_status = 'disetujui' OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own items" ON public.items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own open items or Admin can update anything" ON public.items
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- Claims Policies
CREATE POLICY "Claimer, Item Owner, or Admin can see claims" ON public.claims
  FOR SELECT USING (
    auth.uid() = claimer_id OR
    auth.uid() IN (SELECT user_id FROM public.items WHERE id = item_id) OR
    public.is_admin() OR
    status = 'disetujui'
  );

CREATE POLICY "Authenticated users can submit a claim" ON public.claims
  FOR INSERT WITH CHECK (auth.uid() = claimer_id OR public.is_admin());

CREATE POLICY "Claimer or Admin can update claims" ON public.claims
  FOR UPDATE USING (auth.uid() = claimer_id OR public.is_admin());

CREATE POLICY "Claimer or Admin can delete claims" ON public.claims
  FOR DELETE USING (auth.uid() = claimer_id OR public.is_admin());

-- Matches & Messages
CREATE POLICY "Involved parties or admin can see match" ON public.matches
  FOR SELECT USING (auth.uid() = finder_id OR auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Admins or involved parties can insert matches" ON public.matches
  FOR INSERT WITH CHECK (public.is_admin() OR auth.uid() = finder_id OR auth.uid() = owner_id);

CREATE POLICY "Admins or involved parties can update matches" ON public.matches
  FOR UPDATE USING (public.is_admin() OR auth.uid() = finder_id OR auth.uid() = owner_id);

CREATE POLICY "Admins or involved parties can delete matches" ON public.matches
  FOR DELETE USING (public.is_admin() OR auth.uid() = finder_id OR auth.uid() = owner_id);

CREATE POLICY "Involved parties can read messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id AND (m.finder_id = auth.uid() OR m.owner_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Involved parties can post messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id AND (m.finder_id = auth.uid() OR m.owner_id = auth.uid())
    )
  );

-- Orders Policies
CREATE POLICY "Orders can be viewed by requester or admin" ON public.orders
  FOR SELECT USING (auth.uid() = requester_id OR public.is_admin());

CREATE POLICY "Authenticated users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = requester_id OR public.is_admin());

CREATE POLICY "Orders can be updated by requester or admin" ON public.orders
  FOR UPDATE USING (auth.uid() = requester_id OR public.is_admin());

CREATE POLICY "Orders can be deleted by requester or admin" ON public.orders
  FOR DELETE USING (auth.uid() = requester_id OR public.is_admin());


-- Auto create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 12. ADMIN MANAGEMENT: Super Admin flag & Role Management RPC
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Function untuk admin mengubah role user lain (via RPC)
CREATE OR REPLACE FUNCTION public.set_user_role(target_user_id UUID, new_role user_role)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Hanya admin yang dapat mengubah role pengguna';
  END IF;
  
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Tidak dapat mengubah role diri sendiri';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = target_user_id AND is_super_admin = true
  ) AND new_role = 'user' THEN
    RAISE EXCEPTION 'Tidak dapat menghapus role Super Admin';
  END IF;
  
  UPDATE public.profiles 
  SET role = new_role, updated_at = NOW()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
