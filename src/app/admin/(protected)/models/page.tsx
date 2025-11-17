"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { getColumns } from "./columns";
import { Model } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function AdminModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [qualityFilter, setQualityFilter] = useState<"all" | "missingAvatar" | "missingBio">("all");

  useEffect(() => {
    fetchModels();
  }, []);

  async function fetchModels() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let { data, error } = await supabase
        .from("models")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        setError("Erro ao buscar modelos");
        setModels([]);
      } else {
        setModels(data || []);
      }
    } catch (e) {
      setError("Erro inesperado ao carregar modelos");
      setModels([]);
    } finally {
      setLoading(false);
    }
  }

  const handleModelDeleted = () => {
    fetchModels();
  };

  const columns = getColumns(handleModelDeleted);

  const stats = useMemo(() => {
    const total = models.length;
    const withAvatar = models.filter(model => !!model.avatar_url).length;
    const withBio = models.filter(model => !!model.bio && model.bio.trim().length >= 20).length;
    return {
      total,
      withAvatar,
      withBio,
      missingAvatar: total - withAvatar,
      missingBio: total - withBio,
    };
  }, [models]);

  const filteredData = models
    .filter(model =>
      model.nome.toLowerCase().includes(filter.toLowerCase()) ||
      (model.bio && model.bio.toLowerCase().includes(filter.toLowerCase()))
    )
    .filter(model => {
      if (qualityFilter === "missingAvatar") return !model.avatar_url;
      if (qualityFilter === "missingBio") return !model.bio || model.bio.trim().length < 20;
      return true;
    });

  if (!loading && !error && models.length === 0) {
    return (
        <EmptyState
            icon={Users}
            title="Nenhum modelo encontrado"
            description="Parece que você ainda não adicionou nenhum modelo. Comece adicionando o primeiro para vê-lo aparecer aqui."
            actionHref="/admin/models/new"
            actionLabel="Adicionar Modelo"
        />
    )
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciar Modelos</h2>
          <p className="text-muted-foreground">
            Acompanhe a qualidade dos perfis e acione ações rápidas.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/models/new">Adicionar Modelo</Link>
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Modelos ativos" value={stats.total} helper={`${filteredData.length} visíveis no filtro atual`} />
        <StatCard label="Com avatar" value={stats.withAvatar} helper={`${stats.missingAvatar} pendentes`} />
        <StatCard label="Bio completa" value={stats.withBio} helper={`${stats.missingBio} precisam de texto`} />
      </section>

      <Card className="border-white/10 bg-[color:var(--surface-card)]/70 shadow-soft">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Filtrar por nome ou bio..."
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="max-w-sm bg-black/20"
          />
          <div className="flex flex-wrap gap-2">
            <FilterChip label="Todos" active={qualityFilter === "all"} onClick={() => setQualityFilter("all")} />
            <FilterChip
              label="Sem avatar"
              active={qualityFilter === "missingAvatar"}
              badge={stats.missingAvatar}
              onClick={() => setQualityFilter("missingAvatar")}
            />
            <FilterChip
              label="Bio curta"
              active={qualityFilter === "missingBio"}
              badge={stats.missingBio}
              onClick={() => setQualityFilter("missingBio")}
            />
          </div>
        </CardContent>
      </Card>

      {loading && <div className="text-center py-4">Carregando dados...</div>}
      {error && <div className="text-red-500 text-center py-4">{error}</div>}
      
      {!loading && !error && models.length > 0 && (
        <DataTable columns={columns} data={filteredData} />
      )}
    </div>
  );
}

function StatCard({ label, value, helper }: { label: string; value: number; helper?: string }) {
  return (
    <Card className="border-white/10 bg-[color:var(--surface-card)]/70 shadow-soft">
      <CardContent className="p-4">
        <p className="text-sm text-white/70">{label}</p>
        <p className="text-3xl font-semibold text-white">{value}</p>
        {helper && <p className="text-xs text-white/60">{helper}</p>}
      </CardContent>
    </Card>
  );
}

function FilterChip({
  label,
  active,
  badge,
  onClick,
}: {
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
        active ? "border-white text-white bg-white/10" : "border-white/20 text-white/70 hover:text-white hover:border-white/40"
      }`}
    >
      <span>{label}</span>
      {typeof badge === "number" && (
        <Badge variant="outline" className="border-white/30 text-white/80">
          {badge}
        </Badge>
      )}
    </button>
  );
}
