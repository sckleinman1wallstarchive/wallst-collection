import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Pencil, RotateCcw, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ListingDescriptionGeneratorProps {
  itemName: string;
  size?: string;
  onDescriptionChange?: (description: string) => void;
}

const generateDefaultDescription = (name: string, size?: string): string => {
  const lines = [
    name,
    '',
    '',
    size ? `Size: ${size}` : 'Size: [Add size]',
    '',
    '',
    'Send Offers/Trades',
    '',
    '',
    'Hit Me Up For A Better Price On IG At Wall Street Archive',
  ];
  return lines.join('\n');
};

export function ListingDescriptionGenerator({ 
  itemName, 
  size, 
  onDescriptionChange 
}: ListingDescriptionGeneratorProps) {
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate default on mount or when item changes
  useEffect(() => {
    const defaultDesc = generateDefaultDescription(itemName, size);
    setDescription(defaultDesc);
    onDescriptionChange?.(defaultDesc);
  }, [itemName, size]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(description);
      setCopied(true);
      toast.success('Description copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleReset = () => {
    const defaultDesc = generateDefaultDescription(itemName, size);
    setDescription(defaultDesc);
    onDescriptionChange?.(defaultDesc);
    toast.success('Reset to default');
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    onDescriptionChange?.(value);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Listing Description</Label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Pencil className="h-3 w-3 mr-1" />
            {isEditing ? 'Done' : 'Edit'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={handleReset}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-7 px-2"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3 mr-1" />
            ) : (
              <Copy className="h-3 w-3 mr-1" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>
      
      {isEditing ? (
        <Textarea
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={10}
          className="font-mono text-sm"
          placeholder="Enter listing description..."
        />
      ) : (
        <div 
          className="bg-muted/50 border border-border rounded-md p-3 text-sm whitespace-pre-wrap font-mono cursor-pointer hover:bg-muted transition-colors"
          onClick={handleCopy}
          title="Click to copy"
        >
          {description}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Click description or Copy button to copy. Drag images above to paste directly into listings.
      </p>
    </div>
  );
}
