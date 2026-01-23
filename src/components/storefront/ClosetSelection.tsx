import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Pencil, Loader2, GripVertical } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
interface ClosetSelectionProps {
  onSelectCloset: (closet: 'parker' | 'spencer') => void;
  isEditMode?: boolean;
}
interface ClosetArt {
  owner: string;
  art_image_url: string | null;
  display_order?: number | null;
}
function SortableClosetCard({
  owner,
  artUrl,
  isEditMode,
  isUploading,
  onSelectCloset,
  onUploadClick
}: {
  owner: 'parker' | 'spencer';
  artUrl: string | null | undefined;
  isEditMode: boolean;
  isUploading: boolean;
  onSelectCloset: (closet: 'parker' | 'spencer') => void;
  onUploadClick: () => void;
}) {
  const hasArt = !!artUrl;
  const label = owner === 'parker' ? "PARKER'S" : "SPENCER'S";
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: owner,
    disabled: !isEditMode
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };
  return <Card ref={setNodeRef} style={style} className="group cursor-pointer overflow-hidden rounded-2xl border-0 transition-all duration-300 relative" onClick={() => !isEditMode && onSelectCloset(owner)}>
      <CardContent className="p-0">
        <div className="aspect-square relative flex items-center justify-center overflow-hidden">
          {/* Background: Art image or solid wine-red */}
          {hasArt ? <img src={artUrl} alt={`${owner}'s closet`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105" style={{
          backgroundColor: 'hsl(0, 45%, 22%)'
        }} />}

          {/* Always visible centered text with strong shadow for readability */}
          <div className="relative z-10 text-center" style={{
          textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.6)'
        }}>
            <h3 className="text-3xl font-light tracking-[0.2em] mb-2 text-[#bc1010]">
              {label}
            </h3>
            <p className="text-xl tracking-[0.25em] text-[#b61111]">
              CLOSET
            </p>
          </div>
          {/* Edit Mode Controls */}
          {isEditMode && <>
              {/* Grip Handle - top left */}
              <div className="absolute top-3 left-3 z-20" {...attributes} {...listeners}>
                <Button size="icon" variant="secondary" className="h-7 w-7 cursor-grab active:cursor-grabbing" onClick={e => e.stopPropagation()}>
                  <GripVertical className="h-4 w-4" />
                </Button>
              </div>

              {/* Upload Button - top right */}
              <div className="absolute top-3 right-3 z-20">
                <Button size="sm" variant="secondary" className="gap-1" onClick={e => {
              e.stopPropagation();
              onUploadClick();
            }} disabled={isUploading}>
                  {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : hasArt ? <Pencil className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
                  {isUploading ? 'Uploading...' : hasArt ? 'Edit' : 'Upload'}
                </Button>
              </div>
            </>}
        </div>
      </CardContent>
    </Card>;
}
export function ClosetSelection({
  onSelectCloset,
  isEditMode = false
}: ClosetSelectionProps) {
  const [uploadingFor, setUploadingFor] = useState<'parker' | 'spencer' | null>(null);
  const parkerInputRef = useRef<HTMLInputElement>(null);
  const spencerInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8
    }
  }));

  // Fetch closet selection art from about_us_content
  const {
    data: closetArt
  } = useQuery({
    queryKey: ['closet-selection-art'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('about_us_content').select('owner, art_image_url, display_order').in('owner', ['parker', 'spencer']).order('display_order');
      if (error) throw error;
      return data as ClosetArt[];
    }
  });
  const parkerArt = closetArt?.find(c => c.owner === 'parker')?.art_image_url;
  const spencerArt = closetArt?.find(c => c.owner === 'spencer')?.art_image_url;

  // Order based on display_order
  const orderedClosets = closetArt?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map(c => c.owner as 'parker' | 'spencer') || ['parker', 'spencer'];
  const uploadMutation = useMutation({
    mutationFn: async ({
      owner,
      file
    }: {
      owner: 'parker' | 'spencer';
      file: File;
    }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `closet-selection/${owner}-${Date.now()}.${fileExt}`;
      const {
        error: uploadError
      } = await supabase.storage.from('inventory-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('inventory-images').getPublicUrl(fileName);

      // Update about_us_content with new art URL
      const {
        error: updateError
      } = await supabase.from('about_us_content').update({
        art_image_url: publicUrl
      }).eq('owner', owner);
      if (updateError) throw updateError;
      return publicUrl;
    },
    onSuccess: (_, {
      owner
    }) => {
      queryClient.invalidateQueries({
        queryKey: ['closet-selection-art']
      });
      toast.success(`${owner.charAt(0).toUpperCase() + owner.slice(1)}'s closet image updated`);
    },
    onError: () => {
      toast.error('Failed to upload image');
    },
    onSettled: () => {
      setUploadingFor(null);
    }
  });
  const reorderMutation = useMutation({
    mutationFn: async (newOrder: ('parker' | 'spencer')[]) => {
      for (let i = 0; i < newOrder.length; i++) {
        const {
          error
        } = await supabase.from('about_us_content').update({
          display_order: i
        } as any).eq('owner', newOrder[i]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['closet-selection-art']
      });
    },
    onError: () => {
      toast.error('Failed to reorder closets');
    }
  });
  const handleFileSelect = (owner: 'parker' | 'spencer', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingFor(owner);
      uploadMutation.mutate({
        owner,
        file
      });
    }
    e.target.value = '';
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const {
      active,
      over
    } = event;
    if (over && active.id !== over.id) {
      const newOrder = [...orderedClosets];
      const oldIndex = newOrder.indexOf(active.id as 'parker' | 'spencer');
      const newIndex = newOrder.indexOf(over.id as 'parker' | 'spencer');
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, active.id as 'parker' | 'spencer');
      reorderMutation.mutate(newOrder);
    }
  };
  const getArtUrl = (owner: 'parker' | 'spencer') => {
    return owner === 'parker' ? parkerArt : spencerArt;
  };
  const getInputRef = (owner: 'parker' | 'spencer') => {
    return owner === 'parker' ? parkerInputRef : spencerInputRef;
  };
  return <div className="min-h-[80vh] bg-black py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-light tracking-wide mb-2 text-white">Personal Collection</h2>
        <p className="text-muted-foreground">Select a closet to explore</p>
      </div>
      
      {/* Hidden file inputs */}
      <input ref={parkerInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect('parker', e)} />
      <input ref={spencerInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect('spencer', e)} />

      {isEditMode ? <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedClosets} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {orderedClosets.map(owner => <SortableClosetCard key={owner} owner={owner} artUrl={getArtUrl(owner)} isEditMode={isEditMode} isUploading={uploadingFor === owner} onSelectCloset={onSelectCloset} onUploadClick={() => getInputRef(owner).current?.click()} />)}
            </div>
          </SortableContext>
        </DndContext> : <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {orderedClosets.map(owner => <SortableClosetCard key={owner} owner={owner} artUrl={getArtUrl(owner)} isEditMode={false} isUploading={false} onSelectCloset={onSelectCloset} onUploadClick={() => {}} />)}
        </div>}
    </div>;
}