import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProfileHeader() {
  return (
    <header className="bg-card">
      <nav className="container mx-auto max-w-4xl px-4">
        <div className="flex justify-between items-center h-16">
          <a href="#" className="relative inline-flex items-center gap-1 px-3 py-1.5 group">
            {/* Arco neon decorativo */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 200 60"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor: '#667eea', stopOpacity: 0}} />
                  <stop offset="20%" style={{stopColor: '#667eea', stopOpacity: 0.6}} />
                  <stop offset="50%" style={{stopColor: '#764ba2', stopOpacity: 0.8}} />
                  <stop offset="80%" style={{stopColor: '#667eea', stopOpacity: 0.6}} />
                  <stop offset="100%" style={{stopColor: '#667eea', stopOpacity: 0}} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {/* Arco superior */}
              <path 
                d="M 10 10 Q 100 5, 190 10" 
                stroke="url(#neonGrad)" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round"
                filter="url(#glow)"
                className="animate-pulse"
              />
              {/* Arco inferior */}
              <path 
                d="M 10 50 Q 100 55, 190 50" 
                stroke="url(#neonGrad)" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round"
                filter="url(#glow)"
                className="animate-pulse"
                style={{animationDelay: '0.5s'}}
              />
            </svg>
            
            {/* Texto com efeito neon */}
            <span className="text-2xl font-bold text-foreground font-headline relative z-10 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(102,126,234,0.8)]">
              SigiloVip
            </span>
            
            {/* Cadeado com efeito neon */}
            <svg 
              viewBox="0 0 30 38" 
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-5 inline-block relative z-10 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(102,126,234,0.8)]"
            >
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#667eea', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#764ba2', stopOpacity: 1}} />
                </linearGradient>
                <filter id="lockGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <rect x="5" y="16" width="20" height="22" rx="3" fill="url(#grad1)" filter="url(#lockGlow)"/>
              <path 
                d="M 9 16 L 9 11 Q 9 5, 15 5 Q 21 5, 21 11 L 21 16" 
                stroke="url(#grad1)" 
                strokeWidth="4" 
                fill="none" 
                strokeLinecap="round"
                filter="url(#lockGlow)"
              />
              <circle cx="15" cy="25" r="3" fill="white" opacity="0.9"/>
              <rect x="13.5" y="25" width="3" height="6" rx="1.5" fill="white" opacity="0.9"/>
              <ellipse cx="12" cy="20" rx="3" ry="4" fill="white" opacity="0.2"/>
            </svg>
          </a>
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted/50">
            <Globe className="h-6 w-6" />
            <span className="sr-only">Language</span>
          </Button>
        </div>
      </nav>
    </header>
  );
}
