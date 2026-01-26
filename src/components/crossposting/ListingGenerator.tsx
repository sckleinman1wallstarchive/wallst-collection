import { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlatformListingCard, PlatformListing } from './PlatformListingCard';
import { InventoryItem } from '@/hooks/useSupabaseInventory';
import { toast } from 'sonner';

interface ListingGeneratorProps {
  item: InventoryItem;
}

type Platform = 'Grailed' | 'Depop' | 'eBay' | 'Mercari' | 'Vinted';

const PLATFORM_CONFIG: Record<Platform, { color: string; fee: string; titleLimit: number }> = {
  Grailed: { color: '#d4af37', fee: '9% + $0.99', titleLimit: 60 },
  Depop: { color: '#ff2300', fee: '10%', titleLimit: 50 },
  eBay: { color: '#0064d2', fee: '~13%', titleLimit: 80 },
  Mercari: { color: '#4dc4e6', fee: '10%', titleLimit: 40 },
  Vinted: { color: '#09b1ba', fee: '5% + $0.70', titleLimit: 50 },
};

function generateGrailedListing(item: InventoryItem): PlatformListing {
  const title = `${item.brand || ''} ${item.name}${item.size ? ` - ${item.size}` : ''}`.trim().slice(0, 60);
  
  const description = `${item.brand || ''} ${item.name}

Size: ${item.size || 'See measurements'}
Condition: Excellent

${item.notes || ''}

Ships within 1-2 business days.
All sales final.`.trim();

  return {
    platform: 'Grailed',
    title,
    description,
    price: item.askingPrice || 0,
    characterLimit: { title: 60 },
    fee: PLATFORM_CONFIG.Grailed.fee,
    color: PLATFORM_CONFIG.Grailed.color,
  };
}

function generateDepopListing(item: InventoryItem): PlatformListing {
  const title = `${item.brand || ''} ${item.name} ✨`.trim().slice(0, 50);
  
  const brandTag = item.brand?.toLowerCase().replace(/\s+/g, '') || 'vintage';
  const categoryTag = item.category?.toLowerCase() || 'fashion';
  
  const description = `${item.brand || ''} ${item.name} 🔥

📏 Size: ${item.size || 'See photos'}
✅ Condition: Excellent

${item.notes || ''}

💫 Ships fast!
📦 Packaged with care`.trim();

  return {
    platform: 'Depop',
    title,
    description,
    price: item.askingPrice || 0,
    hashtags: [`#${brandTag}`, `#${categoryTag}`, '#vintage', '#streetwear', '#designer'],
    characterLimit: { title: 50 },
    fee: PLATFORM_CONFIG.Depop.fee,
    color: PLATFORM_CONFIG.Depop.color,
  };
}

function generateEbayListing(item: InventoryItem): PlatformListing {
  const title = `${item.brand || ''} ${item.name} ${item.size ? `Size ${item.size}` : ''} ${item.category || ''}`.trim().slice(0, 80);
  
  const description = `${item.brand || ''} ${item.name}

DETAILS:
• Brand: ${item.brand || 'N/A'}
• Size: ${item.size || 'See measurements'}
• Category: ${item.category || 'N/A'}
• Condition: Pre-owned - Excellent

DESCRIPTION:
${item.notes || 'Please see photos for detailed condition.'}

SHIPPING:
• Ships within 1-2 business days
• Packaged securely
• Tracking provided

RETURNS:
• All sales final
• Please message with any questions before purchasing

Thank you for looking!`.trim();

  return {
    platform: 'eBay',
    title,
    description,
    price: item.askingPrice || 0,
    characterLimit: { title: 80 },
    fee: PLATFORM_CONFIG.eBay.fee,
    color: PLATFORM_CONFIG.eBay.color,
  };
}

function generateMercariListing(item: InventoryItem): PlatformListing {
  const title = `${item.brand || ''} ${item.name} ${item.size || ''}`.trim().slice(0, 40);
  
  const description = `${item.brand || ''} ${item.name}

• Size: ${item.size || 'See photos'}
• Condition: Excellent
• Authentic

${item.notes || ''}

Ships within 1-2 days!
Feel free to make an offer.`.trim();

  return {
    platform: 'Mercari',
    title,
    description,
    price: item.askingPrice || 0,
    hashtags: [`#${item.brand?.toLowerCase().replace(/\s+/g, '') || 'fashion'}`, `#${item.category || 'clothing'}`, '#designer'],
    characterLimit: { title: 40 },
    fee: PLATFORM_CONFIG.Mercari.fee,
    color: PLATFORM_CONFIG.Mercari.color,
  };
}

function generateVintedListing(item: InventoryItem): PlatformListing {
  const title = `${item.brand || ''} ${item.name}`.trim().slice(0, 50);
  
  const description = `${item.brand || ''} ${item.name}

Size: ${item.size || 'Check measurements in photos'}
Condition: Excellent / Very Good

${item.notes || ''}

Happy to answer any questions!`.trim();

  return {
    platform: 'Vinted',
    title,
    description,
    price: item.askingPrice || 0,
    characterLimit: { title: 50 },
    fee: PLATFORM_CONFIG.Vinted.fee,
    color: PLATFORM_CONFIG.Vinted.color,
  };
}

function generateAllListings(item: InventoryItem): Record<Platform, PlatformListing> {
  return {
    Grailed: generateGrailedListing(item),
    Depop: generateDepopListing(item),
    eBay: generateEbayListing(item),
    Mercari: generateMercariListing(item),
    Vinted: generateVintedListing(item),
  };
}

export function ListingGenerator({ item }: ListingGeneratorProps) {
  const [listings, setListings] = useState<Record<Platform, PlatformListing>>(() => 
    generateAllListings(item)
  );
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    setListings(generateAllListings(item));
  }, [item.id]);

  const handleRegenerate = () => {
    setListings(generateAllListings(item));
    toast.success('Listings regenerated');
  };

  const handleUpdateListing = (platform: Platform, updates: Partial<PlatformListing>) => {
    setListings(prev => ({
      ...prev,
      [platform]: { ...prev[platform], ...updates },
    }));
  };

  const handleCopyAll = async () => {
    const allListings = Object.values(listings)
      .map(l => {
        const hashtags = l.hashtags?.length ? `\n${l.hashtags.join(' ')}` : '';
        return `=== ${l.platform.toUpperCase()} ===\nTitle: ${l.title}\nPrice: $${l.price}\n\n${l.description}${hashtags}`;
      })
      .join('\n\n---\n\n');

    await navigator.clipboard.writeText(allListings);
    setCopiedAll(true);
    toast.success('All listings copied!');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const platforms: Platform[] = ['Grailed', 'Depop', 'eBay', 'Mercari', 'Vinted'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Platform Listings</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRegenerate}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Regenerate
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyAll}>
            {copiedAll ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            Copy All
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {platforms.map((platform) => (
          <PlatformListingCard
            key={platform}
            listing={listings[platform]}
            onUpdate={(updates) => handleUpdateListing(platform, updates)}
          />
        ))}
      </div>
    </div>
  );
}
