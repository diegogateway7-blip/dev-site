"use client";
import { useState } from "react";
import { setSupabaseCredentials, clearSupabaseCredentialsOverrides } from "@/lib/supabaseClient";

export default function AdminConfigPage() {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  function handleApply() {
    if (!url || !anonKey) {
      setStatus("Preencha todos os campos!");
      return;
    }
    setSupabaseCredentials(url, anonKey);
    setStatus("Credenciais atualizadas para a sessão atual!");
  }

  function handleClear() {
    clearSupabaseCredentialsOverrides();
    setStatus("Voltou para as credenciais do .env");
  }

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-md shadow">
      <h2 className="text-xl font-bold mb-4">Configuração Supabase</h2>
      <div className="mb-3">
        <label className="block font-semibold mb-1 text-sm">Supabase URL</label>
        <input value={url} onChange={e => setUrl(e.target.value)} className="w-full border p-2 rounded mb-2" placeholder="https://...supabase.co" />
      </div>
      <div className="mb-3">
        <label className="block font-semibold mb-1 text-sm">Supabase Anon Key</label>
        <input value={anonKey} onChange={e => setAnonKey(e.target.value)} className="w-full border p-2 rounded mb-2" placeholder="chave secreta" />
      </div>
      <div className="flex gap-2 mb-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleApply}>Aplicar</button>
        <button className="bg-gray-600 text-white px-4 py-2 rounded" onClick={handleClear}>Usar .env</button>
      </div>
      {status && <div className="mt-2 text-sm text-center text-green-600">{status}</div>}
      <div className="mt-6 text-xs text-gray-600">
        <p>
          <b>Obs:</b> Para tornar permanente, altere também manualmente o arquivo <code>.env.local</code> (NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY).
          Aqui só troca para a sessão atual do painel!
        </p>
      </div>
    </div>
  );
}
