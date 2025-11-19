"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    title: "1. Configure o Supabase",
    body: [
      "Crie um projeto em https://app.supabase.com.",
      "No Table Editor, crie/valide as tabelas models, media e banners usando o script SQL fornecido na tela de Config.",
      "Crie os buckets públicos: models, media e banners em Storage.",
    ],
  },
  {
    title: "2. Credenciais públicas",
    body: [
      "Em Settings › API copie Project URL e anon public key.",
      "Cole esses valores em /admin/config e salve.",
    ],
  },
  {
    title: "3. Modelos & mídias",
    body: [
      "Cadastre modelos em /admin/models (nome, bio, avatar, capa, slug).",
      "Gerencie packs em /admin/models/[id]/media ou use Importar Mídias.",
    ],
  },
  // Banners step removed
  {
    title: "5. Segurança básica",
    body: [
      "Habilite apenas usuários conhecidos no Supabase Auth.",
      "Jamais exponha a service_role key.",
      "Troque o anon key se suspeitar de vazamento.",
    ],
  },
];

export default function AdminTutorialPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">onboarding</p>
        <h1 className="text-3xl font-headline font-semibold text-white">Tutorial rápido do painel</h1>
        <p className="text-white/70">Checklist para subir o projeto do zero e manter o painel seguro.</p>
      </div>

      <div className="grid gap-4">
        {steps.map((step, index) => (
          <Card key={step.title} className="border-white/10 bg-[color:var(--surface-card)]/80 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{step.title}</CardTitle>
              <Badge variant="outline">Passo {index + 1}</Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-white/80">
              {step.body.map((item, i) => (
                <p key={i}>{item}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-amber-400/30 bg-amber-400/5 text-white">
        <CardHeader>
          <CardTitle>Restore rápido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-white/80">
          <p>Perdeu o banco? Basta apontar um novo URL + anon key em /admin/config.</p>
          <Separator className="bg-white/10" />
          <p>Exporte dados/arquivos pelo dashboard do Supabase para clonar ambientes.</p>
        </CardContent>
      </Card>
    </div>
  );
}

