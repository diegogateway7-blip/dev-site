"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Upload, ImageIcon, VideoIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Banner = {
  id: string;
  created_at: string;
  titulo: string;
  tipo: "image" | "video";
  url: string | null;
  link: string | null;
  ordem: number;
  ativo: boolean;
};

const bannerTypes = [
  { value: "image", label: "Imagem", hint: "JPG/PNG até 4MB" },
  { value: "video", label: "Vídeo curto", hint: "MP4 até 15MB" },
];

export default function AdminBannersPage() {
  const { toast } = useToast();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tipo, setTipo] = useState<"image" | "video">("image");
  const [titulo, setTitulo] = useState("");
  const [link, setLink] = useState("");
  const [ordem, setOrdem] = useState(1);
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchBanners() {
    setLoading(true);
    setSchemaMissing(false);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("banners").select("*").order("ordem", { ascending: true });
      if (error) {
        if (isMissingTableError(error, "banners")) {
          setSchemaMissing(true);
          setBanners([]);
        } else {
          throw error;
        }
      } else {
        setBanners((data as Banner[]) || []);
      }
    } catch (error: any) {
      toast({ title: "Erro ao carregar banners", description: error?.message || "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setFormError("Selecione um arquivo para o banner.");
      return;
    }
    setFormError(null);
    setSubmitting(true);

    try {
      const supabase = createClient();
      let uploadedUrl: string | null = null;
      if (file) {
        const path = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage.from("banners").upload(path, file, { upsert: true });
        if (error) throw error;
        uploadedUrl = supabase.storage.from("banners").getPublicUrl(data.path).data.publicUrl;
      }

      const payload = {
        titulo,
        tipo,
        link: link || null,
        ordem,
        ativo,
        url: uploadedUrl,
      };

      const { error } = await supabase.from("banners").insert([payload]);
      if (error) throw error;

      toast({ title: "Banner cadastrado com sucesso!" });
      resetForm();
      fetchBanners();
    } catch (error: any) {
      setFormError(error?.message || "Não foi possível salvar.");
      toast({ title: "Erro ao cadastrar banner", description: error?.message || "", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(id: string, value: boolean) {
    const supabase = createClient();
    const { error } = await supabase.from("banners").update({ ativo: value }).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar banner", description: error?.message || "", variant: "destructive" });
    } else {
      fetchBanners();
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir banner", description: error?.message || "", variant: "destructive" });
    } else {
      toast({ title: "Banner removido" });
      fetchBanners();
    }
  }

  function resetForm() {
    setFile(null);
    setPreviewUrl(null);
    setTitulo("");
    setLink("");
    setOrdem(1);
    setAtivo(true);
    setTipo("image");
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }

  const stats = useMemo(() => {
    const total = banners.length;
    return {
      total,
      ativos: banners.filter((banner) => banner.ativo).length,
      imagens: banners.filter((banner) => banner.tipo === "image").length,
      videos: banners.filter((banner) => banner.tipo === "video").length,
    };
  }, [banners]);

  if (schemaMissing) {
    return (
      <div className="container mx-auto max-w-4xl py-10">
        <Card className="border-red-500/30 bg-red-500/10 text-red-100">
          <CardHeader>
            <CardTitle>Tabela `banners` não encontrada</CardTitle>
            <CardDescription className="text-red-200">
              Execute o script SQL abaixo no Supabase (SQL Editor) e atualize a página:
            </CardDescription>
          </CardHeader>
          <CardContent className="font-mono text-sm text-red-100 space-y-4">
            <pre className="whitespace-pre-wrap break-words">
{`create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  titulo text not null,
  tipo text not null check (tipo in ('image','video')),
  url text,
  link text,
  ordem int not null default 1,
  ativo boolean not null default true
);
create index if not exists idx_banners_ordem on public.banners(ordem asc);
alter table public.banners enable row level security;
create policy "Banners are readable" on public.banners for select using (true);
create policy "Authenticated manages banners" on public.banners for all to authenticated using (true);`}
            </pre>
            <p>Também crie um bucket público chamado <strong>banners</strong> no Supabase Storage.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Gestão de destaque</p>
        <h1 className="text-3xl font-bold text-white">Banners & Heros</h1>
        <p className="text-white/70 max-w-2xl">Atualize o carrossel da landing principal com imagens ou vídeos curtos.</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <Card className="border-white/10 bg-[color:var(--surface-card)]/80 shadow-soft">
          <CardHeader>
            <CardTitle>Novo banner</CardTitle>
            <CardDescription>Faça upload, defina título e ordem de exibição.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo do arquivo</Label>
                <Select value={tipo} onValueChange={(value) => setTipo(value as "image" | "video")}>
                  <SelectTrigger className="bg-black/20">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {bannerTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col text-left">
                          <span>{type.label}</span>
                          <span className="text-xs text-muted-foreground">{type.hint}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Arquivo</Label>
                <div className="rounded-2xl border border-dashed border-white/20 p-4 text-sm text-white/60">
                  <label className="flex cursor-pointer items-center gap-3 text-white">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{file?.name || "Selecione um arquivo"}</p>
                      <p className="text-xs text-white/60">{tipo === "image" ? "PNG, JPG" : "MP4"}</p>
                    </div>
                    <input type="file" accept={tipo === "image" ? "image/*" : "video/*"} className="hidden" onChange={onFileChange} />
                  </label>
                  {previewUrl && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                      {tipo === "image" ? (
                        <Image src={previewUrl} alt="preview" width={400} height={200} className="h-40 w-full object-cover" />
                      ) : (
                        <video src={previewUrl} controls className="h-40 w-full rounded-xl bg-black/40" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={titulo} onChange={(event) => setTitulo(event.target.value)} placeholder="Pack destaque 4K" className="bg-black/20" required />
              </div>

              <div className="space-y-2">
                <Label>Link (opcional)</Label>
                <Input value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://..." className="bg-black/20" />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <Label>Ordem</Label>
                  <Input type="number" min={1} value={ordem} onChange={(event) => setOrdem(Number(event.target.value))} className="mt-1 w-24 bg-black/20" />
                </div>
                <div className="flex flex-1 items-center justify-between rounded-2xl border border-white/15 bg-black/20 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">Ativo</p>
                    <p className="text-xs text-white/60">Exibir imediatamente após salvar</p>
                  </div>
                  <Switch checked={ativo} onCheckedChange={setAtivo} />
                </div>
              </div>

              {formError && <p className="text-sm text-red-400">{formError}</p>}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar banner"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[color:var(--surface-card)]/90 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Banners atuais</CardTitle>
              <CardDescription>Arraste a ordem pelo Supabase ou edite individualmente.</CardDescription>
            </div>
            <div className="flex gap-2 text-xs">
              <Badge variant="outline">Total {stats.total}</Badge>
              <Badge variant="outline">Ativos {stats.ativos}</Badge>
              <Badge variant="outline">Fotos {stats.imagens}</Badge>
              <Badge variant="outline">Vídeos {stats.videos}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-sm text-white/60">Carregando...</div>
            ) : banners.length === 0 ? (
              <EmptyState
                icon={ImageIcon}
                title="Nenhum banner cadastrado"
                description="Use o formulário ao lado para adicionar os primeiros destaques."
              />
            ) : (
              <ul className="space-y-4">
                {banners.map((banner) => (
                  <li
                    key={banner.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-white sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <div className="relative h-20 w-32 overflow-hidden rounded-xl border border-white/15 bg-black/50">
                        {banner.tipo === "image" && banner.url ? (
                          <Image src={banner.url} alt={banner.titulo} fill className="object-cover" />
                        ) : banner.url ? (
                          <video src={banner.url} className="h-full w-full object-cover" muted />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/50">
                            {banner.tipo === "image" ? <ImageIcon className="h-6 w-6" /> : <VideoIcon className="h-6 w-6" />}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold">{banner.titulo}</p>
                        {banner.link && (
                          <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 underline">
                            {banner.link}
                          </a>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs text-white/60">
                          <Badge variant="outline">#{banner.ordem}</Badge>
                          <Badge variant="outline">{banner.tipo === "image" ? "Imagem" : "Vídeo"}</Badge>
                          <Badge variant={banner.ativo ? "default" : "outline"}>{banner.ativo ? "ativo" : "inativo"}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleToggle(banner.id, !banner.ativo)}>
                        {banner.ativo ? "Desativar" : "Ativar"}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-200">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir banner?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação remove definitivamente “{banner.titulo}”.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(banner.id)} className="bg-red-600 hover:bg-red-500">
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function isMissingTableError(error: any, table: string) {
  const code = error?.code;
  const message = error?.message?.toLowerCase?.() || "";
  return code === "42P01" || (message.includes("does not exist") && message.includes(table.toLowerCase()));
}
