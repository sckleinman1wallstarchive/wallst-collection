import gateBackground from '@/assets/gate-background.png';
import { Button } from '@/components/ui/button';

interface StorefrontWelcomeProps {
  onEnterShop: () => void;
}

export function StorefrontWelcome({ onEnterShop }: StorefrontWelcomeProps) {
  return (
    <div className="fixed inset-0 z-50">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${gateBackground})` }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl md:text-5xl font-light tracking-[0.3em] text-[#f5f5f0] mb-4">
          WALL ST.
        </h1>
        <p className="text-lg tracking-[0.2em] text-[#f5f5f0]/80 mb-12">
          COLLECTION
        </p>
        
        <Button
          onClick={onEnterShop}
          className="bg-[#f5f5f0] hover:bg-[#e5e5e0] text-[#1a1a1a] uppercase tracking-[0.2em] px-12 py-6 text-lg font-medium transition-all duration-300"
        >
          Shop
        </Button>
      </div>
    </div>
  );
}
