'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Video, Camera, Crown, Fullscreen } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input'; // Importa o Input
import { Search } from 'lucide-react';

// Corrigindo a tipagem dos dados importados
const typedMediaItems = placeholderImages.mediaItems.map(item => ({
  ...item,
  type: item.type as 'photo' | 'video',
})) as MediaItem[];

const photos = typedMediaItems.filter(item => item.type === 'photo');
const videos = typedMediaItems.filter(item => item.type === 'video');


const tabs = [
  { value: 'packs', label: 'Todos', icon: Crown },
  { value: 'photos', label: 'Fotos', icon: Camera },
  { value: 'videos', label: 'Vídeos', icon: Video },
];

export function ExclusiveContent() {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [activeTabItems, setActiveTabItems] = useState<MediaItem[]>(typedMediaItems); // Usando os dados com tipo corrigido
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // EFEITO PARA NAVEGAÇÃO COM TECLADO
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedMediaIndex === null) return; // Só funciona com o modal aberto

      if (event.key === 'ArrowRight') {
        mainApi?.scrollNext();
      } else if (event.key === 'ArrowLeft') {
        mainApi?.scrollPrev();
      } else if (event.key === 'Escape') {
        handleCloseDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mainApi, selectedMediaIndex]);

  // FUNÇÕES RESTAURADAS
  const handleItemClick = (item: MediaItem) => {
    const index = activeTabItems.findIndex(i => i.id === item.id);
    if (index !== -1) {
      setSelectedMediaIndex(index);
    }
  };

  const handleCloseDialog = () => {
    setSelectedMediaIndex(null);
    setIsFullscreen(false); // Garante que saia do fullscreen ao fechar
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  }

  const onTabChange = (value: string) => {
    setSearchQuery(""); // Limpa a busca ao trocar de aba
    switch (value) {
      case 'photos':
        setActiveTabItems(photos);
        break;
      case 'videos':
        setActiveTabItems(videos);
        break;
      default:
        setActiveTabItems(typedMediaItems);
    }
  };
  
  // Filtra os itens com base na busca
  const filteredItems = activeTabItems.filter(item => 
    item.hint?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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

        {/* Barra de Busca */}
        <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar por conteúdo..."
                className="w-full pl-10 glass-panel"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        <div>
          <Suspense fallback={<MediaGridSkeleton />}>
            <TabsContent value="packs" className="mt-0">
              <MediaGrid items={filteredItems} showMore onItemClick={handleItemClick} />
            </TabsContent>
            <TabsContent value="photos" className="mt-0">
              <MediaGrid items={filteredItems} onItemClick={handleItemClick} />
            </TabsContent>
            <TabsContent value="videos" className="mt-0">
              <MediaGrid items={filteredItems} onItemClick={handleItemClick} />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>

      <Dialog open={selectedMediaIndex !== null} onOpenChange={isOpen => !isOpen && handleCloseDialog()}>
        <DialogContent 
          className={cn(
            "w-full h-full p-0 border-0 shadow-soft bg-black/80 backdrop-blur-3xl transition-all duration-300",
            isFullscreen ? "max-w-full max-h-full" : "sm:h-auto sm:max-h-[92vh] max-w-5xl sm:rounded-2xl border sm:border-white/10"
          )}
        >
          <DialogHeader className="absolute top-0 right-0 z-20 flex items-center gap-2 p-4">
            <Button size="icon" variant="ghost" onClick={toggleFullscreen} className="text-white hover:bg-white/10">
                <Fullscreen className="h-4 w-4" />
            </Button>
            <DialogClose className="rounded-full border border-transparent bg-transparent p-2 text-white transition hover:bg-white/10">
              <X className="h-4 w-4" />
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 min-h-0 flex items-center justify-center">
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
              {/* Botões de navegação customizados para melhor posicionamento */}
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 border border-white/20 bg-black/30 text-white hover:bg-black/50" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 border border-white/20 bg-black/30 text-white hover:bg-black/50" />
            </Carousel>
          </div>


          <div className={cn(
            "flex-shrink-0 p-4 bg-black/30 transition-all duration-300",
            isFullscreen ? "opacity-0 invisible h-0" : "opacity-100 visible h-auto"
          )}>
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
