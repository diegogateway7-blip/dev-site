import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const LockLogo = ({ label = "SigiloVip" }: { label?: string }) => (
  <span className="relative inline-flex items-center gap-2 rounded-full px-3 py-1 font-headline text-2xl font-semibold text-white">
    {label}
    <svg width="22" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sigilo-lock" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6B63FF" />
          <stop offset="100%" stopColor="#9E57E8" />
        </linearGradient>
      </defs>
      <rect x="5" y="10" width="14" height="11" rx="3" fill="url(#sigilo-lock)" />
      <path d="M8 10V7C8 4.79 9.79 3 12 3s4 1.79 4 4v3" stroke="url(#sigilo-lock)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.4" fill="white" />
      <rect x="11.2" y="15.2" width="1.6" height="3" rx="0.8" fill="white" />
    </svg>
  </span>
);

type ProfileHeaderProps = {
  modelName?: string;
  username?: string | null;
};

export function ProfileHeader({ modelName = "SigiloVip", username = "@conteudo.vip" }: ProfileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(16,14,30,0.85)] backdrop-blur-2xl">
      <nav className="container mx-auto max-w-5xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col gap-1">
              <LockLogo label={modelName} />
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Badge variant="glass" className="uppercase text-[10px] tracking-widest">+18</Badge>
                <span className="inline-flex items-center gap-1">{username || "Conteúdo exclusivo"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <div className="hidden lg:flex items-center gap-1 glass-panel rounded-full px-4 py-1 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-[var(--cta-green)] shadow-glow" />
              Online agora
            </div>
            <Button variant="glass" size="icon" aria-label="Alterar idioma">
              <Globe className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
