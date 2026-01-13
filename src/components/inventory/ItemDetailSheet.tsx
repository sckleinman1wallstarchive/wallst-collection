import React, { useState, useRef, DragEvent } from 'react';
import { InventoryItem } from '@/hooks/useSupabaseInventory';
import { Database } from '@/integrations/supabase/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, DollarSign, Save, ImagePlus, X, Loader2, ArrowRightLeft, CalendarCheck, AlertTriangle, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PlatformMultiSelect } from './PlatformMultiSelect';
import { cn } from '@/lib/utils';

type ItemStatus = Database['public']['Enums']['item_status'];

interface ItemDetailSheetProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<InventoryItem>) => void;
  onDelete: (id: string) => void;
  onSell: (item: InventoryItem) => void;
  onTrade?: (item: InventoryItem) => void;
  allItems?: InventoryItem[];
  startInEditMode?: boolean;
}

const statuses: { value: ItemStatus; label: string }[] = [
  { value: 'in-closet-parker', label: 'In Closet (Parker)' },
  { value: 'in-closet-spencer', label: 'In Closet (Spencer)' },
  { value: 'listed', label: 'For Sale' },
  { value: 'otw', label: 'OTW' },
  
  { value: 'refunded', label: 'Refunded' },
  { value: 'scammed', label: 'Scammed' },
];
export function ItemDetailSheet({ item, open, onOpenChange, onUpdate, onDelete, onSell, onTrade, allItems = [], startInEditMode = false }: ItemDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<InventoryItem>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [isAddingAttention, setIsAddingAttention] = useState(false);
  const [newAttentionNote, setNewAttentionNote] = useState('');

  // Auto-start edit mode when requested
  React.useEffect(() => {
    if (open && startInEditMode && item && !hasAutoStarted && item.status !== 'sold' && item.status !== 'traded') {
      setEditData({
        name: item.name,
        size: item.size,
        acquisitionCost: item.acquisitionCost,
        askingPrice: item.askingPrice,
        lowestAcceptablePrice: item.lowestAcceptablePrice,
        status: item.status,
        platforms: item.platforms || [],
        notes: item.notes,
        imageUrl: item.imageUrl,
        inConvention: item.inConvention,
      });
      setIsEditing(true);
      setHasAutoStarted(true);
    }
    if (!open) {
      setHasAutoStarted(false);
    }
  }, [open, startInEditMode, item, hasAutoStarted]);

  if (!item) return null;

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('inventory-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('inventory-images')
        .getPublicUrl(filePath);

      if (isEditing) {
        setEditData({ ...editData, imageUrl: publicUrl });
      } else {
        onUpdate(item.id, { imageUrl: publicUrl });
      }
      toast.success('Image uploaded');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleEdit = () => {
    setEditData({
      name: item.name,
      size: item.size,
      acquisitionCost: item.acquisitionCost,
      askingPrice: item.askingPrice,
      lowestAcceptablePrice: item.lowestAcceptablePrice,
      status: item.status,
      platforms: item.platforms || [],
      notes: item.notes,
      imageUrl: item.imageUrl,
      inConvention: item.inConvention,
      attentionNote: item.attentionNote,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(item.id, editData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this item?')) {
      onDelete(item.id);
      onOpenChange(false);
    }
  };

  const handleConventionToggle = () => {
    onUpdate(item.id, { inConvention: !item.inConvention });
  };

  const handleSaveAttentionNote = () => {
    onUpdate(item.id, { attentionNote: newAttentionNote || null });
    setIsAddingAttention(false);
    setNewAttentionNote('');
    if (newAttentionNote) toast.success('Issue flagged');
  };

  const handleClearAttention = () => {
    onUpdate(item.id, { attentionNote: null });
    toast.success('Issue resolved');
  };

  const profit = (item.askingPrice || 0) - item.acquisitionCost;
  const margin = (item.askingPrice || 0) > 0 ? ((profit / (item.askingPrice || 1)) * 100).toFixed(0) : '0';
  const isLostItem = ['scammed', 'refunded'].includes(item.status);
  const isTradedItem = item.status === 'traded';
  const currentImageUrl = isEditing ? editData.imageUrl : item.imageUrl;

  // Get traded item info
  const tradedForItem = isTradedItem && item.tradedForItemId 
    ? allItems.find(i => i.id === item.tradedForItemId) 
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Item Details</SheetTitle>
        </SheetHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {item.status === 'sold' ? (
          <div className="mt-6 space-y-4">
            {item.imageUrl && (
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-48 object-cover rounded-lg border border-border"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              {item.size && <p className="text-sm text-muted-foreground">Size {item.size}</p>}
            </div>
            <Badge className="bg-chart-2/20 text-chart-2">Sold</Badge>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="font-mono font-semibold">${item.acquisitionCost}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sale Price</p>
                <p className="font-mono font-semibold">${item.salePrice}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Profit</p>
                <p className="font-mono font-semibold text-chart-2">+${(item.salePrice || 0) - item.acquisitionCost}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date Sold</p>
                <p className="font-medium">{item.dateSold}</p>
              </div>
            </div>
            {item.notes && (
              <div>
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm">{item.notes}</p>
              </div>
            )}

            <div className="space-y-2">
              {/* Tag sold items as convention sales for analytics */}
              <Button
                variant={item.everInConvention ? 'secondary' : 'outline'}
                className="w-full"
                onClick={() => {
                  if (item.everInConvention) {
                    // Already tagged - confirm before removing (rare case)
                    if (!window.confirm('Remove from convention analytics? This sale won\'t count in Got Sole stats.')) return;
                    onUpdate(item.id, { everInConvention: false, inConvention: false });
                  } else {
                    onUpdate(item.id, { everInConvention: true });
                    toast.success('Tagged as convention sale');
                  }
                }}
              >
                <CalendarCheck className="h-4 w-4 mr-2" />
                {item.everInConvention ? 'Convention Sale ✓' : 'Tag as Convention Sale'}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (!window.confirm('Mark this item as unsold? This will clear sale price and date sold.')) return;
                  onUpdate(item.id, {
                    status: 'listed',
                    salePrice: null,
                    platformSold: null,
                    dateSold: null,
                  });
                }}
              >
                Mark Unsold
              </Button>
            </div>
          </div>
        ) : isTradedItem ? (
          <div className="mt-6 space-y-4">
            {item.imageUrl && (
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-48 object-cover rounded-lg border border-border"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              {item.size && <p className="text-sm text-muted-foreground">Size {item.size}</p>}
            </div>
            <Badge className="bg-chart-4/20 text-chart-4">Traded</Badge>
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Original Cost</p>
                <p className="font-mono font-semibold">${item.acquisitionCost}</p>
              </div>
              {tradedForItem && (
                <div>
                  <p className="text-xs text-muted-foreground">Traded For</p>
                  <p className="font-medium">{tradedForItem.name}</p>
                </div>
              )}
              {item.tradeCashDifference !== null && item.tradeCashDifference !== 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Cash Difference</p>
                  <p className={`font-mono font-semibold ${item.tradeCashDifference > 0 ? 'text-destructive' : 'text-chart-2'}`}>
                    {item.tradeCashDifference > 0 ? `You paid $${item.tradeCashDifference}` : `You received $${Math.abs(item.tradeCashDifference)}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : isEditing ? (
          <div className="mt-6 space-y-4">
            <div>
              <Label>Photo</Label>
              {currentImageUrl ? (
                <div className="relative group mt-1">
                  <img 
                    src={currentImageUrl} 
                    alt="Item" 
                    className="w-full h-40 object-cover rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setEditData({ ...editData, imageUrl: null })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  disabled={isUploading}
                  className={cn(
                    "w-full h-32 mt-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50",
                    isDragging 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                      <span className="text-sm text-muted-foreground">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className={cn("h-6 w-6", isDragging ? "text-primary" : "text-muted-foreground")} />
                      <span className={cn("text-sm", isDragging ? "text-primary" : "text-muted-foreground")}>
                        {isDragging ? "Drop image here" : "Add Photo"}
                      </span>
                      <span className="text-xs text-muted-foreground">Click or drag & drop</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div>
              <Label>Item Name</Label>
              <Input value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
            </div>
            <div>
              <Label>Size</Label>
              <Input value={editData.size || ''} onChange={(e) => setEditData({ ...editData, size: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Cost</Label>
                <Input type="number" value={editData.acquisitionCost || ''} onChange={(e) => setEditData({ ...editData, acquisitionCost: parseFloat(e.target.value) })} />
              </div>
              <div>
                <Label>Asking</Label>
                <Input type="number" value={editData.askingPrice || ''} onChange={(e) => setEditData({ ...editData, askingPrice: parseFloat(e.target.value) })} />
              </div>
              <div>
                <Label>Floor</Label>
                <Input type="number" value={editData.lowestAcceptablePrice || ''} onChange={(e) => setEditData({ ...editData, lowestAcceptablePrice: parseFloat(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editData.status} onValueChange={(value: ItemStatus) => setEditData({ ...editData, status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <PlatformMultiSelect
              value={editData.platforms || []}
              onChange={(platforms) => setEditData({ ...editData, platforms })}
            />
            <div>
              <Label>Notes</Label>
              <Textarea value={editData.notes || ''} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows={3} placeholder="General notes about this item..." />
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                Quick Flag (optional)
              </Label>
              <Input 
                value={editData.attentionNote || ''} 
                onChange={(e) => setEditData({ ...editData, attentionNote: e.target.value })} 
                placeholder="e.g., fake, needs refund"
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1"><Save className="h-4 w-4 mr-2" />Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-48 object-cover rounded-lg border border-border"
              />
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                disabled={isUploading}
                className={cn(
                  "w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50",
                  isDragging 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                    <span className="text-sm text-muted-foreground">Uploading...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className={cn("h-6 w-6", isDragging ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("text-sm", isDragging ? "text-primary" : "text-muted-foreground")}>
                      {isDragging ? "Drop image here" : "Add Photo"}
                    </span>
                    <span className="text-xs text-muted-foreground">Click or drag & drop</span>
                  </>
                )}
              </button>
            )}

            <div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <div className="flex gap-2 mt-2 flex-wrap">
                {item.size && <Badge variant="outline">Size {item.size}</Badge>}
                <Badge variant="outline" className="capitalize">{item.status.replace(/-/g, ' ')}</Badge>
                {item.inConvention && (
                  <Badge className="bg-primary/10 text-primary">
                    <CalendarCheck className="h-3 w-3 mr-1" />
                    Convention
                  </Badge>
                )}
              </div>
            </div>

            {!isLostItem && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="font-mono text-lg font-semibold">${item.acquisitionCost}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Asking</p>
                    <p className="font-mono text-lg font-semibold">${item.askingPrice || 0}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Floor</p>
                    <p className="font-mono text-lg font-semibold">${item.lowestAcceptablePrice || 0}</p>
                  </div>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Potential Profit</p>
                      <p className="font-mono text-xl font-semibold">${profit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Target Margin</p>
                      <p className="font-mono text-xl font-semibold">{margin}%</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {isLostItem && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">Lost ${item.acquisitionCost} - {item.status}</p>
              </div>
            )}

            {item.notes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm bg-muted p-3 rounded-lg">{item.notes}</p>
              </div>
            )}

            {/* Attention Note Section */}
            {item.attentionNote ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Flagged</p>
                    <p className="text-sm text-muted-foreground italic">"{item.attentionNote}"</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 text-chart-2 hover:text-chart-2 flex-shrink-0"
                    onClick={handleClearAttention}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Resolve
                  </Button>
                </div>
              </div>
            ) : isAddingAttention ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Flag Issue</span>
                </div>
                <Input
                  value={newAttentionNote}
                  onChange={(e) => setNewAttentionNote(e.target.value)}
                  placeholder="e.g., fake, needs refund"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveAttentionNote();
                    if (e.key === 'Escape') {
                      setIsAddingAttention(false);
                      setNewAttentionNote('');
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveAttentionNote} disabled={!newAttentionNote.trim()}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    setIsAddingAttention(false);
                    setNewAttentionNote('');
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                onClick={() => setIsAddingAttention(true)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Flag Issue
              </Button>
            )}

            {/* Convention Toggle */}
            <Button 
              variant={item.inConvention ? "secondary" : "outline"} 
              className="w-full"
              onClick={handleConventionToggle}
            >
              <CalendarCheck className="h-4 w-4 mr-2" />
              {item.inConvention ? 'Remove from Convention' : 'Add to Convention'}
            </Button>

            <div className="flex gap-3 pt-4 border-t border-border">
              {!isLostItem && (
                <>
                  <Button onClick={() => onSell(item)} className="flex-1">
                    <DollarSign className="h-4 w-4 mr-2" />Record Sale
                  </Button>
                  {onTrade && (
                    <Button variant="outline" onClick={() => onTrade(item)}>
                      <ArrowRightLeft className="h-4 w-4 mr-2" />Trade
                    </Button>
                  )}
                </>
              )}
              <Button variant="outline" onClick={handleEdit}>Edit</Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
