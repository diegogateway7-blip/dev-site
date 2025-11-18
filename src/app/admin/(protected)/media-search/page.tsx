"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Media, Model } from "@/types"; // Usando o tipo centralizado

// Imports de UI
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter as DialogFooterBase, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Trash2, Video, Camera, ImageIcon, Copy, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

type FilterState = {
  description: string;
  type: 'photo' | 'video' | null;
  modelId: string | null;
};

export default function MediaLibraryPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterState>({ description: "", type: null, modelId: null });
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    // Carrega as mídias mais recentes ao iniciar a página
    fetchMedia();
    loadModels();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchMedia(searchFilters: FilterState = filters) {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = supabase.from("media").select("*, models(nome)");
      if (searchFilters.description) query = query.ilike("descricao", `%${searchFilters.description}%`);
      if (searchFilters.type) query = query.eq("tipo", searchFilters.type);
      if (searchFilters.modelId) query = query.eq("modelo_id", searchFilters.modelId);
      
      const { data, error } = await query.order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      setMediaItems(data as Media[]);
    } catch (e: any) {
      setError(e?.message || "Erro ao buscar mídias!");
      setMediaItems([]);
    } finally {
      setLoading(false);
    }
  }
  
  async function loadModels() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("models").select("id, nome").order("nome", { ascending: true });
      if (error) throw error;
      setModels(data || []);
    } catch (e: any) {
      toast({ title: "Não foi possível carregar modelos", description: e?.message, variant: "destructive" });
    }
  }

  const handleDelete = async (mediaItem: Media) => {
    try {
        const supabase = createClient();
        if (mediaItem.url) {
            const path = new URL(mediaItem.url).pathname.split('/media/').pop();
            if (path) {
                await supabase.storage.from("media").remove([path]);
            }
        }
        const { error } = await supabase.from("media").delete().eq("id", mediaItem.id);
        if (error) throw error;
        
        setMediaItems(prev => prev.filter(m => m.id !== mediaItem.id));
        toast({ title: "Mídia removida com sucesso!" });
    } catch (e: any) {
        toast({ title: "Erro ao remover mídia", description: e.message, variant: "destructive" });
    }
  };

  function handleFilterChange<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Biblioteca de Mídia</h2>
          <p className="text-muted-foreground">Gerencie todas as fotos e vídeos da plataforma.</p>
        </div>
      </div>
      
      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 gap-4 mb-8 rounded-2xl border border-white/10 bg-[color:var(--surface-card)]/70 p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-5"
      >
        <Input
          placeholder="Buscar por descrição..."
          value={filters.description}
          onChange={e => handleFilterChange('description', e.target.value)}
          className="bg-black/20"
        />
        <Select
          value={filters.type ?? undefined}
          onValueChange={value => handleFilterChange('type', value === 'all' ? null : (value as 'photo' | 'video'))}
        >
          <SelectTrigger className="bg-black/20">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="photo">Foto</SelectItem>
            <SelectItem value="video">Vídeo</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.modelId ?? undefined}
          onValueChange={value => handleFilterChange('modelId', value === 'all' ? null : value)}
        >
          <SelectTrigger className="bg-black/20">
            <SelectValue placeholder="Filtrar por modelo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os modelos</SelectItem>
            {models.map(model => (
              <SelectItem key={model.id} value={String(model.id)}>
                {model.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="sm:col-span-2 lg:col-span-1 flex gap-2">
          <Button type="submit" disabled={loading} className="w-full">
            <Search className="mr-2 h-4 w-4" />
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full border-white/20 text-white/80"
            onClick={() => {
              const resetFilters: FilterState = { description: "", type: null, modelId: null };
              setFilters(resetFilters);
              fetchMedia(resetFilters);
            }}
          >
            Limpar
          </Button>
        </div>
      </form>

      {error && <div className="text-red-500 bg-red-500/10 p-4 rounded-md mb-6">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      ) : mediaItems.length === 0 ? (
        <EmptyState icon={ImageIcon} title="Nenhuma mídia encontrada" description="Nenhuma mídia corresponde aos filtros aplicados ou nenhuma foi enviada ainda." actionHref="/admin/models" actionLabel="Gerenciar Modelos"/>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {mediaItems.map(item => <MediaCard key={item.id} item={item} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}

// Componente para o Card de Mídia
function MediaCard({ item, onDelete }: { item: Media; onDelete: (item: Media) => void }) {
  const [hasImageError, setHasImageError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(item.url);
      toast({ title: "URL copiada!", description: "Cole onde precisar publicar." });
    } catch (e: any) {
      toast({ title: "Não foi possível copiar", description: e?.message || "", variant: "destructive" });
    }
  }

  return (
    <Card className="group overflow-hidden border-white/10 bg-[color:var(--surface-card)]/80 shadow-soft">
      <CardHeader className="relative p-0">
        <div className="relative aspect-square w-full overflow-hidden">
          {item.tipo === 'photo' && !hasImageError ? (
            <Image
              src={item.url}
              alt={item.descricao || 'Mídia'}
              fill
              sizes="(max-width: 768px) 50vw, 240px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
              onError={() => setHasImageError(true)}
            />
          ) : item.tipo === 'video' ? (
            <div className="flex h-full w-full items-center justify-center bg-black/40">
              <Video className="h-10 w-10 text-white/70" />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black/30">
              <ImageIcon className="h-8 w-8 text-white/60" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur">
              {item.tipo === 'photo' ? 'Foto' : 'Vídeo'}
            </Badge>
          </div>
          <div className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white">
            {item.tipo === 'photo' ? <Camera className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 text-xs">
        <p className="font-semibold truncate text-sm">{item.descricao || "Sem descrição"}</p>
        <p className="text-muted-foreground">{item.models?.nome || "Modelo não vinculado"}</p>
        <p className="text-[11px] text-white/50">
          {item.created_at
            ? formatDistanceToNow(new Date(item.created_at), { locale: ptBR, addSuffix: true })
            : "Sem data"}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2 p-3 pt-0">
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm" className="w-full border border-white/10 bg-white/10 text-white hover:bg-white/20">
              Preview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl border-white/10 bg-[color:var(--surface-card)]/95 text-white">
            <DialogHeader>
              <DialogTitle>Preview da mídia #{item.id}</DialogTitle>
              <DialogDescription className="text-white/70">
                {item.descricao || "Sem descrição"} · {item.models?.nome || "Modelo não vinculado"}
              </DialogDescription>
            </DialogHeader>
            <div className="relative w-full overflow-hidden rounded-2xl border border-white/10">
              {item.tipo === "photo" && !hasImageError ? (
                <Image
                  src={item.url}
                  alt={item.descricao || "Preview"}
                  width={1200}
                  height={1200}
                  className="h-full w-full object-contain bg-black/30"
                  unoptimized
                  onError={() => setHasImageError(true)}
                />
              ) : item.tipo === "video" ? (
                <video src={item.url} controls className="w-full rounded-2xl bg-black/50" />
              ) : (
                <div className="flex h-64 items-center justify-center bg-black/30">
                  <ImageIcon className="h-10 w-10 text-white/60" />
                </div>
              )}
            </div>
            <DialogFooterBase className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-sm text-white/70">
                <p>URL: <span className="break-all text-white">{item.url}</span></p>
                <p>ID interno: {item.id}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={handleCopy} className="border-white/30 text-white">
                  <Copy className="mr-2 h-4 w-4" /> Copiar URL
                </Button>
                <Button type="button" variant="ghost" className="border border-white/20 text-white hover:bg-white/10" asChild>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Abrir original
                  </a>
                </Button>
              </div>
            </DialogFooterBase>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full opacity-0 transition-opacity group-hover:opacity-100">
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>Deseja realmente deletar esta mídia? Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(item)}>Sim, excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

