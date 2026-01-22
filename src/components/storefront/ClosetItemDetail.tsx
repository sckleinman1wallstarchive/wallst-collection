import { useState, useEffect } from 'react';
import { PublicInventoryItem } from '@/hooks/usePublicInventory';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, MessageCircle, ZoomIn, ArrowLeft } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';

interface ClosetItemDetailProps {
  item: PublicInventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Instagram handle for DM links
const INSTAGRAM_HANDLE = 'wallst.collection';

export function ClosetItemDetail({ item, open, onOpenChange }: ClosetItemDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Reset state when item changes
  useEffect(() => {
    if (item) {
      setCurrentImageIndex(0);
    }
  }, [item]);

  if (!item) return null;

  const images = item.imageUrls?.length > 0 ? item.imageUrls : (item.imageUrl ? [item.imageUrl] : []);
  const isDM = item.closetDisplay === 'dm';

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDMClick = () => {
    window.open(`https://instagram.com/${INSTAGRAM_HANDLE}`, '_blank');
  };

  const handleImageClick = () => {
    if (images.length > 0) {
      setLightboxOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0 overflow-hidden">
          {/* Back Arrow */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 z-20 bg-background/80 hover:bg-background"
            onClick={() => onOpenChange(false)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="grid md:grid-cols-2 gap-0 max-h-[90vh]">
            {/* Image Gallery */}
            <div className="relative bg-muted/20">
              {images.length > 0 ? (
                <>
                  <div 
                    className="aspect-square relative overflow-hidden cursor-zoom-in group"
                    onClick={handleImageClick}
                  >
                    <img
                      src={images[currentImageIndex]}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <ZoomIn className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      {/* Thumbnails */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.slice(0, 6).map((img, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                            className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                              idx === currentImageIndex ? 'border-primary' : 'border-transparent opacity-70'
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                        {images.length > 6 && (
                          <div className="w-12 h-12 rounded-md bg-black/50 flex items-center justify-center text-white text-xs">
                            +{images.length - 6}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="aspect-square flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>

            {/* Item Info */}
            <div className="p-6 flex flex-col overflow-y-auto">
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    {item.brand || 'Unknown Brand'}
                  </p>
                  <h2 className="text-2xl font-semibold mt-1">{item.name}</h2>
                </div>

                <Badge variant={isDM ? 'default' : 'secondary'} className="text-sm">
                  {isDM ? 'DM to Inquire' : 'Not For Sale'}
                </Badge>

                <div className="flex gap-2 flex-wrap">
                  {item.size && (
                    <Badge variant="outline">Size: {item.size}</Badge>
                  )}
                  {item.brandCategory && (
                    <Badge variant="outline">{item.brandCategory}</Badge>
                  )}
                </div>

                {isDM && (
                  <p className="text-muted-foreground text-sm">
                    This item is part of our personal collection. If you're interested, 
                    send us a DM on Instagram to discuss.
                  </p>
                )}

                {!isDM && (
                  <p className="text-muted-foreground text-sm">
                    This item is part of our personal collection and is not currently available for sale.
                  </p>
                )}
              </div>

              {isDM ? (
                <Button
                  size="lg"
                  className="w-full mt-6"
                  onClick={handleDMClick}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  DM to Inquire
                </Button>
              ) : (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-muted-foreground font-medium">Not For Sale</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This piece is part of our personal archive.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Lightbox */}
      <ImageLightbox
        images={images}
        initialIndex={currentImageIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
