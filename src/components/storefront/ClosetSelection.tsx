import { Card, CardContent } from '@/components/ui/card';

interface ClosetSelectionProps {
  onSelectCloset: (closet: 'parker' | 'spencer') => void;
}

export function ClosetSelection({ onSelectCloset }: ClosetSelectionProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-light tracking-wide mb-2">Personal Collection</h2>
        <p className="text-muted-foreground">Select a closet to explore</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Parker's Closet */}
        <Card 
          className="group cursor-pointer overflow-hidden border-2 border-border hover:border-primary transition-all duration-300"
          onClick={() => onSelectCloset('parker')}
        >
          <CardContent className="p-0">
            <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 relative flex items-center justify-center">
              {/* Placeholder for customizable art - can be updated later */}
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-light tracking-[0.15em] text-white mb-2">
                  PARKER'S
                </h3>
                <p className="text-lg tracking-[0.2em] text-white/70">
                  CLOSET
                </p>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
            </div>
          </CardContent>
        </Card>
        
        {/* Spencer's Closet */}
        <Card 
          className="group cursor-pointer overflow-hidden border-2 border-border hover:border-primary transition-all duration-300"
          onClick={() => onSelectCloset('spencer')}
        >
          <CardContent className="p-0">
            <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 relative flex items-center justify-center">
              {/* Placeholder for customizable art - can be updated later */}
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-800" />
              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-light tracking-[0.15em] text-white mb-2">
                  SPENCER'S
                </h3>
                <p className="text-lg tracking-[0.2em] text-white/70">
                  CLOSET
                </p>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
