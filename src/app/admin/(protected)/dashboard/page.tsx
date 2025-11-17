"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  ImageIcon,
  PlusCircle,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type Model = { id: number; nome: string; avatar_url: string | null };
type Media = { id: number; url: string; tipo: 'photo' | 'video'; descricao: string; modelo_id: number; models?: { nome: string } };
type UploadsByDay = { date: string; count: number };


export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [modelsCount, setModelsCount] = useState<number>(0);
  const [mediaCount, setMediaCount] = useState<number>(0);
  const [recentModels, setRecentModels] = useState<Model[]>([]);
  const [recentMedia, setRecentMedia] = useState<Media[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadsData, setUploadsData] = useState<UploadsByDay[]>([]);

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      try {
        const modelsPromise = supabase.from("models").select("*", { count: "exact" }).order("id", { ascending: false }).limit(5);
        const mediaPromise = supabase.from("media").select("*, models(nome)", { count: "exact" }).order("created_at", { ascending: false }).limit(5);
        
        const [
          { data: modelsData, count: modelsCountData, error: modelsError },
          { data: mediaData, count: mediaCountData, error: mediaError }
        ] = await Promise.all([modelsPromise, mediaPromise]);

        if (modelsError) throw modelsError;
        if (mediaError) throw mediaError;

        setModelsCount(modelsCountData ?? 0);
        setMediaCount(mediaCountData ?? 0);
        setRecentModels(modelsData || []);
        setRecentMedia(mediaData || []);

        // Nova consulta para o gráfico
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: chartData, error: chartError } = await supabase
            .from('media')
            .select('created_at')
            .gte('created_at', sevenDaysAgo);
        
        if (chartError) throw chartError;

        // Processa os dados para o gráfico
        const uploadsByDay = chartData.reduce((acc, item) => {
            const date = new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const formattedChartData = Object.entries(uploadsByDay).map(([date, count]) => ({ date, count }));
        setUploadsData(formattedChartData);

      } catch (e: any) {
        setError("Erro ao buscar dados do dashboard: " + (e?.message || ""));
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h2>
      {error && <div className="text-red-500 bg-red-500/10 p-4 rounded-md mb-6">{error}</div>}
      
      {loading ? <DashboardSkeleton /> : (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Users} title="Total de Modelos" value={modelsCount} />
                <StatCard icon={ImageIcon} title="Total de Mídias" value={mediaCount} />
                <QuickActionCard icon={PlusCircle} title="Adicionar Modelo" href="/admin/models/new" />
                <QuickActionCard icon={BookOpen} title="Ver Tutorial" href="/admin/tutorial" />
            </div>

            <div className="grid gap-6 mt-8 grid-cols-1 lg:grid-cols-3">
                <ChartCard data={uploadsData} />
                <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
                    <RecentActivityCard title="Últimos Modelos" items={recentModels} renderItem={(item: Model) => <ModelItem item={item} />} />
                    <RecentActivityCard title="Últimas Mídias" items={recentMedia} renderItem={(item: Media) => <MediaItem item={item} />} />
                </div>
            </div>
        </>
      )}
    </div>
  );
}

// Subcomponentes para organização
const StatCard = ({ icon: Icon, title, value }: { icon: React.ElementType, title: string, value: number }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const QuickActionCard = ({ icon: Icon, title, href }: { icon: React.ElementType, title: string, href: string }) => (
    <Card className="hover:bg-muted/50 transition-colors">
        <Link href={href} className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">Acessar</div>
            </CardContent>
        </Link>
    </Card>
);

const RecentActivityCard = ({ title, items, renderItem }: { title: string, items: any[], renderItem: (item: any) => React.ReactNode }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {items.length > 0 ? items.map(renderItem) : <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>}
    </CardContent>
  </Card>
);

const ModelItem = ({ item }: { item: Model }) => (
  <div key={item.id} className="flex items-center gap-4">
    <Image src={item.avatar_url || '/placeholder-avatar.png'} alt="avatar" width={40} height={40} className="rounded-full object-cover" />
    <div className="flex-1">
      <p className="text-sm font-medium leading-none">{item.nome}</p>
    </div>
    <Button variant="outline" size="sm" asChild>
      <Link href={`/admin/models/${item.id}`}>Ver</Link>
    </Button>
  </div>
);

const MediaItem = ({ item }: { item: Media }) => (
  <div key={item.id} className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
        {item.tipo === 'photo' ? (
            <Image src={item.url} alt="mídia" width={40} height={40} className="object-cover w-full h-full" />
        ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </div>
        )}
    </div>
    <div className="flex-1 truncate">
      <p className="text-sm font-medium leading-none truncate">{item.descricao || "Mídia sem descrição"}</p>
      <p className="text-xs text-muted-foreground">{item.models?.nome}</p>
    </div>
    <Button variant="outline" size="sm" asChild>
      <Link href={`/admin/models/${item.modelo_id}/media`}>Ver</Link>
    </Button>
  </div>
);

const ChartCard = ({ data }: { data: UploadsByDay[] }) => (
    <Card className="lg:col-span-1">
        <CardHeader>
            <CardTitle>Uploads nos Últimos 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
)

const DashboardSkeleton = () => (
    <>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
        <div className="grid gap-6 mt-8 grid-cols-1 lg:grid-cols-3">
            <Skeleton className="h-80 lg:col-span-1" />
            <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
            </div>
        </div>
    </>
)

