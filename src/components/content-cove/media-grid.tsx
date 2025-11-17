'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion'; // Importa a motion
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Play, Plus, Video } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type MediaItem = {
  id: number;
  url: string;
  type: 'photo' | 'video';
  hint?: string;
};

const INITIAL_VISIBLE_COUNT = 9;
const LOAD_MORE_COUNT = 9;

type MediaGridProps = {
  items: MediaItem[];
  showMore?: boolean;
  onItemClick: (item: MediaItem) => void;
};

// Variantes de animação para o container e os itens
const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Atraso entre a animação de cada item filho
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export function MediaGrid({ items, showMore = false, onItemClick }: MediaGridProps) {
  const [visibleCount, setVisibleCount] = useState(showMore ? INITIAL_VISIBLE_COUNT : items.length);

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = visibleCount < items.length;
  const remainingCount = items.length - visibleCount;

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, items.length));
  };

  return (
    <motion.div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
      variants={gridVariants}
      initial="hidden"
      animate="visible"
    >
      {visibleItems.map(item => (
        <MediaTile key={item.id} item={item} onClick={() => onItemClick(item)} />
      ))}
      {showMore && hasMore && (
        <button
          type="button"
          onClick={handleShowMore}
          className="group relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/5 text-center text-sm font-medium text-white/70 transition-all hover:border-white/40 hover:text-white"
        >
          <Plus className="h-6 w-6 text-white" />
          <p className="mt-2">Ver mais</p>
          <p className="text-xs text-white/50">({remainingCount}+ restantes)</p>
          <span className="absolute inset-0 bg-[var(--gradient-soft)] opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      )}
    </motion.div>
  );
}

type MediaTileProps = {
  item: MediaItem;
  onClick: () => void;
};

function MediaTile({ item, onClick }: MediaTileProps) {
  const isVideo = item.type === 'video';

  return (
    <motion.div
      variants={itemVariants} // Aplica a variante de animação do item
      className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
      onClick={onClick}
    >
      {isVideo ? (
        <video
          src={item.url}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <Image
          src={item.url}
          alt={`Media ${item.id}`}
          data-ai-hint={item.hint}
          width={600}
          height={600}
          
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      <span className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.45)' }} />

      <div className="absolute left-3 top-3">
        <Badge variant="premium" className="text-[10px] uppercase tracking-[0.2em]">
          exclusivo
        </Badge>
      </div>

      <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-3 py-1 text-xs text-white/80 backdrop-blur">
        {isVideo ? <Video className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
        {isVideo ? 'Vídeo' : 'Foto'}
      </div>

      <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="cta" size="sm" className="flex-1 text-xs">
          {isVideo ? 'Assistir agora' : 'Ver pack'}
        </Button>
        <Button
          variant="glass"
          size="icon"
          className="pointer-events-auto"
          aria-label={isVideo ? 'Assistir ao vídeo' : 'Ver foto'}
        >
          {isVideo ? <Play className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  );
}

export function MediaGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="aspect-square rounded-2xl bg-[var(--skeleton-base)]"
          style={{
            backgroundImage: 'linear-gradient(90deg, var(--skeleton-base), var(--skeleton-highlight), var(--skeleton-base))',
            backgroundSize: '200% 100%',
          }}
        />
      ))}
    </div>
  );
}

type ThumbProps = {
  selected: boolean;
  onClick: () => void;
  item: MediaItem;
};

export function Thumb({ selected, onClick, item }: ThumbProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-selected={selected}
      className={cn(
        'relative h-20 w-20 overflow-hidden rounded-xl border border-white/10 bg-black/40 transition-all hover:border-white/40 data-[selected=true]:border-[var(--cta-green)]',
        !selected && 'opacity-60'
      )}
    >
      {item.type === 'photo' ? (
        <Image src={item.url} alt={`Thumbnail ${item.id}`} width={80} height={80}  className="h-full w-full object-cover" />
      ) : (
        <div className="relative h-full w-full">
          <video src={item.url} muted playsInline className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Play className="h-5 w-5 text-white" />
          </div>
        </div>
      )}
    </button>
  );
}

