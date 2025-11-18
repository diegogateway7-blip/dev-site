import Link from 'next/link';
import Image from 'next/image';
import { createServer } from '@/lib/supabase/server';
import type { Model } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import placeholderImages from '@/lib/placeholder-images.json';

export default async function ModelsIndexPage() {
  const supabase = createServer();
  const { data, error } = await supabase.from('models').select('*').order('created_at', { ascending: false });
  const models = (data as Model[]) || [];

  if (error) {
    console.error('Erro ao carregar modelos', error);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-6xl px-6 py-16 space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Selecione a musa</p>
          <h1 className="text-4xl font-headline font-semibold text-white">Conteúdos exclusivos</h1>
          <p className="text-white/70 max-w-3xl">
            Cada perfil possui packs premium, lives mensais e drops secretos. Clique para acessar a página completa da modelo.
          </p>
        </header>

        {models.length === 0 ? (
          <Card className="border-white/10 bg-[color:var(--surface-card)]/80 text-white">
            <CardHeader>
              <CardTitle>Nenhuma modelo publicada</CardTitle>
              <CardDescription className="text-white/70">Cadastre uma modelo no admin para liberar esta área.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {models.map(model => (
              <Link key={model.id} href={`/modelos/${model.slug || model.id}`} className="group">
                <Card className="h-full border-white/10 bg-[color:var(--surface-card)]/80 transition group-hover:-translate-y-1 group-hover:border-white/30">
                  <CardContent className="flex flex-col gap-4 p-5">
                    <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-white/10">
                      <Image
                        src={model.banner_url || placeholderImages.profile.coverImage.url}
                        alt={model.nome}
                        fill
                        className="object-cover transition group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white">
                        <Image
                          src={model.avatar_url || placeholderImages.profile.profileAvatar.url}
                          alt={model.nome}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">{model.nome}</h2>
                        <p className="text-sm text-white/60">{model.redes || `@${model.slug || 'vip'}`}</p>
                      </div>
                      <Badge className="ml-auto bg-white/10 text-white">Entrar</Badge>
                    </div>
                    <p className="text-sm text-white/70 line-clamp-3">{model.bio || 'Conteúdo premium com atualizações semanais.'}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

