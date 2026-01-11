import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const PLATFORMS = [
  { value: 'grailed', label: 'Grailed' },
  { value: 'depop', label: 'Depop' },
  { value: 'poshmark', label: 'Poshmark' },
  { value: 'ebay', label: 'eBay' },
  { value: 'vinted', label: 'Vinted' },
  { value: 'mercari', label: 'Mercari' },
] as const;

interface PlatformMultiSelectProps {
  value: string[];
  onChange: (platforms: string[]) => void;
  className?: string;
}

export function PlatformMultiSelect({ value, onChange, className }: PlatformMultiSelectProps) {
  const handleToggle = (platform: string) => {
    if (value.includes(platform)) {
      onChange(value.filter(p => p !== platform));
    } else {
      onChange([...value, platform]);
    }
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium mb-2 block">Listed On</Label>
      <div className="grid grid-cols-2 gap-2">
        {PLATFORMS.map((platform) => (
          <div key={platform.value} className="flex items-center space-x-2">
            <Checkbox
              id={`platform-${platform.value}`}
              checked={value.includes(platform.value)}
              onCheckedChange={() => handleToggle(platform.value)}
            />
            <Label
              htmlFor={`platform-${platform.value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {platform.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
