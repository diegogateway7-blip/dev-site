"use client";

import type { ElementType } from "react";
import {
  Users,
  ImageIcon,
  PlusCircle,
  BookOpen,
  TrendingUp,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import {
  ActivityListCard,
  ChartCard,
  DashboardSkeleton,
  MediaRow,
  ModelRow,
  QuickActionCard,
  ScheduledMediaCard,
  StatCard,
} from "@/components/admin/dashboard/cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Insight = {
  title: string;
  description: string;
  variant: "positive" | "alert" | "neutral";
  icon: ElementType;
};

export default function AdminDashboardPage() {
  const {
    modelsCount,
    mediaCount,
    recentModels,
    recentMedia,
    uploadsData,
    uploadsTrend,
    scheduledMedia,
    loading,
    error,
  } = useDashboardMetrics();

  const totalUploads = uploadsData.reduce((acc, day) => acc + day.count, 0);
  const averageUploads = uploadsData.length ? (totalUploads / uploadsData.length).toFixed(1) : "0";
  const backlog = scheduledMedia.length;
  const needsContent = backlog < 3;

  const insights: Insight[] = [
    {
      title: "Fluxo de uploads",
      description: `${totalUploads} envios nos últimos 7 dias (${averageUploads}/dia).`,
      variant: "positive",
      icon: TrendingUp,
    },
    {
      title: "Agenda",
      description:
        backlog === 0
          ? "Nenhuma mídia agendada. Programe novas peças para manter a cadência."
          : `${backlog} mídias prontas para publicação.`,
      variant: needsContent ? "alert" : "neutral",
      icon: needsContent ? AlertTriangle : Sparkles,
    },
    {
      title: "Base de modelos",
      description:
        modelsCount === 0
          ? "Cadastre seu primeiro modelo para as campanhas."
          : `${modelsCount} modelos ativos cadastrados.`,
      variant: "neutral",
      icon: Users,
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Monitore performance, próximos lançamentos e ative ações rápidas.</p>
      </div>

      {error && <div className="mb-6 rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} title="Total de Modelos" value={modelsCount} caption="Base ativa" />
            <StatCard icon={ImageIcon} title="Total de Mídias" value={mediaCount} caption="Portfolio publicado" />
            <QuickActionCard icon={PlusCircle} title="Adicionar Modelo" description="Cadastre um novo perfil" href="/admin/models/new" />
            <QuickActionCard icon={BookOpen} title="Ver Tutorial" description="Guia completo da operação" href="/admin/tutorial" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <ChartCard data={uploadsData} trend={uploadsTrend} />
            <div className="grid gap-6 lg:col-span-2 md:grid-cols-2">
              <ActivityListCard
                title="Últimos Modelos"
                items={recentModels}
                emptyMessage="Nenhuma modelo cadastrada recentemente."
                renderItem={model => <ModelRow key={model.id} model={model} />}
              />
              <ActivityListCard
                title="Últimas Mídias"
                items={recentMedia}
                emptyMessage="Nenhum upload recente."
                renderItem={media => <MediaRow key={media.id} media={media} />}
              />
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ScheduledMediaCard items={scheduledMedia} />
            <InsightsCard insights={insights} />
          </div>
        </>
      )}
    </div>
  );
}

function InsightsCard({ insights }: { insights: Insight[] }) {
  return (
    <Card className="border-white/10 bg-[color:var(--surface-card)]/80 shadow-soft">
      <CardHeader>
        <CardTitle>Insights e próximos passos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="rounded-full bg-white/10 p-2">
              <insight.icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <p className="font-medium text-white">{insight.title}</p>
                <Badge
                  variant="secondary"
                  className={
                    insight.variant === "alert"
                      ? "bg-red-400/20 text-red-200"
                      : insight.variant === "positive"
                        ? "bg-emerald-400/20 text-emerald-200"
                        : "bg-white/10 text-white"
                  }
                >
                  {insight.variant === "alert" ? "Atenção" : insight.variant === "positive" ? "OK" : "Info"}
                </Badge>
              </div>
              <p className="text-sm text-white/70">{insight.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
