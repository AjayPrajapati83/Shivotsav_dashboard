import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Singleton instance
let _client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!_client) {
    _client = getSupabaseAdmin();
  }
  return _client;
}
