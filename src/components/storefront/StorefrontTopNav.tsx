import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShopCart } from '@/components/shop/ShopCart';

export type LandingNavView = 'home' | 'shop-all' | 'shop-by-brand' | 'collection-grails';

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
  { view: 'shop-by-brand', label: 'Shop By Brand' },
  { view: 'collection-grails', label: 'Grails' },
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
        <div className="flex items-center justify-between h-14">
          {/* Navigation Links */}
          <nav className="flex items-center gap-0">
            {NAV_ITEMS.map((item, index) => (
              <div key={item.view} className="flex items-center">
                {index > 0 && (
                  <span className="text-white/40 mx-3 select-none">|</span>
                )}
                <button
                  onClick={() => onNavigate(item.view)}
                  className={`text-sm tracking-wide transition-colors ${
                    currentView === item.view
                      ? 'text-white font-medium'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </nav>

          {/* Right side: Dashboard + Edit + Cart */}
          <div className="flex items-center gap-3">
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
