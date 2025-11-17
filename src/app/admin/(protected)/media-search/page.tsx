"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Media } from "@/types"; // Usando o tipo centralizado

// Imports de UI
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Trash2, Video, Camera } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function MediaLibraryPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState({ description: "", type: "", modelId: "" });
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Carrega as mídias mais recentes ao iniciar a página
    fetchMedia();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchMedia(searchFilters = filters) {
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

  const handleFilterChange = (key: 'description' | 'modelId' | 'type', value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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
      
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 border border-dashed rounded-lg">
          <Input placeholder="Buscar por descrição..." value={filters.description} onChange={e => handleFilterChange('description', e.target.value)} />
          <Select value={filters.type} onValueChange={value => handleFilterChange('type', value)}>
              <SelectTrigger><SelectValue placeholder="Filtrar por tipo" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="">Todos os Tipos</SelectItem>
                  <SelectItem value="photo">Foto</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
              </SelectContent>
          </Select>
          <Input placeholder="ID do Modelo (opcional)" value={filters.modelId} onChange={e => handleFilterChange('modelId', e.target.value)} />
          <Button type="submit" disabled={loading} className="w-full"><Search className="mr-2 h-4 w-4" />{loading ? 'Buscando...' : 'Buscar'}</Button>
      </form>

      {error && <div className="text-red-500 bg-red-500/10 p-4 rounded-md mb-6">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      ) : mediaItems.length === 0 ? (
        <EmptyState icon={ImageIcon} title="Nenhuma mídia encontrada" description="Nenhuma mídia corresponde aos filtros aplicados ou nenhuma foi enviada ainda." actionHref="/admin/models" actionLabel="Gerenciar Modelos"/>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaItems.map(item => <MediaCard key={item.id} item={item} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}

// Componente para o Card de Mídia
function MediaCard({ item, onDelete }: { item: Media; onDelete: (item: Media) => void }) {
  return (
    <Card className="overflow-hidden group">
      <CardHeader className="p-0 relative">
        <div className="aspect-square w-full relative">
            {item.tipo === 'photo' ? (
                <Image src={item.url} alt={item.descricao || 'Mídia'} fill className="object-cover" />
            ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <Video className="w-10 h-10 text-muted-foreground" />
                </div>
            )}
            <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white">
                {item.tipo === 'photo' ? <Camera className="h-3 w-3"/> : <Video className="h-3 w-3"/>}
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 text-xs">
          <p className="font-semibold truncate">{item.descricao || "Sem descrição"}</p>
          <p className="text-muted-foreground">{item.models?.nome || "Modelo não vinculado"}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0">
          <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="mr-2 h-3.5 w-3.5"/> Excluir
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

