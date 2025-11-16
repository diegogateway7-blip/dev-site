"use client";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function AdminModelCreatePage() {
  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [redes, setRedes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Upload dos arquivos, se enviados
      let avatar_url = null;
      let banner_url = null;
      const supabase = getSupabaseClient();
      if (avatar) {
        const { data, error } = await supabase.storage.from("models").upload(`avatar_${Date.now()}_${avatar.name}`, avatar);
        if (error) throw error;
        avatar_url = supabase.storage.from("models").getPublicUrl(data.path).data.publicUrl;
      }
      if (banner) {
        const { data, error } = await supabase.storage.from("models").upload(`banner_${Date.now()}_${banner.name}`, banner);
        if (error) throw error;
        banner_url = supabase.storage.from("models").getPublicUrl(data.path).data.publicUrl;
      }
      // Cria modelo
      const { error: insertError } = await supabase.from("models").insert([
        {
          nome,
          bio,
          avatar_url,
          banner_url,
          redes
        },
      ]);
      if (insertError) throw insertError;
      toast({ title: "Modelo criado com sucesso!" });
      router.push("/admin/models");
    } catch(e: any) {
      setError("Erro ao cadastrar modelo " + (e?.message || ""));
      toast({ title: "Erro ao cadastrar modelo!", description: e?.message || "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: "avatar"|"banner") {
    const file = e.target.files?.[0] || null;
    if (type === "avatar") setAvatar(file);
    else setBanner(file);
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-6">Nova Modelo</h2>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label className="block font-medium mb-1">Nome</label>
          <input value={nome} onChange={e => setNome(e.target.value)} className="w-full border rounded p-2" required/>
        </div>
        <div>
          <label className="block font-medium mb-1">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full border rounded p-2" required/>
        </div>
        <div>
          <label className="block font-medium mb-1">Avatar</label>
          <input type="file" accept="image/*" onChange={e => handleFileChange(e,"avatar")} />
        </div>
        <div>
          <label className="block font-medium mb-1">Capa</label>
          <input type="file" accept="image/*" onChange={e => handleFileChange(e,"banner")} />
        </div>
        <div>
          <label className="block font-medium mb-1">Redes Sociais</label>
          <input value={redes} onChange={e => setRedes(e.target.value)} className="w-full border rounded p-2" placeholder="@instagram, @twitter, ..." />
        </div>
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 mt-2" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      </form>
    </div>
  );
}
