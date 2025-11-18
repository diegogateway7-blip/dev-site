import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { Banner } from '@/types';
import placeholderImages from '@/lib/placeholder-images.json';

type HeroBannersProps = {
  banners: Banner[];
};

export function HeroBanners({ banners }: HeroBannersProps) {
  const items = banners.length > 0 ? banners : placeholderImages.mediaItems.slice(0, 4).map((media, index) => ({
    id: `placeholder-${index}`,
    titulo: media.hint || 'Conteúdo premium',
    tipo: media.type,
    url: media.url,
    link: null,
  }));

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">em destaque</p>
          <h2 className="text-2xl font-headline text-white">Drops selecionados</h2>
        </div>
        <Badge className="bg-white/10 text-xs text-white">+{items.length} banners</Badge>
      </div>

      <Carousel className="relative">
        <CarouselContent>
          {items.map(item => (
            <CarouselItem key={item.id} className="md:basis-1/2">
              <div className="group relative h-64 overflow-hidden rounded-[32px] border border-white/10 bg-[color:var(--surface-card)] shadow-soft">
                {item.tipo === 'video' ? (
                  <video src={item.url || ''} className="h-full w-full object-cover opacity-80" autoPlay muted loop playsInline />
                ) : (
                  <Image src={item.url || placeholderImages.profile.coverImage.url} alt={item.titulo} fill className="object-cover transition group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                  <div className="space-y-2">
                    <Badge variant="glass">{item.tipo === 'video' ? 'Vídeo' : 'Imagem'}</Badge>
                    <h3 className="text-2xl font-semibold">{item.titulo}</h3>
                  </div>
                  {item.link && (
                    <Link href={item.link} target="_blank" className="text-sm underline decoration-dotted underline-offset-4">
                      Acessar conteúdo exclusivo
                    </Link>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="border-white/30 bg-black/40 text-white hover:bg-black/60" />
        <CarouselNext className="border-white/30 bg-black/40 text-white hover:bg-black/60" />
      </Carousel>
    </section>
  );
}

