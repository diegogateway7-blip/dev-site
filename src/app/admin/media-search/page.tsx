"use client";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

export default function MediaSearchPage() {
  const { toast } = useToast();
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("");
  const [modelo, setModelo] = useState("");
  const [midias, setMidias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string|null>(null);
  const [error, setError] = useState<string|null>(null);

  async function handleBuscar(e: any) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const supabase = getSupabaseClient();
      let query = supabase.from("media").select("*", { count: "exact" });
      if (busca) query = query.ilike("descricao", `%${busca}%`);
      if (tipo) query = query.eq("tipo", tipo);
      if (modelo) query = query.eq("modelo_id", modelo);
      const { data, error } = await query.order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      setMidias(data||[]);
    } catch(e:any) { setError(e?.message||"Erro ao buscar!"); setMidias([]); }
    setLoading(false);
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const mediaItem = midias.find(m => m.id === pendingDeleteId);
      if (mediaItem && mediaItem.url) {
        const path = mediaItem.url.split('/storage/v1/object/public/media/')[1];
        if (path) {
          await supabase.storage.from("media").remove([path]);
        }
      }
      const { error: delError } = await supabase.from("media").delete().eq("id", pendingDeleteId);
      if (delError) throw delError;
      setMidias(midias.filter(m=>m.id !== pendingDeleteId));
      toast({ title: "Mídia removida com sucesso!" });
    } catch(e: any) {
      setError("Erro ao remover: " + (e?.message || ""));
      toast({ title: "Erro ao remover mídia", description: e?.message || "", variant: "destructive" });
    } finally {
      setLoading(false);
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-6">Buscar/Apagar Mídias</h2>
      <form onSubmit={handleBuscar} className="flex gap-3 mb-6">
        <input type="text" value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Descrição..." className="border p-2 rounded flex-1" />
        <select value={tipo} onChange={e=>setTipo(e.target.value)} className="border rounded p-2">
          <option value="">Todos</option>
          <option value="photo">Foto</option>
          <option value="video">Vídeo</option>
        </select>
        <input type="text" value={modelo} onChange={e=>setModelo(e.target.value)} placeholder="ID da Modelo (opcional)" className="border p-2 rounded flex-1" />
        <button className="bg-blue-600 text-white rounded px-4 py-2" disabled={loading}>{loading?'Buscando...':'Buscar'}</button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {midias.map(m=>
          <div key={m.id} className="relative p-2 bg-gray-50 rounded shadow flex flex-col">
            {m.tipo==='photo' ? <img src={m.url} className="rounded object-cover w-full h-32" alt="foto" /> : <video src={m.url} className="rounded object-cover w-full h-32" />}
            <div className="text-xs mt-1 text-gray-700">{m.descricao}</div>
            <div className="text-xs text-gray-400 mb-1">Modelo: {m.modelo_id?.slice(0,8)||'-'}</div>
            <div className="text-xs text-gray-400 mb-1">ID: {m.id?.slice(0,8)}</div>
            <div className="flex gap-2 mt-auto items-center">
              <Dialog open={pendingDeleteId===m.id} onOpenChange={v=>setPendingDeleteId(v?m.id:null)}>
                <DialogTrigger asChild>
                  <button onClick={()=>setPendingDeleteId(m.id)} className="text-xs px-2 py-1 rounded bg-red-700 text-white hover:bg-red-900">Excluir</button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar Exclusão</DialogTitle>
                    <DialogDescription>Deseja realmente deletar esta mídia?</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <button className="bg-gray-200 rounded px-4 py-2">Cancelar</button>
                    </DialogClose>
                    <button onClick={confirmDelete} className="bg-red-600 text-white rounded px-4 py-2" disabled={loading}>Excluir</button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
