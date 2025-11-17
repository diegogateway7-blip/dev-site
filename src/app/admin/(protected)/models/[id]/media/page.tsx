"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { format } from "date-fns";

const PAGE_SIZE = 12;

export default function AdminModelMediaPage() {
  const params = useParams();
  const modelId = params?.id?.toString() ?? "";
  const { toast } = useToast();

  const [media, setMedia] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"photo"|"video">("photo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pendingDeleteId, setPendingDeleteId] = useState<string|null>(null);
  const [publicarEm, setPublicarEm] = useState(() => {
    const now = new Date();
    now.setSeconds(0,0);
    return now.toISOString().slice(0,16);
  });

  useEffect(() => {
    if (modelId) fetchMedia();
    // eslint-disable-next-line
  }, [modelId, busca, filtroTipo, page]);

  async function fetchMedia() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = supabase.from("media").select("*", { count: "exact" }).eq("modelo_id", modelId);
      if (busca) {
        query = query.ilike("descricao", `%${busca}%`);
      }
      if (filtroTipo) {
        query = query.eq("tipo", filtroTipo);
      }
      query = query.order("created_at", { ascending: false }).range((page-1)*PAGE_SIZE, (page*PAGE_SIZE)-1);
      const { data, count, error } = await query;
      if (error) throw error;
      setMedia(data || []);
      setTotal(count || 0);
    } catch(e: any) {
      setError("Erro ao buscar mídias: " + (e?.message || ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Escolha um arquivo"); return; }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let ext = file.name.split('.').pop();
      let filename = `${tipo}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from("media").upload(filename, file);
      if (error) throw error;
      const publicUrl = supabase.storage.from("media").getPublicUrl(data.path).data.publicUrl;
      const { error: insertError } = await supabase.from("media").insert([
        {
          modelo_id: modelId,
          url: publicUrl,
          tipo,
          descricao,
          publicar_em: new Date(publicarEm)
        }
      ]);
      if (insertError) throw insertError;
      setFile(null); setDescricao("");
      fetchMedia();
      toast({ title: "Mídia enviada com sucesso!" });
    } catch(e: any) {
      setError("Erro ao fazer upload: " + (e?.message || ""));
      toast({ title: "Erro ao enviar mídia", description: e?.message || "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const mediaItem = media.find(m => m.id === pendingDeleteId);
      if (mediaItem && mediaItem.url) {
        const path = mediaItem.url.split('/storage/v1/object/public/media/')[1];
        if (path) {
          await supabase.storage.from("media").remove([path]);
        }
      }
      const { error: delError } = await supabase.from("media").delete().eq("id", pendingDeleteId);
      if (delError) throw delError;
      fetchMedia();
      toast({ title: "Mídia excluída com sucesso!" });
    } catch(e: any) {
      setError("Erro ao deletar: " + (e?.message || ""));
      toast({ title: "Erro ao excluir mídia", description: e?.message || "", variant: "destructive" });
    } finally {
      setLoading(false);
      setPendingDeleteId(null);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] || null);
  }
  function handleBuscaChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBusca(e.target.value); setPage(1);
  }
  function handleTipoFiltroChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFiltroTipo(e.target.value); setPage(1);
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-6">Mídias da Modelo</h2>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      {/* Busca/filtro/paginação */}
      <div className="flex items-center gap-2 mb-5">
        <input value={busca} onChange={handleBuscaChange} className="border rounded p-2 w-full" placeholder="Buscar por descrição..." />
        <select value={filtroTipo} onChange={handleTipoFiltroChange} className="border p-2 rounded">
          <option value="">Todos</option>
          <option value="photo">Fotos</option>
          <option value="video">Vídeos</option>
        </select>
      </div>
      <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-3 mb-8 items-center">
        <select value={tipo} onChange={e => setTipo(e.target.value as any)} className="border p-2 rounded">
          <option value="photo">Foto</option>
          <option value="video">Vídeo</option>
        </select>
        <input type="file" accept={tipo==='photo'?'image/*':'video/*'} onChange={handleFileChange} />
        <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} className="flex-1 border rounded p-2" placeholder="Descrição ou legenda" />
        <input type="datetime-local" value={publicarEm} onChange={e=>setPublicarEm(e.target.value)} className="border rounded p-2" title="Agendar para" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading?"Enviando...":"Enviar"}</button>
      </form>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {media.map(m => (
          <div key={m.id} className="relative p-1 rounded shadow bg-gray-100 flex flex-col">
            {m.tipo === 'photo' ? (
              <img src={m.url} alt="midia" className="object-cover w-full h-36 rounded" />
            ) : (
              <video src={m.url} controls className="object-cover w-full h-36 rounded" />
            )}
            <div className="text-xs mt-1 mb-2 text-gray-700">
              {m.descricao} {' '}
              <span className={"ml-2 px-2 py-0.5 rounded text-xs " + (new Date(m.publicar_em) > new Date() ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800')}>
                {new Date(m.publicar_em) > new Date() ? 'Agendado' : 'Publicado'}
              </span>
              <span className="ml-2 text-gray-500">
                {m.publicar_em ? format(new Date(m.publicar_em), 'dd/MM/yyyy HH:mm') : ''}
              </span>
            </div>
            <Dialog open={pendingDeleteId === m.id} onOpenChange={v=>setPendingDeleteId(v?m.id:null)}>
              <DialogTrigger asChild>
                <button onClick={()=>setPendingDeleteId(m.id)} className="text-red-700 text-xs mt-auto hover:underline">Excluir</button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Exclusão</DialogTitle>
                  <DialogDescription>Tem certeza que deseja excluir esta mídia? Esta ação não pode ser desfeita.</DialogDescription>
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
