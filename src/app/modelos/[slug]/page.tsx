import { notFound } from 'next/navigation';
import { createServer } from '@/lib/supabase/server';
import { ProfileHeader } from '@/components/content-cove/profile-header';
import { ProfileCard } from '@/components/content-cove/profile-card';
import { ExclusiveContent } from '@/components/content-cove/exclusive-content';
import { MediaGridSkeleton } from '@/components/content-cove/media-grid';
import { Suspense } from 'react';
import type { Model, Media } from '@/types';

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function ModelShowcasePage({ params }: PageProps) {
  const { slug } = params;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      notFound();
    }

    const supabase = createServer();
    const { data: model, error: modelError } = await supabase
      .from('models')
      .select('*')
      .eq('slug', slug)
      .single();

    if (modelError || !model) {
      notFound();
    }

    const { data: mediaItems = [] } = await supabase
      .from('media')
      .select('*')
      .eq('modelo_id', model.id)
      .order('created_at', { ascending: false });

    return (
      <div className="min-h-screen bg-background text-foreground">
        <ProfileHeader modelName={model.nome} username={model.redes || `@${model.slug}`} />
        <main className="container mx-auto max-w-5xl px-4 pb-16">
          {/* Banners temporarily disabled — removed from model pages */}
          <ProfileCard model={model as Model} />
          <Suspense fallback={<MediaGridSkeleton />}>
            <ExclusiveContent initialMediaItems={(mediaItems as Media[]) || []} />
          </Suspense>
        </main>
        <footer className="border-t border-white/10 py-10">
          <div className="container mx-auto max-w-5xl px-4 text-center text-white/60 text-sm">
            Conteúdo hospedado com segurança. Última atualização: {new Date(model.created_at).toLocaleDateString('pt-BR')}
          </div>
        </footer>
      </div>
    );
  } catch (error) {
    console.error('Erro ao carregar página do modelo:', error);
    notFound();
  }
}

