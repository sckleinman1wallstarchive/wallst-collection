import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Upload, Search } from 'lucide-react';
import { Goal, UpdateGoalInput } from '@/hooks/useGoals';
import { supabase } from '@/integrations/supabase/client';

interface EditGoalDialogProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateGoal: (goal: UpdateGoalInput) => void;
  isLoading?: boolean;
}

export const EditGoalDialog = ({ goal, open, onOpenChange, onUpdateGoal, isLoading }: EditGoalDialogProps) => {
  const [description, setDescription] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [owner, setOwner] = useState<'Parker' | 'Spencer' | 'WSC'>('WSC');
  const [imageOption, setImageOption] = useState<'none' | 'search' | 'upload'>('none');
  const [artStyle, setArtStyle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Metric goal fields
  const [goalType, setGoalType] = useState<'standard' | 'metric'>('standard');
  const [metricType, setMetricType] = useState<string>('');
  const [metricTarget, setMetricTarget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (goal) {
      setDescription(goal.description);
      setTimeframe(goal.timeframe);
      setOwner(goal.owner);
      setImageUrl(goal.image_url || '');
      setArtStyle(goal.art_style || '');
      setImageOption(goal.image_url ? 'upload' : goal.art_style ? 'search' : 'none');
      setGoalType(goal.goal_type || 'standard');
      setMetricType(goal.metric_type || '');
      setMetricTarget(goal.metric_target?.toString() || '');
      setStartDate(goal.start_date || '');
      setEndDate(goal.end_date || '');
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !description.trim() || !timeframe.trim()) return;

    const updates: UpdateGoalInput = {
      id: goal.id,
      description: description.trim(),
      timeframe: timeframe.trim(),
      owner,
      image_url: imageUrl || null,
      art_style: artStyle || null,
      goal_type: goalType,
      metric_type: goalType === 'metric' ? metricType : null,
      metric_target: goalType === 'metric' && metricTarget ? parseFloat(metricTarget) : null,
      start_date: goalType === 'metric' && startDate ? startDate : null,
      end_date: goalType === 'metric' && endDate ? endDate : null,
    };

    onUpdateGoal(updates);
    onOpenChange(false);
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

  const metricTypeOptions = [
    { value: 'inventory_cost', label: 'Inventory Sourced ($)' },
    { value: 'revenue', label: 'Revenue ($)' },
    { value: 'profit', label: 'Profit ($)' },
    { value: 'items_sold', label: 'Items Sold' },
    { value: 'items_sourced', label: 'Items Sourced' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-[#c9b99a]/30 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Edit Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Goal Type Toggle */}
          <div className="space-y-2">
            <Label className="text-white/80">Goal Type</Label>
            <RadioGroup
              value={goalType}
              onValueChange={(v) => setGoalType(v as 'standard' | 'metric')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="edit-standard" className="border-white/50 text-[#c9b99a]" />
                <Label htmlFor="edit-standard" className="text-white/70 text-sm cursor-pointer">Standard</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="metric" id="edit-metric" className="border-white/50 text-[#c9b99a]" />
                <Label htmlFor="edit-metric" className="text-white/70 text-sm cursor-pointer">Metric</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-white/80">Goal Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Source $50k worth of clothes this year"
              className="bg-[hsl(266,4%,20.8%)] border-white/20 text-white placeholder:text-white/40 resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-timeframe" className="text-white/80">Timeframe</Label>
            <Input
              id="edit-timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder="e.g., 2025, Q1 2025, January 2025"
              className="bg-[hsl(266,4%,20.8%)] border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          {/* Metric Goal Fields */}
          {goalType === 'metric' && (
            <>
              <div className="space-y-2">
                <Label className="text-white/80">Metric Type</Label>
                <Select value={metricType} onValueChange={setMetricType}>
                  <SelectTrigger className="bg-[hsl(266,4%,20.8%)] border-white/20 text-white">
                    <SelectValue placeholder="Select metric..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(266,4%,20.8%)] border-white/20">
                    {metricTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-white/10">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-metric-target" className="text-white/80">Target</Label>
                <Input
                  id="edit-metric-target"
                  type="number"
                  value={metricTarget}
                  onChange={(e) => setMetricTarget(e.target.value)}
                  placeholder="e.g., 50000"
                  className="bg-[hsl(266,4%,20.8%)] border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-start-date" className="text-white/80">Start Date</Label>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-[hsl(266,4%,20.8%)] border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-end-date" className="text-white/80">End Date</Label>
                  <Input
                    id="edit-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-[hsl(266,4%,20.8%)] border-white/20 text-white"
                  />
                </div>
              </div>
            </>
          )}

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
                <RadioGroupItem value="none" id="edit-none" className="border-white/50 text-[#c9b99a]" />
                <Label htmlFor="edit-none" className="text-white/70 text-sm cursor-pointer">None</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="search" id="edit-search" className="border-white/50 text-[#c9b99a]" />
                <Label htmlFor="edit-search" className="text-white/70 text-sm cursor-pointer">Art Style</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="edit-upload" className="border-white/50 text-[#c9b99a]" />
                <Label htmlFor="edit-upload" className="text-white/70 text-sm cursor-pointer">Upload</Label>
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
                    onClick={() => document.getElementById('edit-goal-image-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Choose Image'}
                  </Button>
                  <input
                    id="edit-goal-image-upload"
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
              onClick={() => onOpenChange(false)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!description.trim() || !timeframe.trim() || isLoading}
              className="bg-[#c9b99a] text-black hover:bg-[#d4c4b0]"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
