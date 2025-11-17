import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Media, Model } from "@/types";
import type { UploadsByDay } from "@/hooks/use-dashboard-metrics";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock4, Video, Camera } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type StatCardProps = {
  icon: React.ElementType;
  title: string;
  value: number;
  caption?: string;
};

export function StatCard({ icon: Icon, title, value, caption }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden border-white/10 bg-[color:var(--surface-card)]/80 text-white shadow-soft">
      <div className="pointer-events-none absolute inset-0 bg-[var(--gradient-card)] opacity-60" />
      <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <p className="text-sm text-white/70">{title}</p>
          <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
          {caption && <p className="text-xs text-white/50">{caption}</p>}
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </CardHeader>
    </Card>
  );
}

type QuickActionCardProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
};

export function QuickActionCard({ icon: Icon, title, description, href }: QuickActionCardProps) {
  return (
    <Card className="border-white/10 bg-[color:var(--surface-card)]/70 shadow-soft transition hover:-translate-y-0.5 hover:bg-[color:var(--surface-card)]/90">
      <Link href={href} className="flex h-full flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-sm text-white/60">{description}</p>
          </div>
          <div className="rounded-full bg-white/10 p-2 text-white">
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
      </Link>
    </Card>
  );
}

type ActivityListCardProps<T> = {
  title: string;
  items: T[];
  emptyMessage: string;
  renderItem: (item: T) => React.ReactNode;
};

export function ActivityListCard<T>({ title, items, emptyMessage, renderItem }: ActivityListCardProps<T>) {
  return (
    <Card className="border-white/10 bg-[color:var(--surface-card)]/70 shadow-soft">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length > 0 ? items.map(renderItem) : <p className="text-sm text-white/60">{emptyMessage}</p>}
      </CardContent>
    </Card>
  );
}

export function ModelRow({ model }: { model: Model }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10">
        <Image
          src={model.avatar_url || "/placeholder-avatar.png"}
          alt={model.nome}
          fill
          sizes="48px"
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex-1">
        <p className="font-medium">{model.nome}</p>
        <p className="text-sm text-white/60">ID #{model.id}</p>
      </div>
      <Button variant="outline" size="sm" asChild className="border-white/20 text-white hover:bg-white/10">
        <Link href={`/admin/models/${model.id}`}>Ver</Link>
      </Button>
    </div>
  );
}

export function MediaRow({ media }: { media: Media & { models?: { nome: string } } }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-white/10">
        {media.tipo === "photo" ? (
          <Image
            src={media.url}
            alt={media.descricao || "Mídia"}
            fill
            sizes="48px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/30">
            <Video className="h-5 w-5 text-white/70" />
          </div>
        )}
      </div>
      <div className="flex-1 truncate">
        <p className="font-medium leading-none text-white">{media.descricao || "Mídia sem descrição"}</p>
        <p className="text-sm text-white/60">{media.models?.nome}</p>
      </div>
      <Button variant="outline" size="sm" asChild className="border-white/20 text-white hover:bg-white/10">
        <Link href={`/admin/models/${media.modelo_id}/media`}>Ver</Link>
      </Button>
    </div>
  );
}

type ChartCardProps = {
  data: UploadsByDay[];
  trend: number;
};

export function ChartCard({ data, trend }: ChartCardProps) {
  return (
    <Card className="border-white/10 bg-[color:var(--surface-card)]/80 shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Uploads nos Últimos 7 Dias</CardTitle>
          <p className="text-sm text-white/60">
            {trend === 0 ? "Estável nos últimos dias" : `${trend > 0 ? "+" : ""}${trend}% vs período anterior`}
          </p>
        </div>
      </CardHeader>
      <CardContent className="h-64">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-white/60">
            Sem uploads registrados nesta semana.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="date" stroke="#cbd5f5" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#cbd5f5" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  color: "#fff",
                }}
              />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--purple-500)" />
                  <stop offset="100%" stopColor="var(--magenta)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

type ScheduledMediaCardProps = {
  items: (Media & { models?: { nome: string }; publicar_em?: string | null })[];
};

export function ScheduledMediaCard({ items }: ScheduledMediaCardProps) {
  return (
    <Card className="border-white/10 bg-[color:var(--surface-card)]/80 shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Mídias Agendadas</CardTitle>
          <p className="text-sm text-white/60">Próximas publicações confirmadas</p>
        </div>
        <Clock4 className="h-5 w-5 text-white/60" />
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-white/60">Nenhuma mídia agendada.</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{item.descricao || "Sem descrição"}</p>
                  <p className="text-sm text-white/60">{item.models?.nome || "Modelo não vinculado"}</p>
                </div>
                <Badge className="bg-amber-400/20 text-amber-300">
                  {item.tipo === "photo" ? <Camera className="mr-1 h-3.5 w-3.5" /> : <Video className="mr-1 h-3.5 w-3.5" />}
                  {item.tipo === "photo" ? "Foto" : "Vídeo"}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-white/70">
                {item.publicar_em
                  ? format(new Date(item.publicar_em), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
                  : "Sem data definida"}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32 rounded-2xl bg-white/5" />
        <Skeleton className="h-32 rounded-2xl bg-white/5" />
        <Skeleton className="h-32 rounded-2xl bg-white/5" />
        <Skeleton className="h-32 rounded-2xl bg-white/5" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl bg-white/5" />
        <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl bg-white/5" />
          <Skeleton className="h-80 rounded-2xl bg-white/5" />
        </div>
      </div>
    </>
  );
}

