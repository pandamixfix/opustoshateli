import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabaseInstance: SupabaseClient<any, "public", any> | null = null;

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Используем прокси вместо прямого адреса Supabase
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/supabase`   // на клиенте — через прокси
    : process.env.NEXT_PUBLIC_SUPABASE_URL || ''; // на сервере — напрямую

  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
              process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseInstance = createSupabaseClient<any, "public", any>(url, key);

  return supabaseInstance;
}