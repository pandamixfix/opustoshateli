import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabaseInstance: SupabaseClient<any, "public", any> | null = null;

export function createClient() {
  if (supabaseInstance) return supabaseInstance;

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/supabase`
    : process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
              process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseInstance = createSupabaseClient<any, "public", any>(url, key);
  return supabaseInstance;
}

// Заменяет прямой supabase URL на проксированный
export function toProxyUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const SUPABASE_URL = 'https://guvgbfgtdrsvobkndbzl.supabase.co';
  if (url.startsWith(SUPABASE_URL)) {
    return url.replace(SUPABASE_URL, '/supabase');
  }
  return url;
}