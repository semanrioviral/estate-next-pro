-- 1. Profiles Table (roles: admin, agente)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'agente' CHECK (role IN ('admin', 'agente')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  ciudad TEXT NOT NULL,
  barrio TEXT,
  precio NUMERIC NOT NULL,
  tipo TEXT CHECK (tipo IN ('casa', 'apartamento', 'lote')),
  habitaciones INTEGER DEFAULT 0,
  baños INTEGER DEFAULT 0,
  area_m2 NUMERIC,
  imagen_principal TEXT,
  slug TEXT UNIQUE NOT NULL,
  destacado BOOLEAN DEFAULT FALSE,
  agente_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Property Images Table
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Advisory Requests Table
CREATE TABLE IF NOT EXISTS public.advisory_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  mensaje TEXT,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'contactado', 'cerrado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisory_requests ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_agent_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'agente')
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS POLICIES

-- Profiles
DROP POLICY IF EXISTS "Public profiles are NOT viewable" ON public.profiles;
CREATE POLICY "Public profiles are NOT viewable" ON public.profiles FOR SELECT USING (false);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING ( public.is_admin() );

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Properties
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;
CREATE POLICY "Properties are viewable by everyone" ON public.properties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Agents can insert properties" ON public.properties;
CREATE POLICY "Agents can insert properties" ON public.properties FOR INSERT WITH CHECK ( public.is_agent_or_admin() );

DROP POLICY IF EXISTS "Agents can update own properties" ON public.properties;
CREATE POLICY "Agents can update own properties" ON public.properties FOR UPDATE USING (
  auth.uid() = agente_id OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins can delete properties" ON public.properties;
CREATE POLICY "Admins can delete properties" ON public.properties FOR DELETE USING ( public.is_admin() );

-- Property Images
DROP POLICY IF EXISTS "Images are viewable by everyone" ON public.property_images;
CREATE POLICY "Images are viewable by everyone" ON public.property_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Agents can CRUD images" ON public.property_images;
CREATE POLICY "Agents can CRUD images" ON public.property_images FOR ALL USING ( public.is_agent_or_admin() );

-- Advisory Requests
DROP POLICY IF EXISTS "Public can insert advisory requests" ON public.advisory_requests;
CREATE POLICY "Public can insert advisory_requests" ON public.advisory_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Agents/Admins can view requests" ON public.advisory_requests;
CREATE POLICY "Agents/Admins can view requests" ON public.advisory_requests FOR SELECT USING ( public.is_agent_or_admin() );

DROP POLICY IF EXISTS "Agents/Admins can update requests" ON public.advisory_requests;
CREATE POLICY "Agents/Admins can update requests" ON public.advisory_requests FOR UPDATE USING ( public.is_agent_or_admin() );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'agente');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
