import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Media, Model } from "@/types";

export type UploadsByDay = { date: string; count: number };

type DashboardMetrics = {
  modelsCount: number;
  mediaCount: number;
  recentModels: Model[];
  recentMedia: (Media & { models?: { nome: string } })[];
  uploadsData: UploadsByDay[];
  uploadsTrend: number;
  scheduledMedia: (Media & { publicar_em?: string | null; models?: { nome: string } })[];
};

const INITIAL_STATE: DashboardMetrics = {
  modelsCount: 0,
  mediaCount: 0,
  recentModels: [],
  recentMedia: [],
  uploadsData: [],
  uploadsTrend: 0,
  scheduledMedia: [],
};

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const nowIso = new Date().toISOString();

        const modelsPromise = supabase
          .from("models")
          .select("*", { count: "exact" })
          .order("id", { ascending: false })
          .limit(5);

        const mediaPromise = supabase
          .from("media")
          .select("*, models:models(nome)", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(5);

        const uploadsPromise = supabase
          .from("media")
          .select("created_at")
          .gte("created_at", sevenDaysAgo);

        const scheduledPromise = supabase
          .from("media")
          .select("id, descricao, publicar_em, modelo_id, models:models(nome)")
          .gte("publicar_em", nowIso)
          .order("publicar_em", { ascending: true })
          .limit(5);

        const [
          { data: modelsData, count: modelsCountData, error: modelsError },
          { data: mediaData, count: mediaCountData, error: mediaError },
          { data: uploadsRaw, error: uploadsError },
          { data: scheduledData, error: scheduledError },
        ] = await Promise.all([modelsPromise, mediaPromise, uploadsPromise, scheduledPromise]);

        if (modelsError) throw modelsError;
        if (mediaError) throw mediaError;
        if (uploadsError) throw uploadsError;
        if (scheduledError) throw scheduledError;

        const uploadsByDay = (uploadsRaw || []).reduce<Record<string, number>>((acc, item) => {
          const date = new Date(item.created_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          });
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const filledUploads = Array.from({ length: 7 }).map((_, index) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - index));
          const label = date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          });
          return {
            date: label,
            count: uploadsByDay[label] ?? 0,
          };
        });

        const midPoint = Math.floor(filledUploads.length / 2);
        const previousTotal = filledUploads.slice(0, midPoint).reduce((acc, day) => acc + day.count, 0);
        const recentTotal = filledUploads.slice(midPoint).reduce((acc, day) => acc + day.count, 0);
        const trend =
          previousTotal === 0
            ? recentTotal > 0
              ? 100
              : 0
            : Number((((recentTotal - previousTotal) / previousTotal) * 100).toFixed(1));

        setMetrics({
          modelsCount: modelsCountData ?? 0,
          mediaCount: mediaCountData ?? 0,
          recentModels: (modelsData as Model[]) || [],
          recentMedia: (mediaData as Media[]) || [],
          uploadsData: filledUploads,
          uploadsTrend: trend,
          scheduledMedia: scheduledData || [],
        });
      } catch (e: any) {
        setError("Erro ao buscar dados do dashboard: " + (e?.message || ""));
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  return {
    ...metrics,
    loading,
    error,
  };
}

