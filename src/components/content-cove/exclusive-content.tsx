'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, X, Video, Camera } from 'lucide-react';
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
} from "@/components/ui/carousel"
import placeholderImages from '@/lib/placeholder-images.json';
import { cn } from '@/lib/utils';

const { mediaItems } = placeholderImages;

const photos = mediaItems.filter(item => item.type === 'photo');
const videos = mediaItems.filter(item => item.type === 'video');

const INITIAL_VISIBLE_COUNT = 9;
const LOAD_MORE_COUNT = 9;

function MediaGrid({
  items,
  showMore: initialShowMore,
  onItemClick,
}: {
  items: typeof mediaItems;
  showMore?: boolean;
  onItemClick: (item: (typeof mediaItems)[0]) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(initialShowMore ? INITIAL_VISIBLE_COUNT : items.length);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;
  const remainingCount = items.length - visibleCount;

  const handleShowMore = () => {
    setVisibleCount(prevCount => Math.min(prevCount + LOAD_MORE_COUNT, items.length));
  };

  const renderMoreItem = () => {
    if (!initialShowMore || !hasMore) return null;

    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-secondary/50 flex flex-col items-center justify-center text-center text-foreground gap-2 p-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-card/80 hover:bg-card h-12 w-12 transition-transform hover:scale-110"
            onClick={handleShowMore}
          >
            <Plus className="h-6 w-6" />
          </Button>
          <p className="font-semibold">Ver mais</p>
          <p className="text-sm text-muted-foreground">({remainingCount}+ restantes)</p>
        </div>
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
      {visibleItems.map(item => (
        <div
          key={item.id}
          className="relative aspect-square w-full overflow-hidden rounded-lg group cursor-pointer"
          onClick={() => onItemClick(item)}
        >
          {item.type === 'photo' ? (
             <Image
              src={item.url}
              alt={`Media ${item.id}`}
              data-ai-hint={item.hint}
              width={400}
              height={400}
              unoptimized
              className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          ) : (
            <video 
              src={item.url} 
              autoPlay 
              loop 
              muted 
              playsInline
              className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100">
              <div className="p-2 bg-black/50 rounded-full">
                {item.type === 'video' ? <Video className="h-8 w-8 text-white" /> : <Camera className="h-8 w-8 text-white" />}
              </div>
            </div>
        </div>
      ))}
      {renderMoreItem()}
    </div>
  );
}

function Thumb({
  selected,
  onClick,
  item,
}: {
  selected: boolean;
  onClick: () => void;
  item: typeof mediaItems[0];
}) {
  return (
    <div className={cn("relative aspect-square h-20 flex-shrink-0 cursor-pointer", !selected && 'opacity-50')}>
      <Button
        onClick={onClick}
        className="w-full h-full p-0 rounded-md overflow-hidden border-2 border-transparent data-[selected=true]:border-primary"
        variant="ghost"
        data-selected={selected}
      >
        {item.type === 'photo' ? (
          <Image
            src={item.url}
            alt={`Thumbnail ${item.id}`}
            width={80}
            height={80}
            unoptimized
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="relative w-full h-full">
            <video src={item.url} muted playsInline className="object-cover w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Video className="h-6 w-6 text-white" />
            </div>
          </div>
        )}
      </Button>
    </div>
  );
}

export function ExclusiveContent() {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [activeTabItems, setActiveTabItems] = useState(mediaItems);
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const handleItemClick = (item: (typeof mediaItems)[0]) => {
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
    <section className="mt-8">
      <Tabs defaultValue="all" className="w-full" onValueChange={onTabChange}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-headline">Meus Packs Exclusivos</h2>
            <TabsList className="grid grid-cols-3 md:w-auto md:inline-flex mb-0 bg-gray-100 rounded-lg">
                <TabsTrigger value="all" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Todos</TabsTrigger>
                <TabsTrigger value="photos" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Camera className="mr-2 h-4 w-4"/>Fotos</TabsTrigger>
                <TabsTrigger value="videos" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Video className="mr-2 h-4 w-4"/>Vídeos</TabsTrigger>
            </TabsList>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Conteúdo exclusivo</h3>
          <TabsContent value="all" className="mt-0">
            <MediaGrid items={mediaItems} showMore onItemClick={handleItemClick} />
          </TabsContent>
          <TabsContent value="photos" className="mt-0">
            <MediaGrid items={photos} onItemClick={handleItemClick} />
          </TabsContent>
          <TabsContent value="videos" className="mt-0">
            <MediaGrid items={videos} onItemClick={handleItemClick} />
          </TabsContent>
        </div>
      </Tabs>
      <Dialog open={selectedMediaIndex !== null} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
        <DialogContent className="max-w-4xl w-full h-full sm:h-auto sm:max-h-[90vh] p-0 bg-background border-0 flex flex-col justify-center">
          <DialogHeader className="absolute top-0 left-0 right-0 z-20">
            <DialogTitle className="sr-only">Visualizar Mídia</DialogTitle>
             <DialogClose className="absolute right-2 top-2 bg-background/50 text-foreground rounded-full p-1 hover:bg-background">
                <X className="h-5 w-5" />
             </DialogClose>
          </DialogHeader>
          
          <div className="flex-1 flex items-center justify-center min-h-0">
            <Carousel setApi={setMainApi} className="w-full h-full">
              <CarouselContent>
                {activeTabItems.map((item, index) => (
                  <CarouselItem key={index} className="flex items-center justify-center">
                    {item.type === 'photo' ? (
                      <div className="relative w-full h-full max-h-[calc(90vh-104px)] sm:max-h-[calc(90vh-120px)]">
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
                        className="max-h-[calc(90vh-104px)] sm:max-h-[calc(90vh-120px)] max-w-full" 
                      />
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/30 text-foreground hover:bg-background/50 hover:text-foreground border-0" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/30 text-foreground hover:bg-background/50 hover:text-foreground border-0" />
            </Carousel>
          </div>

          <div className="flex-shrink-0 p-4 pt-2 bg-background/50">
             <Carousel setApi={setThumbApi} opts={{ align: 'start', containScroll: 'keepSnaps' }}>
              <CarouselContent className="-ml-2">
                {activeTabItems.map((item, index) => (
                  <CarouselItem key={item.id} className="pl-2 basis-auto">
                    <Thumb
                      onClick={() => onThumbClick(index)}
                      selected={index === currentSlide}
                      item={item}
                    />
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
