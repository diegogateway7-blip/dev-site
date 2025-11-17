"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { getColumns } from "./columns";
import { Model } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

export default function AdminModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

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

  const filteredData = models.filter(model =>
    model.nome.toLowerCase().includes(filter.toLowerCase()) ||
    (model.bio && model.bio.toLowerCase().includes(filter.toLowerCase()))
  );

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
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciar Modelos</h2>
          <p className="text-muted-foreground">
            Adicione, edite e gerencie os modelos da plataforma.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/models/new">Adicionar Modelo</Link>
        </Button>
      </div>
      
      <div className="mb-4">
        <Input
          placeholder="Filtrar por nome ou bio..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading && <div className="text-center py-4">Carregando dados...</div>}
      {error && <div className="text-red-500 text-center py-4">{error}</div>}
      
      {!loading && !error && models.length > 0 && (
        <DataTable columns={columns} data={filteredData} />
      )}
    </div>
  );
}

