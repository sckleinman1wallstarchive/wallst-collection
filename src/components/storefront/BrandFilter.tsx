import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BrandFilterProps {
  brands: string[];
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
}

export function BrandFilter({ brands, selectedBrand, onBrandChange }: BrandFilterProps) {
  return (
    <Select value={selectedBrand} onValueChange={onBrandChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filter by brand" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Brands</SelectItem>
        {brands.map((brand) => (
          <SelectItem key={brand} value={brand}>
            {brand}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
