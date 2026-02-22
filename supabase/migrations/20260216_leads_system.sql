-- Migration: 20260216_leads_system.sql
-- Description: Create leads table for the professional lead capture system

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    mensaje TEXT,
    estado TEXT DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'contactado', 'cerrado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_property_id ON leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads(estado);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policies for admin panel
CREATE POLICY "Admins can view all leads"
ON leads FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can update lead status"
ON leads FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for public lead creation
CREATE POLICY "Public can create leads"
ON leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

COMMENT ON TABLE leads IS 'Table to store property inquiries/leads';
