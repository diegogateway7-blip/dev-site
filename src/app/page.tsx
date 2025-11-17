import { Suspense } from 'react';
import { ProfileCard } from '@/components/content-cove/profile-card';
import { ExclusiveContent } from '@/components/content-cove/exclusive-content';
import { ProfileHeader } from '@/components/content-cove/profile-header';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { MediaGridSkeleton } from '@/components/content-cove/media-grid';
import { createServer } from '@/lib/supabase/server'; // Importa o cliente para servidor
import { Media } from '@/types'; // Importa o tipo Media

export default async function Home() {
  const supabase = createServer();
  const { data: mediaItems, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar mídias:", error);
    // Pode retornar uma página de erro aqui
  }

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <ProfileHeader />
      <main className="container mx-auto max-w-5xl px-4">
        <ProfileCard />
        <Suspense fallback={<MediaGridSkeleton />}>
          <ExclusiveContent initialMediaItems={(mediaItems as Media[]) || []} />
        </Suspense>
      </main>
      <footer className="border-t border-white/10 py-10">
        <div className="container mx-auto max-w-5xl px-4 flex flex-col items-center gap-4 text-center">
          <a
            href="?utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="cta" size="lg" className="font-semibold">
              <Send className="mr-2 h-5 w-5" />
              Grupo Vip Telegram
            </Button>
          </a>
        </div>
      </footer>
    </div>
  );
}
