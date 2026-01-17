import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartDrawer } from './CartDrawer';

type StorefrontView = 'navigation' | 'shop-all' | 'closet-selection' | 'parker-closet' | 'spencer-closet';

interface StorefrontNavProps {
  currentView: StorefrontView;
  onNavigate: (view: StorefrontView) => void;
  onBack: () => void;
}

export function StorefrontNav({ currentView, onNavigate, onBack }: StorefrontNavProps) {
  const showBackButton = currentView !== 'navigation';
  
  const getTitle = () => {
    switch (currentView) {
      case 'shop-all':
        return 'Shop All';
      case 'closet-selection':
        return 'Personal Collection';
      case 'parker-closet':
        return "Parker's Closet";
      case 'spencer-closet':
        return "Spencer's Closet";
      default:
        return 'Wall St. Collection';
    }
  };

  return (
    <nav className="bg-sidebar border-b border-sidebar-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Back button or empty space */}
          <div className="flex items-center gap-4 w-32">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          {/* Center - Navigation Links */}
          <div className="flex items-center gap-8">
            {currentView === 'navigation' ? (
              <>
                <button
                  onClick={() => onNavigate('shop-all')}
                  className="text-sidebar-foreground hover:text-sidebar-primary-foreground transition-colors font-medium tracking-wide"
                >
                  Shop All
                </button>
                <button
                  onClick={() => onNavigate('closet-selection')}
                  className="text-sidebar-foreground hover:text-sidebar-primary-foreground transition-colors font-medium tracking-wide"
                >
                  Personal Collection
                </button>
              </>
            ) : (
              <span className="text-sidebar-foreground font-medium tracking-wide">
                {getTitle()}
              </span>
            )}
          </div>
          
          {/* Right side - Cart */}
          <div className="flex items-center w-32 justify-end">
            <CartDrawer />
          </div>
        </div>
      </div>
    </nav>
  );
}
