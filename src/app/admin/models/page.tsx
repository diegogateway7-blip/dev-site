"use client";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";

const PAGE_SIZE = 10;

export default function AdminModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [redeFiltro, setRedeFiltro] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line
  }, [busca, redeFiltro, page]);

  async function fetchModels() {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      let query = supabase.from("models").select("*", { count: "exact" });
      if (busca) {
        query = query.ilike("nome", `%${busca}%`);
      }
      if (redeFiltro) {
        query = query.ilike("redes", `%${redeFiltro}%`);
      }
      query = query.order("id", { ascending: false }).range((page-1)*PAGE_SIZE, (page*PAGE_SIZE)-1);
      const { data, count, error } = await query;
      if (error) {
        setError("Erro ao buscar modelos");
        setModels([]);
      } else {
        setModels(data || []);
        setTotal(count || 0);
      }
    } catch(e) {
      setError("Erro inesperado ao carregar modelos");
      setModels([]);
    } finally {
      setLoading(false);
    }
  }

  function handleBuscaChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBusca(e.target.value);
    setPage(1);
  }
  function handleRedeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRedeFiltro(e.target.value);
    setPage(1);
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 md:mb-0">Modelos</h2>
        </div>
        <div className="flex gap-2 flex-1 max-w-xl">
          <input value={busca} onChange={handleBuscaChange} className="border p-2 rounded w-full" placeholder="Buscar por nome..." />
          <input value={redeFiltro} onChange={handleRedeChange} className="border p-2 rounded w-full" placeholder="Buscar por redes sociais..." />
          <Link href="/admin/models/new" className="bg-blue-600 text-white px-4 py-2 rounded whitespace-nowrap">Adicionar Modelo</Link>
        </div>
      </div>
      {loading && <div>Carregando...</div>}
      {error && <div className="text-red-600 mb-3">{error}</div>}

      <div className="grid gap-4">
        {models.length === 0 && !loading && <div>Nenhum modelo cadastrado ainda.</div>}
        {models.map(model => (
          <div key={model.id} className="p-4 bg-white rounded shadow flex items-center gap-6">
            {model.avatar_url ? (
              <img src={model.avatar_url} alt="avatar" className="w-20 h-20 object-cover rounded-full border" />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-full" />
            )}
            <div className="flex-1">
              <div className="font-bold text-lg">{model.nome}</div>
              <div className="text-gray-600 text-sm">{model.bio}</div>
            </div>
            <Link href={`/admin/models/${model.id}`} className="text-blue-600 hover:underline">Editar</Link>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {(total > PAGE_SIZE) && (
        <div className="flex gap-4 justify-center py-6">
          <button className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50" disabled={page === 1} onClick={()=>setPage(v=>v-1)}>Anterior</button>
          <span className="self-center">Página {page} de {Math.ceil(total/PAGE_SIZE)}</span>
          <button className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50" disabled={page === Math.ceil(total/PAGE_SIZE)} onClick={()=>setPage(v=>v+1)}>Próxima</button>
        </div>
      )}
    </div>
  );
}
