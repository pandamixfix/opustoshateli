import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Добавляем <any, "public", any>, чтобы TypeScript не блокировал неизвестные таблицы
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabaseInstance: SupabaseClient<any, "public", any> | null = null;

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  // Инициализируем клиента с отключенной паранойей TypeScript
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseInstance = createSupabaseClient<any, "public", any>(url, key);

  return supabaseInstance;
}