-- Migration: 20260216_add_tipo_lead_to_leads.sql
-- Description: Add fields to segment leads by owner and location

-- Add columns if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='tipo_lead') THEN
        ALTER TABLE leads ADD COLUMN tipo_lead TEXT DEFAULT 'cliente';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='direccion') THEN
        ALTER TABLE leads ADD COLUMN direccion TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='ciudad') THEN
        ALTER TABLE leads ADD COLUMN ciudad TEXT;
    END IF;
END $$;

-- Update RLS (Policies already exist for insert/select, no changes needed if using generic authenticated/anon)
-- The existing policies for INSERT and SELECT on 'leads' will cover these new columns automatically.

COMMENT ON COLUMN leads.tipo_lead IS 'Categoría del lead: cliente (comprador/arrendatario) o propietario';
COMMENT ON COLUMN leads.direccion IS 'Dirección del inmueble (solo para propietarios)';
COMMENT ON COLUMN leads.ciudad IS 'Ciudad del inmueble (solo para propietarios)';
