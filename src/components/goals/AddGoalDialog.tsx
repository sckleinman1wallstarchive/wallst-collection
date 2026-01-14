import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Upload, Search } from 'lucide-react';
import { CreateGoalInput } from '@/hooks/useGoals';
import { supabase } from '@/integrations/supabase/client';

interface AddGoalDialogProps {
  onAddGoal: (goal: CreateGoalInput) => void;
  isLoading?: boolean;
}

export const AddGoalDialog = ({ onAddGoal, isLoading }: AddGoalDialogProps) => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [owner, setOwner] = useState<'Parker' | 'Spencer' | 'WSC'>('WSC');
  const [imageOption, setImageOption] = useState<'none' | 'search' | 'upload'>('none');
  const [artStyle, setArtStyle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !timeframe.trim()) return;

    onAddGoal({
      description: description.trim(),
      timeframe: timeframe.trim(),
      owner,
      image_url: imageUrl || null,
      art_style: artStyle || null,
    });

    // Reset form
    setDescription('');
    setTimeframe('');
    setOwner('WSC');
    setImageOption('none');
    setArtStyle('');
    setImageUrl('');
    setOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `goal-${Date.now()}.${fileExt}`;
      const filePath = `goals/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('inventory-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('inventory-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl.publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className="p-6 rounded-lg cursor-pointer transition-all duration-200 
            bg-[hsl(266,4%,20.8%)] hover:bg-[hsl(266,4%,25%)]
            border-2 border-dashed border-white/20 hover:border-[#c9b99a]/50
            flex flex-col items-center justify-center min-h-[140px]"
        >
          <Plus className="h-8 w-8 text-white/50 mb-2" />
          <span className="text-white/70 font-medium">Add Goal</span>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-black border-[#c9b99a]/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Add New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/80">Goal Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Source $50k worth of clothes this year"
              className="bg-[hsl(266,4%,20.8%)] border-white/20 text-white placeholder:text-white/40 resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe" className="text-white/80">Timeframe</Label>
            <Input
              id="timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder="e.g., 2025, Q1 2025, January 2025"
              className="bg-[hsl(266,4%,20.8%)] border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Owner</Label>
            <Select value={owner} onValueChange={(v) => setOwner(v as typeof owner)}>
              <SelectTrigger className="bg-[hsl(266,4%,20.8%)] border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(266,4%,20.8%)] border-white/20">
                <SelectItem value="Parker" className="text-white hover:bg-white/10">Parker</SelectItem>
                <SelectItem value="Spencer" className="text-white hover:bg-white/10">Spencer</SelectItem>
                <SelectItem value="WSC" className="text-white hover:bg-white/10">WSC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-white/80">Image for Summary (Optional)</Label>
            <RadioGroup
              value={imageOption}
              onValueChange={(v) => setImageOption(v as typeof imageOption)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" className="border-white/50 text-[#c9b99a]" />
                <Label htmlFor="none" className="text-white/70 text-sm cursor-pointer">None</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="search" id="search" className="border-white/50 text-[#c9b99a]" />
                <Label htmlFor="search" className="text-white/70 text-sm cursor-pointer">Art Style</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="upload" className="border-white/50 text-[#c9b99a]" />
                <Label htmlFor="upload" className="text-white/70 text-sm cursor-pointer">Upload</Label>
              </div>
            </RadioGroup>

            {imageOption === 'search' && (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-white/40" />
                <Input
                  value={artStyle}
                  onChange={(e) => setArtStyle(e.target.value)}
                  placeholder="e.g., minimalist, Basquiat-inspired"
                  className="bg-[hsl(266,4%,20.8%)] border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            )}

            {imageOption === 'upload' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    className="bg-transparent border-white/20 text-white hover:bg-white/10"
                    onClick={() => document.getElementById('goal-image-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Choose Image'}
                  </Button>
                  <input
                    id="goal-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                {imageUrl && (
                  <div className="relative w-20 h-20 rounded overflow-hidden">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!description.trim() || !timeframe.trim() || isLoading}
              className="bg-[#c9b99a] text-black hover:bg-[#d4c4b0]"
            >
              Add Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
