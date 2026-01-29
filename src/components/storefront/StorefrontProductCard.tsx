import { useState } from 'react';
import { PublicInventoryItem } from '@/hooks/usePublicInventory';
import { useShopCartStore } from '@/stores/shopCartStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Loader2, GripVertical } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StorefrontProductCardProps {
  item: PublicInventoryItem;
  onClick?: () => void;
  isEditMode?: boolean;
}

const CATEGORIES = ['footwear', 'tops', 'bottoms', 'outerwear', 'accessories', 'bags', 'belt', 'sweater', 'jacket', 'other'];

export function StorefrontProductCard({ item, onClick, isEditMode = false }: StorefrontProductCardProps) {
  const addItem = useShopCartStore(state => state.addItem);
  const queryClient = useQueryClient();
  const { ref: scrollRef, isVisible } = useScrollAnimation();
  
  const [editedDescription, setEditedDescription] = useState(item.notes || '');
  const [editedSize, setEditedSize] = useState(item.size || '');
  const [editedCategory, setEditedCategory] = useState(item.category || 'other');
  const [saving, setSaving] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isEditMode });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  const firstImage = item.imageUrls?.[0] || item.imageUrl;
  const price = item.askingPrice;
  const isSold = item.status === 'sold';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSold || !price) return;
    
    addItem(item);
    toast.success('Added to cart', {
      description: item.name,
      position: 'top-center'
    });
  };

  const handleSaveChanges = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Combine refs
  const combinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    if (scrollRef && typeof scrollRef === 'object' && 'current' in scrollRef) {
      (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  return (
    <div 
      ref={combinedRef}
      style={sortableStyle}
      className={`space-y-2 transition-all duration-500 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-6'
      }`}
    >
      <Card 
        className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg relative bg-card border-border"
        onClick={onClick}
      >
        {/* Grip handle for edit mode */}
        {isEditMode && (
          <div 
            className="absolute top-2 left-2 z-10"
            {...attributes}
            {...listeners}
          >
            <Button
              size="icon"
              variant="secondary"
              className="h-7 w-7 cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="relative overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage}
              alt={item.name}
              className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="aspect-square flex items-center justify-center bg-muted text-muted-foreground">
              No image
            </div>
          )}
          
          {isSold && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-xl font-bold tracking-wider">SOLD</span>
            </div>
          )}
        </div>
        
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground truncate">
                {item.brand || 'Unknown Brand'}
              </p>
              <h3 className="font-medium truncate">{item.name}</h3>
            </div>
            <p className="text-lg font-semibold shrink-0">
              {price ? `$${price.toFixed(0)}` : 'TBD'}
            </p>
          </div>
          
          <Button 
            variant={isSold ? 'secondary' : 'default'}
            size="sm" 
            className="w-full gap-2"
            onClick={handleAddToCart}
            disabled={isSold || !price}
          >
            <ShoppingCart className="h-4 w-4" />
            {isSold ? 'Sold Out' : 'Add to Cart'}
          </Button>
        </CardContent>
      </Card>

      {isEditMode && (
        <div 
          className="border-2 border-dashed border-primary/30 rounded-lg p-3 space-y-3 bg-card"
          onClick={(e) => e.stopPropagation()}
        >
          <Textarea
            placeholder="Add description..."
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            rows={2}
            className="text-sm"
          />
          
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Size"
              value={editedSize}
              onChange={(e) => setEditedSize(e.target.value)}
              className="text-sm"
            />
            <Select value={editedCategory} onValueChange={setEditedCategory}>
              <SelectTrigger className="text-sm">
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

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
