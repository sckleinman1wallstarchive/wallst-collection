import { Link } from 'react-router-dom';

export function ShopHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/shop" className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight">Wall St Collection</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link 
            to="/shop" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Shop
          </Link>
        </nav>
      </div>
    </header>
  );
}
