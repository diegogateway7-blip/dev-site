"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/utils";

type ExternalProfile = {
  coverImage?: {
    url: string;
    alt?: string;
    hint?: string;
    width?: number;
    height?: number;
  };
  profileAvatar?: {
    url: string;
    alt?: string;
    hint?: string;
  };
};

type ExternalMediaItem = {
  id?: number;
  url: string;
  type: "photo" | "video";
  hint?: string;
};

type ExternalPayload = {
  profile?: ExternalProfile;
  mediaItems: ExternalMediaItem[];
};

type ModelOption = { id: number; nome: string };

export default function MediaImportPage() {
  const supabase = createClient();
  const { toast } = useToast();

  const [rawJson, setRawJson] = useState("");
  const [parsedData, setParsedData] = useState<ExternalPayload | null>(null);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [newModelName, setNewModelName] = useState("");
  const [newModelBio, setNewModelBio] = useState("");
  const [newModelRedes, setNewModelRedes] = useState("");
  const [processingJson, setProcessingJson] = useState(false);
  const [creatingModel, setCreatingModel] = useState(false);
  const [importing, setImporting] = useState(false);
  const [supportsScheduling, setSupportsScheduling] = useState(true);

  useEffect(() => {
    loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!parsedData) return;
    const suggestedName =
      parsedData.profile?.profileAvatar?.alt?.replace(/^Cover image for\s+/i, "") ||
      parsedData.profile?.profileAvatar?.alt ||
      "";
    if (suggestedName && !newModelName) {
      setNewModelName(suggestedName);
    }
    if (!newModelBio) {
      const hint = parsedData.profile?.profileAvatar?.hint || parsedData.profile?.coverImage?.hint;
      setNewModelBio(
        hint
          ? `Modelo importada automaticamente (${hint}). Atualize esta bio para algo mais pessoal.`
          : ""
      );
    }
  }, [parsedData, newModelName, newModelBio]);

  const stats = useMemo(() => {
    if (!parsedData) return { total: 0, photos: 0, videos: 0 };
    return parsedData.mediaItems.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.type === "video") acc.videos += 1;
        else acc.photos += 1;
        return acc;
      },
      { total: 0, photos: 0, videos: 0 }
    );
  }, [parsedData]);

  async function loadModels() {
    setModelsLoading(true);
    try {
      const { data, error } = await supabase.from("models").select("id, nome").order("nome", { ascending: true });
      if (error) throw error;
      setModels(data || []);
    } catch (e: any) {
      toast({ title: "Não foi possível carregar os modelos", description: e?.message || "", variant: "destructive" });
    } finally {
      setModelsLoading(false);
    }
  }

  function handleProcessJson() {
    setProcessingJson(true);
    try {
      const parsed = JSON.parse(rawJson) as ExternalPayload;
      if (!parsed || !Array.isArray(parsed.mediaItems) || parsed.mediaItems.length === 0) {
        throw new Error("Estrutura inválida: mediaItems ausente ou vazio.");
      }
      setParsedData(parsed);
      toast({ title: "JSON processado com sucesso!", description: `${parsed.mediaItems.length} itens detectados.` });
    } catch (e: any) {
      toast({ title: "Erro ao processar JSON", description: e?.message || "", variant: "destructive" });
      setParsedData(null);
    } finally {
      setProcessingJson(false);
    }
  }

  async function handleCreateModel() {
    if (!newModelName || !newModelBio) {
      toast({ title: "Preencha nome e bio para criar o modelo.", variant: "destructive" });
      return;
    }
    setCreatingModel(true);
    try {
      const payload = {
        nome: newModelName,
        bio: newModelBio,
        redes: newModelRedes || null,
        avatar_url: parsedData?.profile?.profileAvatar?.url || null,
        banner_url: parsedData?.profile?.coverImage?.url || null,
        slug: slugify(newModelName),
      };
      const { data, error } = await supabase.from("models").insert([payload]).select("id").single();
      if (error) throw error;
      toast({ title: "Modelo criado!", description: "Associado automaticamente ao importador." });
      setSelectedModelId(String(data.id));
      await loadModels();
    } catch (e: any) {
      toast({ title: "Erro ao criar modelo", description: e?.message || "", variant: "destructive" });
    } finally {
      setCreatingModel(false);
    }
  }

  function buildPayload(modelId: string, includeScheduling = supportsScheduling) {
    return parsedData!.mediaItems.map(item => {
      const base = {
        modelo_id: Number(modelId),
        url: item.url,
        tipo: item.type === "video" ? "video" : "photo",
        descricao: item.hint?.trim() ? item.hint : null,
      } as any;
      if (includeScheduling) {
        base.publicar_em = new Date().toISOString();
      }
      return base;
    });
  }

  async function handleImportMedia() {
    if (!parsedData) {
      toast({ title: "Processe o JSON primeiro.", variant: "destructive" });
      return;
    }
    if (!selectedModelId) {
      toast({ title: "Selecione ou crie um modelo antes de importar.", variant: "destructive" });
      return;
    }

    const payload = buildPayload(selectedModelId, supportsScheduling);
    setImporting(true);
    try {
      const { error } = await supabase.from("media").insert(payload);
      if (error) {
        if (supportsScheduling && isMissingColumnError(error, "publicar_em")) {
          setSupportsScheduling(false);
          const retryPayload = buildPayload(selectedModelId, false);
          const retry = await supabase.from("media").insert(retryPayload);
          if (retry.error) throw retry.error;
        } else {
          throw error;
        }
      }
      toast({ title: "Mídias importadas com sucesso!", description: `${payload.length} registros criados.` });
      setParsedData(null);
      setRawJson("");
    } catch (e: any) {
      toast({ title: "Erro ao importar mídias", description: e?.message || "", variant: "destructive" });
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Importador em Massa de Mídias</h2>
        <p className="text-muted-foreground">
          Cole um JSON com URLs externas e importe tudo direto para a tabela <code>media</code> já vinculando a um modelo.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-[color:var(--surface-card)]/80 shadow-soft">
          <CardHeader>
            <CardTitle>1. Cole o JSON</CardTitle>
            <CardDescription>Use exatamente o formato enviado (profile + mediaItems).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={rawJson}
              onChange={e => setRawJson(e.target.value)}
              placeholder="Cole aqui o JSON com profile e mediaItems..."
              rows={16}
              className="bg-black/20"
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleProcessJson} disabled={!rawJson || processingJson}>
                {processingJson ? "Processando..." : "Processar JSON"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-white/80"
                onClick={() => {
                  setRawJson("");
                  setParsedData(null);
                }}
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[color:var(--surface-card)]/60 shadow-soft">
          <CardHeader>
            <CardTitle>2. Resumo e Profile</CardTitle>
            <CardDescription>Visualize as informações detectadas antes de importar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedData ? (
              <>
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  {parsedData.profile?.profileAvatar?.url ? (
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/20">
                      <Image
                        src={parsedData.profile.profileAvatar.url}
                        alt={parsedData.profile.profileAvatar.alt || "Avatar importado"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-full border border-dashed border-white/20" />
                  )}
                  <div className="flex-1">
                    <p className="text-lg font-semibold">{parsedData.profile?.profileAvatar?.alt || "Sem nome definido"}</p>
                    <p className="text-sm text-white/60">{parsedData.profile?.profileAvatar?.hint || "Sem descrição"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <SummaryStat label="Total" value={stats.total} />
                  <SummaryStat label="Fotos" value={stats.photos} />
                  <SummaryStat label="Vídeos" value={stats.videos} />
                </div>
                {parsedData.profile?.coverImage?.url && (
                  <div className="rounded-2xl border border-white/10 p-3">
                    <p className="mb-2 text-sm text-white/70">Cover Image</p>
                    <div className="relative h-32 w-full overflow-hidden rounded-xl">
                      <Image
                        src={parsedData.profile.coverImage.url}
                        alt={parsedData.profile.coverImage.alt || "Cover importado"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-white/60">Cole o JSON para ver o preview dos dados.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-[color:var(--surface-card)]/70 shadow-soft">
          <CardHeader>
            <CardTitle>3. Escolha o modelo destino</CardTitle>
            <CardDescription>Selecione um modelo existente para receber todos os registros importados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedModelId || undefined} onValueChange={setSelectedModelId} disabled={modelsLoading || models.length === 0}>
              <SelectTrigger className="bg-black/20">
                <SelectValue placeholder={modelsLoading ? "Carregando modelos..." : "Selecione um modelo"} />
              </SelectTrigger>
              <SelectContent>
                {models.map(model => (
                  <SelectItem key={model.id} value={String(model.id)}>
                    #{model.id} · {model.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!modelsLoading && models.length === 0 && (
              <p className="text-sm text-amber-200">Nenhum modelo cadastrado. Crie um usando o formulário ao lado.</p>
            )}
            {selectedModelId && (
              <Badge variant="outline" className="border-emerald-400/50 text-emerald-200">
                Modelo selecionado: #{selectedModelId}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[color:var(--surface-card)]/70 shadow-soft">
          <CardHeader>
            <CardTitle>4. Criar novo modelo (opcional)</CardTitle>
            <CardDescription>Usa automaticamente os dados do profile para avatar/capa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Nome do modelo" value={newModelName} onChange={e => setNewModelName(e.target.value)} />
            <Textarea
              placeholder="Bio do modelo"
              value={newModelBio}
              onChange={e => setNewModelBio(e.target.value)}
              rows={4}
            />
            <Input
              placeholder="@instagram / links"
              value={newModelRedes}
              onChange={e => setNewModelRedes(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={handleCreateModel} disabled={creatingModel || !parsedData}>
              {creatingModel ? "Criando..." : "Criar modelo com dados importados"}
            </Button>
            {!parsedData && <p className="text-sm text-white/60">Proces se o JSON para habilitar esta etapa.</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-emerald-500/40 bg-emerald-500/5 shadow-soft">
        <CardHeader>
          <CardTitle>5. Importar tudo</CardTitle>
          <CardDescription>Confirmando, todos os registros serão gravados na tabela <code>media</code>.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button
            size="lg"
            variant="cta"
            disabled={!parsedData || !selectedModelId || importing}
            onClick={handleImportMedia}
          >
            {importing ? "Importando..." : `Importar ${stats.total || ""} mídias`}
          </Button>
          <p className="text-sm text-white/70">
            Certifique-se de que as URLs permaneçam acessíveis publicamente. Este processo não faz download para o
            storage, apenas cadastra as referências no banco.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
      <p className="text-sm text-white/70">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function isMissingColumnError(error: any, column: string) {
  if (!error) return false;
  const code = error?.code;
  if (code && String(code) === "42703") return true;
  const message = error?.message?.toLowerCase?.() || "";
  return message.includes("does not exist") && message.includes(column.toLowerCase());
}

