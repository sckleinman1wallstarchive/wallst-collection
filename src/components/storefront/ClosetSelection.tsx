import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ClosetSelectionProps {
  onSelectCloset: (closet: 'parker' | 'spencer') => void;
}

// Wine-red color shades
const PARKER_COLOR = 'hsl(0, 45%, 22%)';
const SPENCER_COLOR = 'hsl(0, 40%, 28%)';

export function ClosetSelection({ onSelectCloset }: ClosetSelectionProps) {
  const [hoveredCloset, setHoveredCloset] = useState<'parker' | 'spencer' | null>(null);

  return (
    <div className="min-h-[80vh] bg-black py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-light tracking-wide mb-2 text-white">Personal Collection</h2>
        <p className="text-muted-foreground">Select a closet to explore</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Parker's Closet */}
        <Card 
          className="group cursor-pointer overflow-hidden rounded-2xl border-0 transition-all duration-300"
          style={{ backgroundColor: PARKER_COLOR }}
          onMouseEnter={() => setHoveredCloset('parker')}
          onMouseLeave={() => setHoveredCloset(null)}
          onClick={() => onSelectCloset('parker')}
        >
          <CardContent className="p-0">
            <div className="aspect-square relative flex items-center justify-center">
              {/* Art image placeholder - appears on hover */}
              {/* TODO: Connect to art_image_url when available */}
              
              <div className="relative z-10 text-center">
                <h3 
                  className="text-2xl font-light tracking-[0.15em] mb-2 transition-colors duration-300"
                  style={{ color: hoveredCloset === 'parker' ? PARKER_COLOR : 'white' }}
                >
                  PARKER'S
                </h3>
                <p 
                  className="text-lg tracking-[0.2em] transition-colors duration-300"
                  style={{ color: hoveredCloset === 'parker' ? PARKER_COLOR : 'rgba(255,255,255,0.7)' }}
                >
                  CLOSET
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Spencer's Closet */}
        <Card 
          className="group cursor-pointer overflow-hidden rounded-2xl border-0 transition-all duration-300"
          style={{ backgroundColor: SPENCER_COLOR }}
          onMouseEnter={() => setHoveredCloset('spencer')}
          onMouseLeave={() => setHoveredCloset(null)}
          onClick={() => onSelectCloset('spencer')}
        >
          <CardContent className="p-0">
            <div className="aspect-square relative flex items-center justify-center">
              {/* Art image placeholder - appears on hover */}
              {/* TODO: Connect to art_image_url when available */}
              
              <div className="relative z-10 text-center">
                <h3 
                  className="text-2xl font-light tracking-[0.15em] mb-2 transition-colors duration-300"
                  style={{ color: hoveredCloset === 'spencer' ? SPENCER_COLOR : 'white' }}
                >
                  SPENCER'S
                </h3>
                <p 
                  className="text-lg tracking-[0.2em] transition-colors duration-300"
                  style={{ color: hoveredCloset === 'spencer' ? SPENCER_COLOR : 'rgba(255,255,255,0.7)' }}
                >
                  CLOSET
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
