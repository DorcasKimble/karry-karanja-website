// Karry Karanja Savings Tracker - Supabase client
// This file intentionally uses the Supabase publishable key. Never put a secret/service-role key here.
const SUPABASE_URL = 'https://bvrphlphiewmatswucry.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_hnx1lZ29tIgluh6l8QXDcg_-pMZuJme';
window.kkSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
