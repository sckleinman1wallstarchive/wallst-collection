import { useState } from 'react';
import { Check, Copy, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

const PLATFORM_SELL_URLS: Record<string, string> = {
  Grailed: 'https://www.grailed.com/sell',
  Depop: 'https://www.depop.com/products/create/',
  eBay: 'https://www.ebay.com/sl/sell',
  Mercari: 'https://www.mercari.com/sell/',
  Vinted: 'https://www.vinted.com/items/new',
};

export interface PlatformListing {
  platform: string;
  title: string;
  description: string;
  price: number;
  hashtags?: string[];
  characterLimit?: { title: number; description?: number };
  fee: string;
  color: string;
}

interface PlatformListingCardProps {
  listing: PlatformListing;
  onUpdate: (updates: Partial<PlatformListing>) => void;
}

export function PlatformListingCard({ listing, onUpdate }: PlatformListingCardProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const getFullListing = () => {
    return `${listing.title}\n\n${listing.description}${
      listing.hashtags?.length ? `\n\n${listing.hashtags.join(' ')}` : ''
    }`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getFullListing());
    setCopied(true);
    toast.success(`${listing.platform} listing copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAndOpen = async () => {
    await navigator.clipboard.writeText(getFullListing());
    const sellUrl = PLATFORM_SELL_URLS[listing.platform];
    if (sellUrl) {
      window.open(sellUrl, '_blank');
    }
    toast.success(`${listing.platform} listing copied! Opening sell page...`);
  };

  const titleLength = listing.title.length;
  const titleLimit = listing.characterLimit?.title || 100;
  const isOverLimit = titleLength > titleLimit;

  return (
    <Card className="border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className="text-xs font-semibold"
                style={{ backgroundColor: listing.color, color: 'white' }}
              >
                {listing.platform}
              </Badge>
              <span className="text-sm text-muted-foreground">{listing.fee} fee</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleCopyAndOpen}
                className="gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Copy & Open
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                Copy
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`title-${listing.platform}`}>Title</Label>
                <span className={`text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {titleLength}/{titleLimit}
                </span>
              </div>
              <Input
                id={`title-${listing.platform}`}
                value={listing.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className={isOverLimit ? 'border-destructive' : ''}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`price-${listing.platform}`}>Price</Label>
              </div>
              <Input
                id={`price-${listing.platform}`}
                type="number"
                value={listing.price}
                onChange={(e) => onUpdate({ price: Number(e.target.value) })}
                className="w-32"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`desc-${listing.platform}`}>Description</Label>
              <Textarea
                id={`desc-${listing.platform}`}
                value={listing.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                rows={6}
                className="resize-none"
              />
            </div>

            {listing.hashtags && listing.hashtags.length > 0 && (
              <div className="space-y-2">
                <Label>Hashtags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {listing.hashtags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
