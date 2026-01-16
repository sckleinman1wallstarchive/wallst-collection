import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const CATEGORY_LABELS: Record<string, string> = {
  jewelry: "Jewelry",
  "japanese-designers": "Japanese Designers",
  "european-luxury": "European Luxury",
  "avant-garde": "Avant-Garde",
  streetwear: "Streetwear",
  contemporary: "Contemporary",
  footwear: "Footwear",
  vintage: "Vintage",
  other: "Other",
};

const Analytics = () => {
  const { inventory, getActiveItems, getFinancialSummary } = useSupabaseInventory();
  const [isExtracting, setIsExtracting] = useState(false);
  const [viewMode, setViewMode] = useState<'brand' | 'category'>('category');
  const queryClient = useQueryClient();
  
  const activeItems = getActiveItems();
  const summary = getFinancialSummary();

  // Count items without brand
  const itemsWithoutBrand = inventory.filter(i => !i.brand).length;

  const handleExtractBrands = async () => {
    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-brands', {
        body: { mode: 'backfill' }
      });
      
      if (error) throw error;
      
      toast.success(`Extracted brands for ${data.processed} items`);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    } catch (err) {
      console.error('Brand extraction error:', err);
      toast.error('Failed to extract brands');
    } finally {
      setIsExtracting(false);
    }
  };

  // Brand performance
  const brandData = activeItems.reduce((acc, item) => {
    const brand = item.brand || 'Unknown';
    const existing = acc.find(b => b.name === brand);
    if (existing) {
      existing.count += 1;
      existing.value += (item.askingPrice || 0) - item.acquisitionCost;
    } else {
      acc.push({
        name: brand,
        count: 1,
        value: (item.askingPrice || 0) - item.acquisitionCost,
      });
    }
    return acc;
  }, [] as { name: string; count: number; value: number }[]);

  const sortedByProfit = [...brandData].sort((a, b) => b.value - a.value).slice(0, 10);

  // Category performance
  const categoryData = activeItems.reduce((acc, item) => {
    const category = item.brandCategory || 'other';
    const existing = acc.find(c => c.name === category);
    if (existing) {
      existing.count += 1;
      existing.value += (item.askingPrice || 0) - item.acquisitionCost;
      existing.cost += item.acquisitionCost;
    } else {
      acc.push({
        name: category,
        label: CATEGORY_LABELS[category] || category,
        count: 1,
        value: (item.askingPrice || 0) - item.acquisitionCost,
        cost: item.acquisitionCost,
      });
    }
    return acc;
  }, [] as { name: string; label: string; count: number; value: number; cost: number }[]);

  const sortedCategoryByProfit = [...categoryData].sort((a, b) => b.value - a.value);

  // Status distribution
  const statusData = [
    { name: 'For Sale', value: inventory.filter(i => i.status === 'listed').length },
    { name: 'In Closet (Parker)', value: inventory.filter(i => i.status === 'in-closet-parker').length },
    { name: 'In Closet (Spencer)', value: inventory.filter(i => i.status === 'in-closet-spencer').length },
    { name: 'OTW', value: inventory.filter(i => i.status === 'otw').length },
    { name: 'Sold', value: inventory.filter(i => i.status === 'sold').length },
  ].filter(s => s.value > 0);

  // Category distribution for pie chart
  const categoryDistribution = categoryData.map(c => ({
    name: c.label,
    value: c.count,
  })).filter(c => c.value > 0);

  // Days held distribution
  const daysCategories = [
    { range: '0-7 days', count: activeItems.filter(i => (i.daysHeld || 0) <= 7).length },
    { range: '8-14 days', count: activeItems.filter(i => (i.daysHeld || 0) > 7 && (i.daysHeld || 0) <= 14).length },
    { range: '15-30 days', count: activeItems.filter(i => (i.daysHeld || 0) > 14 && (i.daysHeld || 0) <= 30).length },
    { range: '30+ days', count: activeItems.filter(i => (i.daysHeld || 0) > 30).length },
  ];

  // Capital blocking items
  const capitalBlockers = activeItems
    .filter(i => (i.daysHeld || 0) > 21)
    .sort((a, b) => b.acquisitionCost - a.acquisitionCost)
    .slice(0, 5);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const avgDaysHeld = activeItems.length > 0 
    ? Math.round(activeItems.reduce((sum, i) => sum + (i.daysHeld || 0), 0) / activeItems.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Quick insights for decision-making
            </p>
          </div>
          {itemsWithoutBrand > 0 && (
            <Button 
              onClick={handleExtractBrands} 
              disabled={isExtracting}
              variant="outline"
              size="sm"
            >
              {isExtracting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isExtracting ? 'Extracting...' : `Auto-tag ${itemsWithoutBrand} items`}
            </Button>
          )}
        </div>

        {/* All-Time Totals */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(summary.totalSpent)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(summary.totalRevenue)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total COGS</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(summary.totalCostOfSold)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total Profit</p>
            <p className={`text-xl font-semibold mt-1 ${summary.totalProfit >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
              {summary.totalProfit >= 0 ? '+' : ''}{formatCurrency(summary.totalProfit)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Items Sold</p>
            <p className="text-xl font-semibold mt-1">{summary.itemsSold}</p>
          </Card>
        </div>

        {/* Active Inventory Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Active Inventory Cost</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(summary.activeInventoryCost)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Potential Revenue</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(summary.potentialRevenue)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Potential Profit</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(summary.potentialRevenue - summary.activeInventoryCost)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Avg Days Held</p>
            <p className="text-xl font-semibold mt-1">{avgDaysHeld} days</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand/Category Performance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Potential Profit by {viewMode === 'brand' ? 'Brand' : 'Category'}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'category' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('category')}
                  className="h-7 text-xs"
                >
                  Category
                </Button>
                <Button
                  variant={viewMode === 'brand' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('brand')}
                  className="h-7 text-xs"
                >
                  Brand
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={viewMode === 'brand' ? sortedByProfit : sortedCategoryByProfit} 
                    layout="vertical"
                  >
                    <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                    <YAxis 
                      type="category" 
                      dataKey={viewMode === 'brand' ? 'name' : 'label'} 
                      width={120} 
                      tick={{ fontSize: 12 }} 
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {categoryDistribution.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {statusData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Days Held Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Inventory Age</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daysCategories}>
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Capital Blockers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Capital Blockers</CardTitle>
            <p className="text-xs text-muted-foreground">Items held 21+ days, sorted by cost</p>
          </CardHeader>
          <CardContent>
            {capitalBlockers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {capitalBlockers.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.daysHeld || 0} days · {item.brand || 'Unknown'} · {CATEGORY_LABELS[item.brandCategory || 'other'] || item.brandCategory}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono">{formatCurrency(item.acquisitionCost)}</p>
                      <p className="text-xs text-muted-foreground">invested</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No items blocking capital
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
