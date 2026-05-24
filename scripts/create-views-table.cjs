const https = require('https');
const SUPABASE_URL = 'uehajzlrvqvirtsubsdq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaGFqemxydnF2aXJ0c3Vic2RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkzOTU5MiwiZXhwIjoyMDg2NTE1NTkyfQ.Nu-MXHv32NU7fPvtqfzC7QZ0IZ4Q48RJF0r7_kOaEPI';

const sql = `
CREATE TABLE IF NOT EXISTS property_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_hash TEXT,
    session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_created_at ON property_views(created_at);

ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable public insert for property_views" ON property_views;
CREATE POLICY "Enable public insert for property_views" ON property_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable service role access for property_views" ON property_views;
CREATE POLICY "Enable service role access for property_views" ON property_views FOR ALL USING (true);

GRANT SELECT, INSERT ON property_views TO anon, authenticated;
`;

const body = JSON.stringify({ query: sql });

const opts = {
  hostname: SUPABASE_URL,
  path: '/rest/v1/rpc/',
  method: 'POST',
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json'
  }
};

// Try the SQL endpoint directly
const sqlOpts = {
  hostname: SUPABASE_URL,
  path: '/sql',
  method: 'POST',
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(sqlOpts, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log(res.statusCode, d.slice(0, 500)));
});
req.on('error', e => console.error('Error:', e.message));
req.write(body);
req.end();
