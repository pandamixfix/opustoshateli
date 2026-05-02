import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Отключаем паранойю TypeScript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabaseInstance: SupabaseClient<any, "public", any> | null = null;

const REAL_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export function createClient() {
  if (supabaseInstance) return supabaseInstance;

  const isClient = typeof window !== 'undefined';
  
  // Если мы в браузере — шлем запросы через наш прокси (без VPN)
  // Если на сервере — шлем напрямую
  const url = isClient ? `${window.location.origin}/supabase` : REAL_URL;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseInstance = createSupabaseClient<any, "public", any>(url, KEY);
  return supabaseInstance;
}

// Умная функция: берет заблокированный URL и превращает его в нашу рабочую ссылку
export function toProxyUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (REAL_URL && url.startsWith(REAL_URL)) {
    return url.replace(REAL_URL, '/supabase');
  }
  return url;
}