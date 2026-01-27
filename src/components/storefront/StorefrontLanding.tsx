import { StorefrontTopNav, LandingNavView } from './StorefrontTopNav';
import { HeroCarousel } from './HeroCarousel';
import { NewArrivalsSection } from './NewArrivalsSection';
import { AboutUsGallery } from './AboutUsGallery';
import { PublicInventoryItem } from '@/hooks/usePublicInventory';

interface StorefrontLandingProps {
  onNavigate: (view: LandingNavView) => void;
  onItemClick: (item: PublicInventoryItem) => void;
  onBrandClick: (brandName: string) => void;
  isEditMode: boolean;
  onEditModeToggle: () => void;
  showEditButton: boolean;
}

export function StorefrontLanding({
  onNavigate,
  onItemClick,
  onBrandClick,
  isEditMode,
  onEditModeToggle,
  showEditButton,
}: StorefrontLandingProps) {
  const handleShopBrand = (brandName: string) => {
    onBrandClick(brandName);
  };

  const handleViewAll = () => {
    onNavigate('shop-all');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation */}
      <StorefrontTopNav
        currentView="home"
        onNavigate={onNavigate}
        isEditMode={isEditMode}
        onEditModeToggle={onEditModeToggle}
        showEditButton={showEditButton}
      />

      {/* Hero Carousel */}
      <HeroCarousel onShopBrand={handleShopBrand} />

      {/* New Arrivals Section */}
      <NewArrivalsSection onViewAll={handleViewAll} onItemClick={onItemClick} />

      {/* About Us Section */}
      <AboutUsGallery isEditMode={isEditMode} />
    </div>
  );
}
