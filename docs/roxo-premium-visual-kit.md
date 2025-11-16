# Roxo Premium · Kit Visual Oficial

## 1. Moodboard & Inspirações
- [Studio lilac lights](https://images.unsplash.com/photo-1524504388940-b1c1722653e1) – contraste suave + pele iluminada.
- [Glass neon reflection](https://images.unsplash.com/photo-1504593811423-6dd665756598) – glassmorphism elegante.
- [Intimate purple fabric](https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb) – textura satin para fundos.
- [Lens flare rose](https://images.unsplash.com/photo-1507120878965-54b2d3939100) – uso de magenta quente.
- [Premium jewelry macro](https://images.unsplash.com/photo-1518544801958-efcbf8a7ec10) – destaques amber.
- [Editorial shadow play](https://images.unsplash.com/photo-1504674900247-0877df9cc836) – sensação íntima e sofisticada.

> Referência pronta em `PackSpotlight` (seção “Moodboard & página detalhada”) – copiar screenshots/PNGs diretamente para o handoff.

## 2. Tokens CSS / SCSS
Arquivo fonte: `src/styles/tokens.css`
- **Gradientes**  
  - `--gradient-main`: base hero/cards.  
  - `--gradient-soft`: overlay discreto (hover).  
  - `--gradient-card`: textura radial para seções longas.
- **Cores**  
  - Roxos: `--purple-600`, `--purple-500`.  
  - Acentos quentes: `--magenta`, `--amber`.  
  - Neutros lilás: `--lilac-200`, `--lilac-100`.  
  - CTA: `--cta-green`, `--cta-green-700`.  
  - Backgrounds: `--dark-900`, `--surface-card`, `--surface-card-dark`.
- **Sombras e vidros**  
  - `--shadow-soft`, `--shadow-glow`, `--shadow-glass`.  
  - Utilidades prontas: `.shadow-soft`, `.shadow-glow`, `.shadow-glass`, `.glass-panel`.
- **Radii**  
  - `--radius` (20px) e `--radius-lg` (32px). Componentes grandes usam `rounded-[32px]`.

## 3. Componentes
- **Header com avatar halo** (`src/components/content-cove/profile-header.tsx`)  
  - Halo animado via `span` absoluto + `--gradient-main`.  
  - Badge `+18` usando `variant="glass"`.  
  - Micro interação: botões `glass` / `cta` com scale 1.02/0.98.
- **Profile card premium** (`profile-card.tsx`)  
  - Cover overlay + CTA destacado com `--cta-green`.  
  - Stats cards (packs/vídeos/VIPs) + perks chips `glass-panel`.  
  - Bloco “Pack destaque” = mini página detalhada exigida no briefing.
- **Card de conteúdo** (`media-grid.tsx`)  
  - Thumbnail 1:1 com badge `EXCLUSIVO`, overlay CTA e info chip (foto/vídeo).  
  - Hover: scale 1.05 + gradiente.  
  - Estados `Ver mais` com borda tracejada.
- **Botão CTA** (`ui/button.tsx`)  
  - Variant `cta`: mantém sempre `--cta-green`, degrade para `--cta-green-700`.  
  - Variant `glass`: `backdrop-blur-xl`, útil para header/dialog/moodboard.
- **Filtro tabs** (`exclusive-content.tsx`)  
  - Tabs `Packs / Fotos / Vídeos` com `glass-panel` + uppercase tracking.  
  - Skeleton shimmer (`MediaGridSkeleton`) disparado 450 ms para evitar flash.

## 4. Instruções de Imagem
Aplicadas no componente `PackSpotlight` (card “Instruções de imagem”):
1. Crop 1:1 ou 4:5 para feeds/miniaturas.
2. +3 % contraste, +4 % saturação (consistência Roxo Premium).
3. Evitar highlights estourados; textura de pele natural.
4. Blur suave nos fundos para reforçar glassmorphism.

## 5. Dark Mode
- Tokens `.dark` já definidos (mesmo arquivo de tokens).  
- Cards migram para `var(--surface-card)` escuro e bordas `rgba(255,255,255,0.08)`.  
- CTAs permanecem verdes para contraste.  
- Para ativar, aplique `class="dark"` na `<html>` ou use ThemeProvider.

## 6. Notas Técnicas & Handoff
- `ProfileHeader`, `ProfileCard`, `ExclusiveContent`, `PackSpotlight`, `media-grid` prontos no layout principal.  
- Microinterações: `motion-safe:hover:scale-[1.02]` + `motion-safe:active:scale-[0.98]` nos botões, overlays com `transition-opacity`.  
- Skeleton loading (`MediaGridSkeleton`) usa `--skeleton-base` + `--skeleton-highlight` configurados nos tokens.  
- CTA principal sempre `variant="cta"`; botões secundários `variant="glass"` ou `outline`.  
- Para novos cards, reutilize utilidades `.glass-panel`, `.shadow-soft`.  
- Documentação disponível também no footer do site (linha de alerta sobre tokens).

