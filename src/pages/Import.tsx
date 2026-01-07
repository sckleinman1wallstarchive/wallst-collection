import { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useSupabaseInventory, InventoryItem } from '@/hooks/useSupabaseInventory';
import { Database } from '@/integrations/supabase/types';

type ItemStatus = Database['public']['Enums']['item_status'];
type ItemCategory = Database['public']['Enums']['item_category'];
type Platform = Database['public']['Enums']['platform'];
type Owner = Database['public']['Enums']['item_owner'];

interface ParsedRow {
  name: string;
  brand: string;
  size: string;
  category: ItemCategory;
  acquisitionCost: number;
  askingPrice: number | null;
  lowestAcceptablePrice: number | null;
  salePrice: number | null;
  status: ItemStatus;
  platform: Platform;
  platformSold: Platform | null;
  sourcePlatform: string;
  owner: Owner;
  ownerSplit: string;
  notes: string;
  dateSold: string | null;
  isValid: boolean;
  errors: string[];
}

const Import = () => {
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const { bulkInsert } = useSupabaseInventory();

  const parseCurrency = (value: string | number | undefined): number => {
    if (value === undefined || value === null || value === '') return 0;
    if (typeof value === 'number') return value;
    // Remove $ and , and parse
    const cleaned = value.toString().replace(/[$,]/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const detectCategory = (name: string): ItemCategory => {
    const lower = name.toLowerCase();
    if (lower.includes('jacket') || lower.includes('coat') || lower.includes('bomber') || lower.includes('parka') || lower.includes('windbreaker') || lower.includes('varsity')) return 'outerwear';
    if (lower.includes('pants') || lower.includes('shorts') || lower.includes('denim') || lower.includes('trousers')) return 'bottoms';
    if (lower.includes('shirt') || lower.includes('tee') || lower.includes('hoodie') || lower.includes('sweater') || lower.includes('crew') || lower.includes('knit') || lower.includes('long sleeve') || lower.includes('longsleeve')) return 'tops';
    if (lower.includes('shoe') || lower.includes('boot') || lower.includes('sneaker') || lower.includes('high top') || lower.includes('clog') || lower.includes('driver')) return 'footwear';
    if (lower.includes('belt') || lower.includes('pendant') || lower.includes('bag') || lower.includes('wallet')) return 'accessories';
    return 'other';
  };

  const detectPlatform = (value: string | undefined): Platform => {
    if (!value) return 'none';
    const lower = value.toLowerCase();
    if (lower.includes('grailed')) return 'grailed';
    if (lower.includes('depop')) return 'depop';
    if (lower.includes('ebay')) return 'ebay';
    if (lower.includes('poshmark')) return 'poshmark';
    if (lower.includes('mercari')) return 'mercari';
    if (lower.includes('vinted')) return 'vinted';
    if (lower.includes('trade')) return 'trade';
    return 'none';
  };

  const detectStatus = (row: Record<string, unknown>): ItemStatus => {
    const sourcePlatform = (row['Platform Sourced'] || row['Source'] || '').toString().toLowerCase();
    const salePrice = parseCurrency(row['Sale Price'] as string);
    const listedPrice = parseCurrency(row['Listed Price'] as string);
    
    if (sourcePlatform.includes('scam')) return 'scammed';
    if (sourcePlatform.includes('refund')) return 'refunded';
    if (sourcePlatform.includes('fake') || sourcePlatform.includes('personal')) return 'archive-hold';
    if (sourcePlatform.includes('traded') || sourcePlatform.includes('trade')) return 'traded';
    if (salePrice > 0) return 'sold';
    if (listedPrice > 0) return 'listed';
    return 'in-closet';
  };

  const detectOwner = (split: string | undefined): Owner => {
    if (!split) return 'Shared';
    const s = split.toString().trim();
    if (s === '100/0' || s.toLowerCase().includes('parker')) return 'Parker Kleinman';
    if (s === '0/100' || s.toLowerCase().includes('spencer')) return 'Spencer Kleinman';
    return 'Shared';
  };

  const parseBrand = (description: string): { brand: string; name: string } => {
    // Common brand prefixes
    const brands = [
      'CDG', 'Comme des Garçons', 'Stone Island', 'Helmut Lang', 'Undercover',
      'Neighborhood', 'Yohji', 'Junya Watanabe', 'Saint Laurent', 'Prada',
      'Maison Margiela', 'Margiela', 'Rick Owens', 'Chrome Hearts', 'Kapital',
      'Number 9', 'Raf Simons', 'Dior Homme', 'Jil Sander', 'Marni', 'RL', 'Ralph Lauren'
    ];
    
    for (const brand of brands) {
      if (description.toLowerCase().startsWith(brand.toLowerCase())) {
        return {
          brand: brand,
          name: description.substring(brand.length).trim(),
        };
      }
    }
    
    // Try to extract first word/phrase as brand
    const parts = description.split(' ');
    if (parts.length > 1) {
      return {
        brand: parts[0],
        name: parts.slice(1).join(' '),
      };
    }
    
    return { brand: '', name: description };
  };

  const parseCSV = (text: string): Record<string, unknown>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: Record<string, unknown>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const row: Record<string, unknown> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      rows.push(row);
    }
    
    return rows;
  };

  const processData = (rows: Record<string, unknown>[]): ParsedRow[] => {
    return rows.map(row => {
      const errors: string[] = [];
      const description = (row['Description'] || row['Item'] || row['Name'] || '').toString();
      const { brand, name } = parseBrand(description);
      
      if (!description) errors.push('Missing item name');
      
      const acquisitionCost = parseCurrency(row['Cost $'] as string || row['Cost'] as string);
      const askingPrice = parseCurrency(row['Listed Price'] as string || row['Asking'] as string);
      const salePrice = parseCurrency(row['Sale Price'] as string);
      const lowestAcceptablePrice = askingPrice > 0 ? Math.round(askingPrice * 0.75) : null;
      
      const status = detectStatus(row);
      const ownerSplit = (row['Split (P/S)'] || row['Split'] || row['Owner'] || '').toString();
      
      return {
        name: name || description,
        brand,
        size: (row['Size'] || '').toString(),
        category: detectCategory(description),
        acquisitionCost,
        askingPrice: askingPrice > 0 ? askingPrice : null,
        lowestAcceptablePrice,
        salePrice: salePrice > 0 ? salePrice : null,
        status,
        platform: detectPlatform((row['Platform Listed'] || row['Platform'] || '').toString()),
        platformSold: salePrice > 0 ? detectPlatform((row['Platform Sold'] || '').toString()) : null,
        sourcePlatform: (row['Platform Sourced'] || row['Source'] || '').toString(),
        owner: detectOwner(ownerSplit),
        ownerSplit,
        notes: (row['Notes'] || '').toString(),
        dateSold: salePrice > 0 && row['Sale Date'] ? row['Sale Date'].toString() : null,
        isValid: errors.length === 0 && !!description,
        errors,
      };
    }).filter(row => row.name || row.brand);
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setImportComplete(false);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      const parsed = processData(rows);
      setParsedData(parsed);
    };
    reader.readAsText(file);
  }, []);

  const handleImport = async () => {
    const validItems = parsedData.filter(r => r.isValid);
    if (validItems.length === 0) return;
    
    setImporting(true);
    try {
      const itemsToInsert: Partial<InventoryItem>[] = validItems.map(row => ({
        name: row.name,
        brand: row.brand || null,
        size: row.size || null,
        category: row.category,
        acquisitionCost: row.acquisitionCost,
        askingPrice: row.askingPrice,
        lowestAcceptablePrice: row.lowestAcceptablePrice,
        salePrice: row.salePrice,
        status: row.status,
        platform: row.platform,
        platformSold: row.platformSold,
        sourcePlatform: row.sourcePlatform || null,
        owner: row.owner,
        ownerSplit: row.ownerSplit || null,
        notes: row.notes || null,
        dateSold: row.dateSold,
        dateAdded: new Date().toISOString().split('T')[0],
      }));
      
      await bulkInsert(itemsToInsert);
      setImportComplete(true);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setImporting(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const validCount = parsedData.filter(r => r.isValid).length;
  const invalidCount = parsedData.filter(r => !r.isValid).length;
  const soldCount = parsedData.filter(r => r.status === 'sold').length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Import Data</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Import inventory from CSV file
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Upload File</CardTitle>
            <CardDescription>
              Export your Excel sheet as CSV and upload it here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Choose CSV File</span>
                </div>
              </label>
              {fileName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{fileName}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {parsedData.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">Preview</CardTitle>
                    <CardDescription>
                      {parsedData.length} items found
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-chart-2/20 text-chart-2">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {validCount} valid
                    </Badge>
                    {invalidCount > 0 && (
                      <Badge variant="secondary" className="bg-destructive/20 text-destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {invalidCount} issues
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {soldCount} sold
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead className="text-right">Asking</TableHead>
                          <TableHead className="text-right">Sale</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Item Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.slice(0, 50).map((row, idx) => (
                          <TableRow key={idx} className={!row.isValid ? 'bg-destructive/5' : ''}>
                            <TableCell>
                              {row.isValid ? (
                                <CheckCircle2 className="h-4 w-4 text-chart-2" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              )}
                            </TableCell>
                            <TableCell className="font-medium max-w-48 truncate">
                              {row.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {row.brand}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {row.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {formatCurrency(row.acquisitionCost)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {formatCurrency(row.askingPrice)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {formatCurrency(row.salePrice)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.owner === 'Parker Kleinman' ? 'Parker' : row.owner === 'Spencer Kleinman' ? 'Spencer' : 'Shared'}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="secondary" 
                                className={
                                  row.status === 'sold' ? 'bg-chart-2/20 text-chart-2' :
                                  row.status === 'listed' ? 'bg-chart-1/20 text-chart-1' :
                                  row.status === 'scammed' ? 'bg-destructive/20 text-destructive' :
                                  ''
                                }
                              >
                                {row.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {parsedData.length > 50 && (
                    <div className="p-2 text-center text-sm text-muted-foreground bg-muted/50 border-t">
                      Showing first 50 of {parsedData.length} items
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Import Button */}
            <div className="flex justify-end gap-3">
              {importComplete ? (
                <div className="flex items-center gap-2 text-chart-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Import complete! {validCount} items added.</span>
                </div>
              ) : (
                <Button 
                  size="lg" 
                  onClick={handleImport}
                  disabled={importing || validCount === 0}
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      Import {validCount} Items
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Import;
