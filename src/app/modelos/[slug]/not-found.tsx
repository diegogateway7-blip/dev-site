import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ModelNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">404</p>
        <h1 className="text-3xl font-headline text-white">Modelo não encontrada</h1>
        <p className="text-white/70">
          O link que você tentou acessar não existe mais. Escolha outro perfil e continue aproveitando o conteúdo exclusivo.
        </p>
        <Button asChild variant="cta">
          <Link href="/modelos">Ver outras modelos</Link>
        </Button>
      </div>
    </div>
  );
}

