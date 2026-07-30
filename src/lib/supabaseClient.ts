import { createClient } from '@supabase/supabase-js';

// These values are safe to expose in client-side code.
// The anon key only grants access allowed by Row Level Security policies
// configured in the Supabase project (see supabase_schema.sql).
const SUPABASE_URL = 'https://vbwdscfiihnqzvwuaxpc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid2RzY2ZpaWhucXp2d3VheHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NDA5OTMsImV4cCI6MjEwMTAxNjk5M30.bEzp__HClTaa87k27K_vyIJunpj1rCOMQ9bIdRqiGeU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
