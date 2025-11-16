import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle2, Palette, PlayCircle, Sparkles } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';

const packFeatures = [
  '24 vídeos POV 4K + bastidores RAW',
  'Moodboard sensual suave + glassmorphism',
  'Scripts personalizados (voz + texto)',
  'Entrega simultânea em versão dark/light',
];

const imageGuidelines = [
  'Crop 1:1 ou 4:5 para feeds e miniaturas',
  '+3% contraste e +4% saturação para reforçar o Roxo Premium',
  'Evite highlights estourados; mantenha textura de pele natural',
  'Aplicar blur suave no fundo para destacar o sujeito',
];

export function PackSpotlight() {
  const heroPhoto = placeholderImages.mediaItems.find(item => item.type === 'photo');
  const moodboardShots = placeholderImages.mediaItems.filter(item => item.type === 'photo').slice(1, 5);

  return (
    <section className="mb-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]" id="packs">
      <div className="rounded-[32px] border border-white/10 bg-[var(--surface-card)]/85 p-8 shadow-soft backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="premium" className="text-[11px] uppercase tracking-[0.3em]">
            pack destaque
          </Badge>
          <span className="text-sm text-[hsl(var(--muted-700))]">drop 11 . CEO Secrets</span>
        </div>
        <h2 className="mt-4 text-3xl font-headline font-semibold text-[hsl(var(--text-900))]">Moodboard & página detalhada</h2>
        <p className="mt-2 text-[hsla(var(--text-900),_0.85)]">
          Experiência sofisticada com glassmorphism leve, CTA verde fixo e microinterações (hover 1.02 / press 0.98). Skeleton loading garante transição
          suave enquanto os packs carregam.
        </p>

        <ul className="mt-6 grid gap-3 text-sm text-[hsl(var(--text-900))] sm:grid-cols-2">
          {packFeatures.map(feature => (
            <li key={feature} className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-[#2FCF7F]" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="cta" size="lg">
            Liberar pack agora
          </Button>
          <Button variant="glass" size="lg">
            <Palette className="mr-2 h-5 w-5" />
            Ver moodboard
          </Button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/15 bg-white/70 p-4 text-sm text-[hsl(var(--text-900))]">
          <p className="flex items-center gap-2 font-semibold uppercase tracking-[0.3em] text-[hsl(var(--muted-700))]">
            <Sparkles className="h-4 w-4 text-[#D85DB2]" />
            instruções de imagem
          </p>
          <ul className="mt-3 space-y-2">
            {imageGuidelines.map(rule => (
              <li key={rule} className="flex items-start gap-2">
                <Camera className="mt-1 h-4 w-4 text-[#6B63FF]" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4 rounded-[32px] border border-white/10 bg-[var(--surface-card)]/60 p-6 shadow-soft backdrop-blur-xl" id="moodboard">
        <div className="relative h-72 w-full overflow-hidden rounded-3xl">
          {heroPhoto && (
            <Image
              src={heroPhoto.url}
              alt="Moodboard destaque"
              width={1200}
              height={960}
              unoptimized
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-black/40 p-3 text-white backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Guideline</p>
              <p className="text-lg font-semibold">Glass Intimate</p>
            </div>
            <Button variant="glass" size="icon" aria-label="Visualizar vídeos">
              <PlayCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {moodboardShots.map(item => (
            <div key={item.id} className="relative h-36 overflow-hidden rounded-2xl border border-white/10">
              <Image src={item.url} alt={`Inspiração ${item.id}`} width={600} height={600} unoptimized className="h-full w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
