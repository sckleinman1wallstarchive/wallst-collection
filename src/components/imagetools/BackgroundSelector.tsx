import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check, Sparkles, Eraser } from 'lucide-react';

export type BackgroundType = 'transparent' | 'solid';
export type ProcessorType = 'removebg' | 'lovable-ai';

export interface BackgroundOptions {
  type: BackgroundType;
  color?: string;
}

interface BackgroundSelectorProps {
  value: BackgroundOptions;
  onChange: (options: BackgroundOptions) => void;
  processorType: ProcessorType;
  onProcessorChange: (processor: ProcessorType) => void;
}

const PRESET_COLORS = [
  { name: 'White', hex: '#FFFFFF', prominent: true },
  { name: 'Black', hex: '#000000', prominent: true },
  { name: 'Red', hex: '#E91E63' },
  { name: 'Pink', hex: '#EC407A' },
  { name: 'Purple', hex: '#9C27B0' },
  { name: 'Deep Purple', hex: '#7C4DFF' },
  { name: 'Indigo', hex: '#3F51B5' },
  { name: 'Blue', hex: '#2196F3' },
  { name: 'Light Blue', hex: '#03A9F4' },
  { name: 'Cyan', hex: '#00BCD4' },
  { name: 'Teal', hex: '#009688' },
  { name: 'Green', hex: '#4CAF50' },
  { name: 'Light Green', hex: '#8BC34A' },
  { name: 'Yellow', hex: '#FFEB3B' },
  { name: 'Amber', hex: '#FFC107' },
  { name: 'Orange', hex: '#FF9800' },
  { name: 'Deep Orange', hex: '#FF5722' },
];

export function BackgroundSelector({ value, onChange, processorType, onProcessorChange }: BackgroundSelectorProps) {
  const [customColor, setCustomColor] = useState(value.color || '#FFFFFF');

  const handleTypeChange = (type: BackgroundType) => {
    if (type === 'transparent') {
      onChange({ type });
    } else if (type === 'solid') {
      onChange({ type, color: value.color || '#FFFFFF' });
    }
  };

  const handleColorChange = (hex: string) => {
    setCustomColor(hex);
    onChange({ type: 'solid', color: hex });
  };

  const prominentColors = PRESET_COLORS.filter(c => c.prominent);
  const otherColors = PRESET_COLORS.filter(c => !c.prominent);

  return (
    <div className="space-y-6">
      {/* Processor Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Processor</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onProcessorChange('removebg')}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              processorType === 'removebg'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/50'
            )}
          >
            <Eraser className={cn('h-6 w-6', processorType === 'removebg' ? 'text-primary' : 'text-muted-foreground')} />
            <span className="font-medium text-sm">remove.bg</span>
            <span className="text-xs text-muted-foreground text-center">
              Complex background extraction
            </span>
          </button>
          <button
            type="button"
            onClick={() => onProcessorChange('lovable-ai')}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              processorType === 'lovable-ai'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/50'
            )}
          >
            <Sparkles className={cn('h-6 w-6', processorType === 'lovable-ai' ? 'text-primary' : 'text-muted-foreground')} />
            <span className="font-medium text-sm">Lovable AI</span>
            <span className="text-xs text-muted-foreground text-center">
              Backdrop color swaps
            </span>
          </button>
        </div>
      </div>

      {/* Background Options */}
      <Label className="text-sm font-medium">Background Options</Label>
      
      {/* Mode Selector */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={value.type === 'transparent' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeChange('transparent')}
          className="flex-1"
        >
          Transparent
        </Button>
        <Button
          type="button"
          variant={value.type === 'solid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeChange('solid')}
          className="flex-1"
        >
          Solid Color
        </Button>
      </div>

      {/* Transparent Preview */}
      {value.type === 'transparent' && (
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-md border border-border"
              style={{
                backgroundImage: 'linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)',
                backgroundSize: '10px 10px',
                backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
              }}
            />
            <span className="text-sm text-muted-foreground">Transparent background (PNG)</span>
          </div>
        </div>
      )}

      {/* Solid Color Options */}
      {value.type === 'solid' && (
        <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
          {/* Prominent Colors (White & Black) */}
          <div className="flex gap-3 justify-center">
            {prominentColors.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => handleColorChange(color.hex)}
                className={cn(
                  'w-14 h-14 rounded-lg border-2 transition-all relative',
                  value.color === color.hex 
                    ? 'border-primary ring-2 ring-primary/20 scale-110' 
                    : 'border-border hover:border-muted-foreground/50 hover:scale-105'
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {value.color === color.hex && (
                  <Check 
                    className={cn(
                      'absolute inset-0 m-auto h-6 w-6',
                      color.hex === '#FFFFFF' ? 'text-black' : 'text-white'
                    )} 
                  />
                )}
              </button>
            ))}
          </div>

          {/* Other Preset Colors */}
          <div className="grid grid-cols-8 gap-2">
            {otherColors.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => handleColorChange(color.hex)}
                className={cn(
                  'w-8 h-8 rounded-md border transition-all relative',
                  value.color === color.hex 
                    ? 'border-primary ring-2 ring-primary/20 scale-110' 
                    : 'border-border/50 hover:border-muted-foreground/50 hover:scale-105'
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {value.color === color.hex && (
                  <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
                )}
              </button>
            ))}
          </div>

          {/* Custom Color Picker */}
          <div className="flex items-center gap-3 pt-2 border-t border-border/50">
            <Label className="text-xs text-muted-foreground">Custom:</Label>
            <div className="relative">
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-border overflow-hidden"
                style={{ padding: 0 }}
              />
            </div>
            <Input
              type="text"
              value={customColor.toUpperCase()}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                  setCustomColor(val);
                  if (val.length === 7) {
                    onChange({ type: 'solid', color: val });
                  }
                }
              }}
              className="w-24 h-8 text-xs font-mono"
              placeholder="#FFFFFF"
            />
            <div 
              className="w-8 h-8 rounded-md border border-border flex-shrink-0"
              style={{ backgroundColor: value.color || '#FFFFFF' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
