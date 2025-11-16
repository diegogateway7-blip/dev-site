"use client";
import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [modelosCount, setModelosCount] = useState<number>(0);
  const [mediaCount, setMediaCount] = useState<number>(0);
  const [ultimosModelos, setUltimosModelos] = useState<any[]>([]);
  const [ultimasMidias, setUltimasMidias] = useState<any[]>([]);
  const [erro, setErro] = useState<string|null>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  async function fetchSummary() {
    setLoading(true);
    setErro(null);
    const supabase = getSupabaseClient();
    try {
      let { count: mCount } = await supabase.from("models").select("id", { count: "exact", head: true });
      setModelosCount(mCount ?? 0);
      let { count: gCount } = await supabase.from("media").select("id", { count: "exact", head: true });
      setMediaCount(gCount ?? 0);
      let { data: ultModelData } = await supabase.from("models").select("*").order("id", { ascending: false }).limit(5);
      setUltimosModelos(ultModelData || []);
      let { data: ultMediaData } = await supabase.from("media").select("*, models(nome)").order("created_at", { ascending: false }).limit(5);
      setUltimasMidias(ultMediaData || []);
    } catch(e: any) {
      setErro("Erro ao buscar dados do dashboard: "+(e?.message || ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-8">Dashboard Administrativo</h2>
      {erro && <div className="text-red-600 mb-4">{erro}</div>}
      {loading ? <div>Carregando informações...</div> : (
        <>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded p-6 shadow-sm flex flex-col items-center">
              <div className="text-4xl font-bold">{modelosCount}</div>
              <div className="text-gray-700">Total de Modelos</div>
            </div>
            <div className="bg-gray-50 rounded p-6 shadow-sm flex flex-col items-center">
              <div className="text-4xl font-bold">{mediaCount}</div>
              <div className="text-gray-700">Total de Mídias</div>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Últimos Modelos Cadastrados</h3>
            <ul className="divide-y">
              {ultimosModelos.map(mod => (
                <li key={mod.id} className="py-2 flex items-center gap-4">
                  {mod.avatar_url && <img src={mod.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover" />}
                  <span className="font-medium">{mod.nome}</span>
                  <span className="ml-auto text-xs text-gray-600">ID: {mod.id}</span>
                  <Link href={`/admin/models/${mod.id}`} className="text-blue-600 ml-2 text-xs underline">Ver</Link>
                </li>
              ))}
              {ultimosModelos.length === 0 && <li className="py-2 text-gray-600">Nenhum modelo cadastrado.</li>}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Últimas Mídias Enviadas</h3>
            <ul className="divide-y">
              {ultimasMidias.map(m => (
                <li key={m.id} className="py-2 flex items-center gap-4">
                  {m.tipo === 'photo' ? (
                    <img src={m.url} alt="foto" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <span className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center font-bold text-lg text-blue-700">🎥</span>
                  )}
                  <span className="text-sm">{m.descricao}</span>
                  <span className="ml-auto text-xs text-gray-600">{m.models?.nome ? `Modelo: ${m.models.nome}` : ""}</span>
                  <Link href={`/admin/models/${m.modelo_id}/media`} className="text-blue-600 ml-2 text-xs underline">Ver</Link>
                </li>
              ))}
              {ultimasMidias.length === 0 && <li className="py-2 text-gray-600">Nenhuma mídia enviada.</li>}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
