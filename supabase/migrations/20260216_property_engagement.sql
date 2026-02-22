-- Phase 19: Intelligent User Behavior Engine
-- Create property_views table to track engagement

CREATE TABLE IF NOT EXISTS property_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_hash TEXT,
    session_id TEXT
);

-- Optimization indexes
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_created_at ON property_views(created_at);

-- RLS (Row Level Security) - Optional but good practice
-- Since this is for internal analytics, we might want to restrict inserts 
-- but for simplicity in this project we'll keep it open for service role or public if necessary.
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (views can be recorded by anyone)
CREATE POLICY "Enable public insert for property_views" ON property_views
    FOR INSERT WITH CHECK (true);

-- Allow service role to read/manage
CREATE POLICY "Enable service role access for property_views" ON property_views
    FOR ALL USING (true);
