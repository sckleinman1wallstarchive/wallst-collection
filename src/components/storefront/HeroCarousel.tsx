import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { useStorefrontBrands } from '@/hooks/useStorefrontBrands';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroCarouselProps {
  onShopBrand: (brandName: string) => void;
}

export function HeroCarousel({ onShopBrand }: HeroCarouselProps) {
  const { brands, isLoading } = useStorefrontBrands();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter brands with art images
  const brandsWithArt = brands.filter(b => b.art_image_url);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (!emblaApi || brandsWithArt.length <= 1) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi, brandsWithArt.length]);

  if (isLoading) {
    return (
      <div className="h-[70vh] bg-black flex items-center justify-center">
        <div className="animate-pulse text-white/50">Loading...</div>
      </div>
    );
  }

  if (brandsWithArt.length === 0) {
    return (
      <div className="h-[70vh] bg-black flex items-center justify-center">
        <div className="text-center text-white/60">
          <p className="text-lg mb-2">No featured brands yet</p>
          <p className="text-sm">Add brand art in Shop By Brand section</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] bg-black">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {brandsWithArt.map((brand) => (
            <div
              key={brand.id}
              className="flex-[0_0_100%] min-w-0 relative h-full"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${brand.art_image_url})` }}
              />
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-4xl md:text-6xl font-light tracking-[0.3em] text-white mb-8 uppercase">
                  {brand.brand_name}
                </h2>
                <Button
                  onClick={() => onShopBrand(brand.brand_name)}
                  className="bg-white hover:bg-white/90 text-black uppercase tracking-[0.15em] px-8 py-6 text-sm font-medium"
                >
                  Shop Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {brandsWithArt.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      {/* Dots */}
      {brandsWithArt.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {brandsWithArt.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === selectedIndex ? 'bg-white' : 'bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
