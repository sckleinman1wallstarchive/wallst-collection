import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface FilterState {
  sizes: string[];
  brands: string[];
  categories: string[];
}

interface StorefrontFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableSizes: string[];
  availableBrands: string[];
}

const CATEGORY_OPTIONS = [
  { value: 'pants', label: 'Pants' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'belt', label: 'Belts' },
  { value: 'hoodie', label: 'Hoodies' },
  { value: 'jacket', label: 'Jackets' },
  { value: 'top', label: 'Tops' },
  { value: 'other', label: 'Other' },
];

export function StorefrontFilters({ filters, onChange, availableSizes, availableBrands }: StorefrontFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleSize = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onChange({ ...filters, sizes: newSizes });
  };

  const toggleBrand = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onChange({ ...filters, brands: newBrands });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories: newCategories });
  };

  const clearFilters = () => {
    onChange({ sizes: [], brands: [], categories: [] });
  };

  const activeCount = filters.sizes.length + filters.brands.length + filters.categories.length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* Size Filter */}
        <DropdownMenu open={openDropdown === 'size'} onOpenChange={(open) => setOpenDropdown(open ? 'size' : null)}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              Size
              {filters.sizes.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {filters.sizes.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto bg-popover">
            {availableSizes.map((size) => (
              <DropdownMenuCheckboxItem
                key={size}
                checked={filters.sizes.includes(size)}
                onCheckedChange={() => toggleSize(size)}
              >
                {size}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Brand Filter */}
        <DropdownMenu open={openDropdown === 'brand'} onOpenChange={(open) => setOpenDropdown(open ? 'brand' : null)}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              Brand
              {filters.brands.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {filters.brands.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto bg-popover">
            {availableBrands.map((brand) => (
              <DropdownMenuCheckboxItem
                key={brand}
                checked={filters.brands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              >
                {brand}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Category Filter */}
        <DropdownMenu open={openDropdown === 'category'} onOpenChange={(open) => setOpenDropdown(open ? 'category' : null)}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              Category
              {filters.categories.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {filters.categories.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover">
            {CATEGORY_OPTIONS.map((cat) => (
              <DropdownMenuCheckboxItem
                key={cat.value}
                checked={filters.categories.includes(cat.value)}
                onCheckedChange={() => toggleCategory(cat.value)}
              >
                {cat.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="h-3 w-3" />
            Clear ({activeCount})
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.sizes.map((size) => (
            <Badge key={size} variant="secondary" className="gap-1 pr-1">
              {size}
              <button onClick={() => toggleSize(size)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.brands.map((brand) => (
            <Badge key={brand} variant="secondary" className="gap-1 pr-1">
              {brand}
              <button onClick={() => toggleBrand(brand)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.categories.map((cat) => (
            <Badge key={cat} variant="secondary" className="gap-1 pr-1">
              {CATEGORY_OPTIONS.find((c) => c.value === cat)?.label || cat}
              <button onClick={() => toggleCategory(cat)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
