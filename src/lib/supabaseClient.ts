import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variáveis globais para sobrescrever credenciais padrão de runtime
let _supabaseUrlOverride: string | null = null;
let _supabaseAnonKeyOverride: string | null = null;

export function setSupabaseCredentials(url: string, anonKey: string) {
  _supabaseUrlOverride = url;
  _supabaseAnonKeyOverride = anonKey;
}

export function clearSupabaseCredentialsOverrides() {
  _supabaseUrlOverride = null;
  _supabaseAnonKeyOverride = null;
}

export function getSupabaseClient(): SupabaseClient {
  // Primeiro: tenta sobrescrito em runtime
  const url = _supabaseUrlOverride || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = _supabaseAnonKeyOverride || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if(!url || !anonKey) {
    throw new Error('Supabase URL ou ANON KEY não configurados! Preencha na UI do painel admin ou via .env.');
  }
  return createClient(url, anonKey);
}
