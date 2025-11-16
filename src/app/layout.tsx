import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Larissa - Conteúdo Exclusivo',
  description: 'Perfil com conteúdo exclusivo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
