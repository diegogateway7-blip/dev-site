"use client";
import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

export default function AdminModelEditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const modelId = params?.id?.toString() ?? "";

  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [redes, setRedes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (modelId) fetchModel();
    // eslint-disable-next-line
  }, [modelId]);

  async function fetchModel() {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from("models").select("*").eq("id", modelId).single();
      if (error) throw error;
      setNome(data.nome || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url || null);
      setBannerUrl(data.banner_url || null);
      setRedes(data.redes || "");
    } catch (e: any) {
      setError(e?.message || "Não encontrado");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let newAvatarUrl = avatarUrl;
      let newBannerUrl = bannerUrl;
      const supabase = getSupabaseClient();
      if (avatar) {
        const { data, error } = await supabase.storage.from("models").upload(`avatar_${Date.now()}_${avatar.name}`, avatar, { upsert: true });
        if (error) throw error;
        newAvatarUrl = supabase.storage.from("models").getPublicUrl(data.path).data.publicUrl;
      }
      if (banner) {
        const { data, error } = await supabase.storage.from("models").upload(`banner_${Date.now()}_${banner.name}`, banner, { upsert: true });
        if (error) throw error;
        newBannerUrl = supabase.storage.from("models").getPublicUrl(data.path).data.publicUrl;
      }
      const { error: upError } = await supabase.from("models").update({ nome, bio, avatar_url: newAvatarUrl, banner_url: newBannerUrl, redes }).eq("id", modelId);
      if (upError) throw upError;
      toast({ title: "Modelo atualizado com sucesso!" });
      router.push("/admin/models");
    } catch (e: any) {
      setError("Erro ao salvar: " + (e?.message || ""));
      toast({ title: "Erro ao salvar modelo!", description: e?.message || "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { error: delError } = await supabase.from("models").delete().eq("id", modelId);
      if (delError) throw delError;
      toast({ title: "Modelo excluído com sucesso!" });
      router.push("/admin/models");
    } catch (e: any) {
      setError("Erro ao deletar: " + (e?.message || ""));
      toast({ title: "Erro ao excluir modelo!", description: e?.message || "", variant: "destructive" });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: "avatar"|"banner") {
    const file = e.target.files?.[0] || null;
    if (type === "avatar") setAvatar(file);
    else setBanner(file);
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-6">Editar Modelo</h2>
      {error && <div className="text-red-600 mb-3">{error}</div>}
      {loading ? <div>Carregando...</div> : (
        <form onSubmit={handleSave} className="grid gap-4">
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
            {avatarUrl && <img src={avatarUrl} className="w-24 h-24 mt-2 object-cover rounded-full" alt="avatar" />}
          </div>
          <div>
            <label className="block font-medium mb-1">Capa</label>
            <input type="file" accept="image/*" onChange={e => handleFileChange(e,"banner")} />
            {bannerUrl && <img src={bannerUrl} className="w-48 h-20 mt-2 object-cover rounded" alt="banner" />}
          </div>
          <div>
            <label className="block font-medium mb-1">Redes Sociais</label>
            <input value={redes} onChange={e => setRedes(e.target.value)} className="w-full border rounded p-2" placeholder="@instagram, @twitter, ..." />
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
              <DialogTrigger asChild>
                <button type="button" className="bg-red-600 text-white rounded px-4 py-2" disabled={loading}>Excluir</button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Exclusão</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <button className="bg-gray-200 rounded px-4 py-2">Cancelar</button>
                  </DialogClose>
                  <button onClick={handleDelete} className="bg-red-600 text-white rounded px-4 py-2" disabled={loading}>Excluir</button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </form>
      )}
    </div>
  );
}
