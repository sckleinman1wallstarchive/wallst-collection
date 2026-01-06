import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockContentPosts } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Instagram, ShoppingBag } from 'lucide-react';
import { ContentPost } from '@/types/inventory';

const resultColors: Record<ContentPost['result'], string> = {
  'dms': 'bg-chart-1/20 text-chart-3',
  'interest': 'bg-chart-2/20 text-chart-3',
  'sold': 'bg-primary/10 text-primary',
  'none': 'bg-muted text-muted-foreground',
};

const resultLabels: Record<ContentPost['result'], string> = {
  'dms': 'DMs Received',
  'interest': 'Interest',
  'sold': 'Sold',
  'none': 'No Response',
};

const Content = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate stats
  const totalPosts = mockContentPosts.length;
  const postsWithEngagement = mockContentPosts.filter(p => p.result !== 'none').length;
  const engagementRate = totalPosts > 0 ? ((postsWithEngagement / totalPosts) * 100).toFixed(0) : 0;

  // Posts by day this week
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    return date.toISOString().split('T')[0];
  });

  const postsByDay = weekDays.map(day => ({
    date: day,
    count: mockContentPosts.filter(p => p.date === day).length,
    formatted: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
  })).reverse();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Daily posting tracker
            </p>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Log Post
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Posts This Week</p>
            <p className="text-xl font-semibold mt-1">{totalPosts}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Engagement Rate</p>
            <p className="text-xl font-semibold mt-1">{engagementRate}%</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">DMs Received</p>
            <p className="text-xl font-semibold mt-1">
              {mockContentPosts.filter(p => p.result === 'dms').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Items Sold</p>
            <p className="text-xl font-semibold mt-1">
              {mockContentPosts.filter(p => p.result === 'sold').length}
            </p>
          </Card>
        </div>

        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between gap-2">
              {postsByDay.map((day) => (
                <div key={day.date} className="flex-1 text-center">
                  <div
                    className={`h-16 rounded-md flex items-end justify-center pb-2 ${
                      day.count > 0 ? 'bg-primary/20' : 'bg-muted'
                    }`}
                  >
                    {day.count > 0 && (
                      <span className="text-sm font-medium">{day.count}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{day.formatted}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockContentPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="text-sm">{formatDate(post.date)}</TableCell>
                    <TableCell className="font-medium text-sm">{post.itemName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {post.platform === 'instagram' ? (
                          <Instagram className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm capitalize">{post.platform}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{post.owner}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={resultColors[post.result]}>
                        {resultLabels[post.result]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Content;
