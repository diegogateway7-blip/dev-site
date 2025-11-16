import { Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import placeholderImages from '@/lib/placeholder-images.json';

const navLinks = [
  { label: 'Moodboard', href: '#moodboard' },
  { label: 'Packs', href: '#packs' },
  { label: 'Suporte', href: '#support' },
];

export function ProfileHeader() {
  const { profileAvatar } = placeholderImages.profile;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(16,14,30,0.85)] backdrop-blur-2xl">
      <nav className="container mx-auto max-w-5xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-[var(--gradient-main)] opacity-70 blur-xl" aria-hidden />
              <Avatar className="relative h-12 w-12 border-2 border-white/40 shadow-soft">
                <AvatarImage src={profileAvatar.url} alt={profileAvatar.alt} />
                <AvatarFallback>LS</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Roxo Premium</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl font-headline font-semibold text-white">SigiloVip</span>
                <Badge variant="glass" className="uppercase text-[10px] tracking-widest">+18</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-[#F7A83A]" />
                  Conteúdo diário exclusivo
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <div className="hidden lg:flex items-center gap-1 glass-panel rounded-full px-4 py-1 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-[var(--cta-green)] shadow-glow" />
              Online agora
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm text-white/70">
              {navLinks.map(link => (
                <a key={link.label} href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </a>
              ))}
            </div>
            <Button variant="glass" size="icon" aria-label="Alterar idioma">
              <Globe className="h-5 w-5" />
            </Button>
            <Button variant="cta" size="sm">
              Entrar no VIP
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
