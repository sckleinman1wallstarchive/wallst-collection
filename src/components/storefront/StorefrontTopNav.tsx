import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShopCart } from '@/components/shop/ShopCart';

 export type LandingNavView = 'home' | 'shop-all' | 'sold' | 'shop-by-brand' | 'collection-grails' | 'closet-selection';

interface StorefrontTopNavProps {
  currentView: LandingNavView;
  onNavigate: (view: LandingNavView) => void;
  isEditMode: boolean;
  onEditModeToggle: () => void;
  showEditButton: boolean;
}

const NAV_ITEMS: { view: LandingNavView; label: string }[] = [
  { view: 'home', label: 'Home' },
  { view: 'shop-all', label: 'Shop All' },
   { view: 'sold', label: 'Sold' },
  { view: 'shop-by-brand', label: 'Shop By Brand' },
  { view: 'collection-grails', label: 'Grails' },
  { view: 'closet-selection', label: 'Personal Collection' },
];

export function StorefrontTopNav({
  currentView,
  onNavigate,
  isEditMode,
  onEditModeToggle,
  showEditButton,
}: StorefrontTopNavProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14">
          {/* Left spacer for centering */}
          <div className="flex-1" />
          
          {/* Centered Navigation Links */}
          <nav className="flex items-center gap-1 bg-white/5 rounded-full px-1.5 py-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  currentView === item.view
                    ? 'bg-white text-black font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right side: Dashboard + Edit + Cart (with flex-1 for balance) */}
          <div className="flex-1 flex items-center justify-end gap-3">
            {showEditButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-1 text-white hover:text-white hover:bg-white/10"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            )}
            {showEditButton && (
              <Button
                variant={isEditMode ? 'secondary' : 'ghost'}
                size="sm"
                onClick={onEditModeToggle}
                className={`gap-1 ${!isEditMode ? 'text-white hover:text-white hover:bg-white/10' : ''}`}
              >
                {isEditMode ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                {isEditMode ? 'Done' : 'Edit'}
              </Button>
            )}
            <ShopCart />
          </div>
        </div>
      </div>
    </header>
  );
}
