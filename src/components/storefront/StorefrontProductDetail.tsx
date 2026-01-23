import { useState, useEffect } from 'react';
import { PublicInventoryItem } from '@/hooks/usePublicInventory';
import { useShopCartStore } from '@/stores/shopCartStore';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShoppingCart, ChevronLeft, ChevronRight, Check, Loader2, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';
import { ImageLightbox } from './ImageLightbox';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface StorefrontProductDetailProps {
  item: PublicInventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode?: boolean;
}

const CATEGORIES = ['footwear', 'tops', 'bottoms', 'outerwear', 'accessories', 'bags', 'other'];

export function StorefrontProductDetail({ item, open, onOpenChange, isEditMode = false }: StorefrontProductDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedSize, setEditedSize] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const addItem = useShopCartStore(state => state.addItem);
  const isLoading = useShopCartStore(state => state.isLoading);
  const queryClient = useQueryClient();

  // Reset ALL state when item changes - including lightbox
  useEffect(() => {
    if (item) {
      setCurrentImageIndex(0);
      setLightboxOpen(false); // Reset lightbox state
      setEditedDescription(item.notes || '');
      setEditedSize(item.size || '');
      setEditedCategory(item.category || 'other');
      setJustAdded(false);
    }
  }, [item]);

  // Also reset lightbox when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setLightboxOpen(false);
    }
    onOpenChange(newOpen);
  };

  if (!item) return null;

  const images = item.imageUrls?.length > 0 ? item.imageUrls : (item.imageUrl ? [item.imageUrl] : []);
  const price = item.askingPrice;

  const handleAddToCart = () => {
    if (!price) return;
    addItem(item);
    setJustAdded(true);
    toast.success('Added to cart', {
      description: item.name,
      position: 'top-center'
    });
    setTimeout(() => setJustAdded(false), 2000);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageClick = () => {
    if (images.length > 0) {
      setLightboxOpen(true);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          notes: editedDescription || null,
          size: editedSize || null,
          category: editedCategory as any,
        })
        .eq('id', item.id);

      if (error) throw error;
      toast.success('Changes saved');
      queryClient.invalidateQueries({ queryKey: ['public-inventory'] });
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0 h-full">
            {/* Image Gallery */}
            <div className="relative bg-muted/20 h-full flex flex-col">
              {images.length > 0 ? (
                <>
                  <div 
                    className="flex-1 relative overflow-hidden cursor-zoom-in group"
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
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 flex flex-col overflow-y-auto">
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    {item.brand || 'Unknown Brand'}
                  </p>
                  <h2 className="text-2xl font-semibold mt-1">{item.name}</h2>
                </div>

                <p className="text-3xl font-bold">
                  {price ? `$${price.toFixed(2)}` : 'Price TBD'}
                </p>

                <div className="flex gap-2 flex-wrap">
                  {item.size && (
                    <Badge variant="secondary">Size: {item.size}</Badge>
                  )}
                  {item.brandCategory && (
                    <Badge variant="outline">{item.brandCategory}</Badge>
                  )}
                </div>

                {/* Edit Mode Fields */}
                {isEditMode && (
                  <div className="space-y-4 border-2 border-dashed border-primary/30 rounded-lg p-4 mt-4">
                    <p className="text-sm font-medium text-muted-foreground">Edit Item Details</p>
                    
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Add a description for this item..."
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Size</Label>
                        <Input
                          placeholder="e.g., 10, M, OS"
                          value={editedSize}
                          onChange={(e) => setEditedSize(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={editedCategory} onValueChange={setEditedCategory}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleSaveChanges}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>

              <Button
                size="lg"
                className="w-full mt-6"
                onClick={handleAddToCart}
                disabled={!price || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : justAdded ? (
                  <Check className="h-5 w-5 mr-2" />
                ) : (
                  <ShoppingCart className="h-5 w-5 mr-2" />
                )}
                {justAdded ? 'Added!' : 'Add to Cart'}
              </Button>
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
