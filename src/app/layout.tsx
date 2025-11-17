import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { cn } from '@/lib/utils';

// ATENÇÃO: Substitua 'https://SEU_SITE.com' pela URL real do seu site em produção.
const siteUrl = 'https://packlarissa-desenvolvimento.vercel.app';
const siteTitle = 'Larissa - Conteúdo Exclusivo';
// CORREÇÃO: Usando crases (template literals) para permitir múltiplas linhas
const siteDescription = `O único lugar para encontrar meu conteúdo exclusivo. Assine e tenha acesso a fotos
e vídeos que não publico em nenhum outro lugar.`;

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  // Metadados Open Graph e Twitter
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og-image.jpg`, // Você precisa criar e colocar essa imagem na pasta /public
        width: 1200,
        height: 630,
        alt: `Preview de ${siteTitle}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [`${siteUrl}/og-image.jpg`], // Mesma imagem para o Twitter
  },
  // Cor do tema para navegadores mobile
  themeColor: '#161426', // Cor de fundo principal
};

// Configuração das fontes
const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background text-foreground",
        fontBody.variable,
        fontHeadline.variable
      )}>
        {children}
      </body>
    </html>
  );
}
