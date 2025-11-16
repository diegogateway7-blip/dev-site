import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import placeholderImages from '@/lib/placeholder-images.json';
import { Crown, ShieldCheck, Clock4 } from 'lucide-react';
import { PixGiftDialog } from './pix-gift';

const VerifiedIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-[#2FCF7F]"
  >
    <path
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM10.4961 16.6133L6.46484 12.582L7.87891 11.168L10.4961 13.7852L16.1211 8.16016L17.5352 9.57422L10.4961 16.6133Z"
      fill="currentColor"
    />
  </svg>
);

const stats = [
  { label: 'Packs exclusivos', value: '38', detail: '+3 esta semana' },
  { label: 'Vídeos premium', value: '112', detail: '45 horas de conteúdo' },
  { label: 'VIP ativos', value: '4.8K', detail: 'satisfação 4.9/5' },
];

const perks = ['Atualização diária', 'Conteúdo 4K', 'Atendimento anônimo', 'Garantia sigilo total'];

export function ProfileCard() {
  const { coverImage, profileAvatar } = placeholderImages.profile;

  return (
    <section className="relative mt-8 overflow-hidden rounded-[32px] border border-white/10 bg-[var(--surface-card)] shadow-soft">
      <div className="relative h-64 w-full overflow-hidden md:h-80">
        <Image
          src={coverImage.url}
          alt={coverImage.alt}
          data-ai-hint={coverImage.hint}
          width={coverImage.width}
          height={coverImage.height}
          unoptimized
          priority
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 mix-blend-multiply opacity-70" style={{ background: 'var(--gradient-main)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120b26] via-transparent to-transparent" />
        <Badge variant="premium" className="absolute left-6 top-6 text-[11px] uppercase tracking-[0.25em]">
          exclusivo
        </Badge>
      </div>

      <div className="flex flex-col gap-8 px-6 pb-10 pt-12 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="relative -mt-24">
              <span className="absolute inset-0 rounded-full bg-[var(--gradient-main)] blur-2xl opacity-60" aria-hidden />
              <Avatar className="relative h-32 w-32 border-4 border-white shadow-soft">
                <AvatarImage src={profileAvatar.url} data-ai-hint={profileAvatar.hint} alt={profileAvatar.alt} />
                <AvatarFallback>LS</AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-headline font-semibold text-[hsl(var(--text-900))]">Larissa Santos</h1>
                <VerifiedIcon />
              </div>
              <p className="text-muted-foreground">@larissasantos</p>
              <p className="max-w-lg text-lg text-[hsla(var(--text-900),_0.85)]">
                Sensual premium & intimista. Packs exclusivos, bastidores RAW e roleplays executivos sob demanda.
              </p>
              <div className="flex flex-wrap gap-3">
                {perks.map(item => (
                  <span key={item} className="glass-panel rounded-full px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/80">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map(stat => (
              <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/60 p-4 text-[hsl(var(--text-900))] shadow-soft">
                <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted-700))]">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
                <p className="text-sm text-[hsl(var(--muted-700))]">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-sm space-y-4 rounded-3xl border border-white/10 bg-[var(--surface-card)]/80 p-6 shadow-soft backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-[#F7A83A]" />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[hsl(var(--muted-700))]">Pack destaque</p>
              <h3 className="text-xl font-semibold text-[hsl(var(--text-900))]">CEO Secrets 4K</h3>
            </div>
          </div>
          <p className="text-sm text-[hsla(var(--text-900),_0.8)]">
            Inclui 24 vídeos POV, bastidores 4:5 e áudios imersivos. Atualizado mensalmente com drop secreto.
          </p>
          <div className="space-y-2 rounded-2xl bg-white/70 p-4 text-[hsl(var(--text-900))]">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-[#2FCF7F]" />
              Sigilo garantido
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock4 className="h-4 w-4 text-[#F7A83A]" />
              Atualização extra a cada sexta
            </div>
          </div>
          <div className="grid gap-3">
            <PixGiftDialog />
          </div>
        </div>
      </div>
    </section>
  );
}
