import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabaseInstance: SupabaseClient<any, "public", any> | null = null;

const REAL_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://guvgbfgtdrsvobkndbzl.supabase.co';
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export function createClient() {
  if (supabaseInstance) return supabaseInstance;

  const isClient = typeof window !== 'undefined';
  
  // ИСПРАВЛЕНИЕ ЗДЕСЬ: Добавляем window.location.origin, 
  // чтобы получить полный URL (например, http://localhost:3000/supabase)
  const url = isClient ? `${window.location.origin}/supabase` : REAL_URL;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseInstance = createSupabaseClient<any, "public", any>(url, KEY);
  return supabaseInstance;
}

export function toProxyUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith(REAL_URL)) {
    return url.replace(REAL_URL, '/supabase');
  }
  return url;
}