import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const { inventory, getActiveItems, getFinancialSummary } = useSupabaseInventory();
  const activeItems = getActiveItems();
  const summary = getFinancialSummary();

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

  // Status distribution
  const statusData = [
    { name: 'Listed', value: inventory.filter(i => i.status === 'listed').length },
    { name: 'In Closet', value: inventory.filter(i => i.status === 'in-closet').length },
    { name: 'Archive', value: inventory.filter(i => i.status === 'archive-hold').length },
    { name: 'Sold', value: inventory.filter(i => i.status === 'sold').length },
  ].filter(s => s.value > 0);

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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quick insights for decision-making
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total Inventory Cost</p>
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
          {/* Brand Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Profit by Brand (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedByProfit} layout="vertical">
                    <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
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

          {/* Capital Blockers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Capital Blockers</CardTitle>
              <p className="text-xs text-muted-foreground">Items held 21+ days, sorted by cost</p>
            </CardHeader>
            <CardContent>
              {capitalBlockers.length > 0 ? (
                <div className="space-y-3">
                  {capitalBlockers.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.daysHeld || 0} days · {item.brand}</p>
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
      </div>
    </DashboardLayout>
  );
};

export default Analytics;