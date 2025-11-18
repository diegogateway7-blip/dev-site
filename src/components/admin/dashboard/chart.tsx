"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UploadsByDay } from "@/lib/data";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
