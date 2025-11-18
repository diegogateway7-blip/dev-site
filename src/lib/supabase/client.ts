import { createBrowserClient, type SupabaseClient } from '@supabase/ssr';

type Credentials = {
  url?: string | null;
  anonKey?: string | null;
};

declare global {
  interface Window {
    __SUPABASE_OVERRIDE__?: Credentials;
  }
}

let cachedClient: SupabaseClient | null = null;
let cachedCreds: Credentials = {};

function readCredentials(): Credentials {
  if (typeof window === 'undefined') {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
  }

  const override = window.__SUPABASE_OVERRIDE__;
  if (override?.url && override?.anonKey) {
    return override;
  }

  const lsUrl = window.localStorage.getItem('supabase-url-override');
  const lsAnon = window.localStorage.getItem('supabase-anon-override');
  if (lsUrl && lsAnon) {
    const creds = { url: lsUrl, anonKey: lsAnon };
    window.__SUPABASE_OVERRIDE__ = creds;
    return creds;
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

function ensureClient() {
  const { url, anonKey } = readCredentials();

  if (!url || !anonKey) {
    throw new Error('Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL/ANON_KEY ou use /admin/config.');
  }

  if (!cachedClient || cachedCreds.url !== url || cachedCreds.anonKey !== anonKey) {
    cachedClient = createBrowserClient(url, anonKey);
    cachedCreds = { url, anonKey };
  }

  return cachedClient;
}

export function createClient() {
  return ensureClient();
}

export function setSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window === 'undefined') return;
  window.__SUPABASE_OVERRIDE__ = { url, anonKey };
  window.localStorage.setItem('supabase-url-override', url);
  window.localStorage.setItem('supabase-anon-override', anonKey);
  cachedClient = null;
}

export function clearSupabaseCredentialsOverrides() {
  if (typeof window === 'undefined') return;
  window.__SUPABASE_OVERRIDE__ = undefined;
  window.localStorage.removeItem('supabase-url-override');
  window.localStorage.removeItem('supabase-anon-override');
  cachedClient = null;
}
