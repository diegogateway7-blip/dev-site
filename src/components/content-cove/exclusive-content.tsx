'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Video, Camera, Crown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import placeholderImages from '@/lib/placeholder-images.json';
import { MediaGrid, MediaGridSkeleton, Thumb, type MediaItem } from './media-grid';

const { mediaItems } = placeholderImages;

const photos = mediaItems.filter(item => item.type === 'photo');
const videos = mediaItems.filter(item => item.type === 'video');

const tabs = [
  { value: 'packs', label: 'Packs', icon: Crown },
  { value: 'photos', label: 'Fotos', icon: Camera },
  { value: 'videos', label: 'Vídeos', icon: Video },
];

export function ExclusiveContent() {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [activeTabItems, setActiveTabItems] = useState<MediaItem[]>(mediaItems);
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi || !thumbApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi, thumbApi]
  );

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;
    const newSelectedIndex = mainApi.selectedScrollSnap();
    setCurrentSlide(newSelectedIndex);
    if (thumbApi.selectedScrollSnap() !== newSelectedIndex) {
      thumbApi.scrollTo(newSelectedIndex);
    }
  }, [mainApi, thumbApi]);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on('select', onSelect);
    mainApi.on('reInit', onSelect);
    return () => {
      mainApi.off('select', onSelect);
      mainApi.off('reInit', onSelect);
    };
  }, [mainApi, onSelect]);

  useEffect(() => {
    if (selectedMediaIndex !== null && mainApi) {
      mainApi.scrollTo(selectedMediaIndex, true);
      setCurrentSlide(selectedMediaIndex);
    }
  }, [selectedMediaIndex, mainApi]);

  const handleItemClick = (item: MediaItem) => {
    const index = activeTabItems.findIndex(i => i.id === item.id);
    if (index !== -1) {
      setSelectedMediaIndex(index);
    }
  };

  const handleCloseDialog = () => {
    setSelectedMediaIndex(null);
  };

  const onTabChange = (value: string) => {
    switch (value) {
      case 'photos':
        setActiveTabItems(photos);
        break;
      case 'videos':
        setActiveTabItems(videos);
        break;
      default:
        setActiveTabItems(mediaItems);
    }
  };

  return (
    <section className="mt-12">
      <Tabs defaultValue="packs" className="w-full" onValueChange={onTabChange}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Área de membros</p>
            <h2 className="text-3xl font-headline font-semibold text-white">Meus packs exclusivos</h2>
          </div>
          <TabsList className="glass-panel flex gap-1 rounded-full bg-white/10 p-1">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60 data-[state=active]:bg-white data-[state=active]:text-[hsl(var(--text-900))]"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div>
          <p className="mb-4 text-sm text-white/70">
            Skeleton loading habilitado. Enquanto os packs carregam aplicamos shimmer `var(--skeleton-highlight)` para evitar saltos.
          </p>
          <TabsContent value="packs" className="mt-0">
            {isLoading ? <MediaGridSkeleton /> : <MediaGrid items={mediaItems} showMore onItemClick={handleItemClick} />}
          </TabsContent>
          <TabsContent value="photos" className="mt-0">
            {isLoading ? <MediaGridSkeleton /> : <MediaGrid items={photos} onItemClick={handleItemClick} />}
          </TabsContent>
          <TabsContent value="videos" className="mt-0">
            {isLoading ? <MediaGridSkeleton /> : <MediaGrid items={videos} onItemClick={handleItemClick} />}
          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={selectedMediaIndex !== null} onOpenChange={isOpen => !isOpen && handleCloseDialog()}>
        <DialogContent className="max-w-5xl w-full h-full sm:h-auto sm:max-h-[92vh] border border-white/10 bg-[var(--surface-card)]/95 p-0 shadow-soft backdrop-blur-3xl">
          <DialogHeader className="absolute top-0 left-0 right-0 z-20 flex justify-end p-4">
            <DialogTitle className="sr-only">Visualizar Mídia</DialogTitle>
            <DialogClose className="rounded-full border border-white/20 bg-black/40 p-2 text-white transition hover:bg-black/60">
              <X className="h-4 w-4" />
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 min-h-0">
            <Carousel setApi={setMainApi} className="w-full h-full">
              <CarouselContent>
                {activeTabItems.map((item, index) => (
                  <CarouselItem key={item.id} className="flex items-center justify-center">
                    {item.type === 'photo' ? (
                      <div className="relative w-full h-full max-h-[calc(92vh-120px)]">
                        <Image
                          src={item.url}
                          alt={`Media ${item.id}`}
                          fill
                          unoptimized
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 800px"
                          priority={index === selectedMediaIndex}
                        />
                      </div>
                    ) : (
                      <video
                        src={item.url}
                        controls
                        autoPlay={index === currentSlide}
                        className="max-h-[calc(92vh-140px)] max-w-full rounded-2xl border border-white/10"
                      />
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 border border-white/20 bg-black/30 text-white hover:bg-black/50" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 border border-white/20 bg-black/30 text-white hover:bg-black/50" />
            </Carousel>
          </div>

          <div className="flex-shrink-0 p-4 bg-black/30">
            <Carousel setApi={setThumbApi} opts={{ align: 'start', containScroll: 'keepSnaps' }}>
              <CarouselContent className="-ml-2">
                {activeTabItems.map((item, index) => (
                  <CarouselItem key={item.id} className="basis-auto pl-2">
                    <Thumb onClick={() => onThumbClick(index)} selected={index === currentSlide} item={item} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
