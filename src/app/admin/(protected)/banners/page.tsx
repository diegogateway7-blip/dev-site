"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminBannersPage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File|null>(null);
  const [tipo, setTipo] = useState<'image'|'video'>('image');
  const [titulo, setTitulo] = useState("");
  const [link, setLink] = useState("");
  const [ordem, setOrdem] = useState<number>(1);
  const [ativo, setAtivo] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(()=>{ fetchBanners(); },[]);

  async function fetchBanners() {
    setLoading(true); setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('banners').select('*').order('ordem');
      if(error) throw error;
      setBanners(data||[]);
    } catch(e:any) { setError(e?.message||"Erro desconhecido"); }
    setLoading(false);
  }

  async function handleSaveBanner(e:any) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      let fileUrl = null;
      const supabase = createClient();
      if(bannerFile) {
        const { data, error } = await supabase.storage.from('banners').upload(`${Date.now()}_${bannerFile.name}`, bannerFile);
        if(error) throw error;
        fileUrl = supabase.storage.from('banners').getPublicUrl(data.path).data.publicUrl;
      }
      const { error: insertError } = await supabase.from('banners').insert([{
        titulo, tipo, link, ordem, ativo, url: fileUrl
      }]);
      if(insertError) throw insertError;
      toast({ title: "Banner cadastrado!" });
      setBannerFile(null); setTitulo(""); setLink(""); setOrdem(1); setAtivo(true); setTipo('image');
      fetchBanners();
    } catch(e:any) {
      setError(e?.message||"Erro ao salvar");
      toast({ title: "Erro ao cadastrar banner", description: e?.message||"", variant:"destructive" });
    }
    setLoading(false);
  }

  async function handleToggle(id: string, value: boolean) {
    const supabase = createClient();
    await supabase.from('banners').update({ ativo: value }).eq('id', id);
    fetchBanners();
  }

  function handleFile(e:any){ setBannerFile(e.target.files?.[0]||null); }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Banners / Destaques</h2>
      <form onSubmit={handleSaveBanner} className="grid grid-cols-1 gap-4 mb-8">
        <div className="flex gap-3">
          <select value={tipo} onChange={e=>setTipo(e.target.value as any)} className="border rounded p-2">
            <option value="image">Imagem</option>
            <option value="video">Vídeo</option>
          </select>
          <input type="file" accept={tipo==='image'?'image/*':'video/*'} onChange={handleFile} required className="" />
          <input type="text" placeholder="Título" value={titulo} onChange={e=>setTitulo(e.target.value)} className="border rounded p-2 flex-1" required />
          <input type="text" placeholder="Link (opcional)" value={link} onChange={e=>setLink(e.target.value)} className="border rounded p-2 flex-1" />
          <input type="number" placeholder="Ordem" value={ordem} onChange={e=>setOrdem(Number(e.target.value))} className="border rounded p-2 w-24" min={1} />
          <label className="flex items-center gap-1"><input type="checkbox" checked={ativo} onChange={e=>setAtivo(e.target.checked)} /> Ativo</label>
          <button className="bg-blue-600 text-white rounded px-4 py-2" disabled={loading}>{loading?'Salvando...':'Salvar'}</button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>
      <h3 className="font-bold mb-2">Banners cadastrados</h3>
      <ul className="grid gap-4">
        {banners.map(b=>(
          <li key={b.id} className="flex gap-4 items-center bg-gray-100 rounded p-3">
            {b.tipo==='image' && b.url && <img src={b.url} alt="banner" className="h-14 w-24 object-cover rounded" />}
            {b.tipo==='video' && b.url && <video src={b.url} className="h-14 w-24 object-cover rounded" />}
            <span className="font-semibold text-gray-800">{b.titulo}</span>
            <span className="text-xs px-2 py-1 rounded bg-gray-200 ml-2">Ordem: {b.ordem}</span>
            <span className={b.ativo ? "ml-2 text-green-700" : "ml-2 text-gray-400"}>{b.ativo ? 'Ativo' : 'Inativo'}</span>
            <button onClick={()=>handleToggle(b.id, !b.ativo)} className="ml-2 px-3 py-1 rounded bg-gray-300 text-xs hover:bg-gray-400">{b.ativo?'Desativar':'Ativar'}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

