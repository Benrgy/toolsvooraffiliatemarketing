import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  TrendingDown,
  Eye,
  Clock,
  MousePointerClick,
  Share2,
  Search,
  LineChart as LineChartIcon,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, subDays } from 'date-fns';

interface PostAnalyticsSummary {
  post_id: string;
  title: string;
  slug: string;
  days_tracked: number;
  total_views: number;
  total_visitors: number;
  avg_time_on_page: number;
  avg_bounce_rate: number;
  avg_scroll_depth: number;
  total_shares: number;
  total_organic_traffic: number;
  total_conversions: number;
  avg_conversion_rate: number;
}

interface DailyAnalytics {
  date: string;
  page_views: number;
  unique_visitors: number;
  avg_time_on_page: number;
  organic_traffic: number;
  social_shares: number;
}

export const PerformanceDashboard = () => {
  const [selectedPostId, setSelectedPostId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  // Fetch posts for dropdown
  const { data: posts } = useQuery({
    queryKey: ['posts-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch summary analytics
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics-summary', selectedPostId],
    queryFn: async () => {
      let query = supabase.from('post_analytics_summary').select('*');
      
      if (selectedPostId !== 'all') {
        query = query.eq('post_id', selectedPostId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PostAnalyticsSummary[];
    },
  });

  // Fetch daily analytics for chart
  const { data: dailyData, isLoading: dailyLoading } = useQuery({
    queryKey: ['daily-analytics', selectedPostId, timeRange],
    queryFn: async () => {
      const startDate = subDays(new Date(), parseInt(timeRange));
      
      let query = supabase
        .from('post_analytics')
        .select('date, page_views, unique_visitors, avg_time_on_page, organic_traffic, social_shares')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .order('date', { ascending: true });
      
      if (selectedPostId !== 'all') {
        query = query.eq('post_id', selectedPostId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Group by date if all posts
      if (selectedPostId === 'all' && data) {
        const grouped = data.reduce((acc: Record<string, DailyAnalytics>, curr: any) => {
          const dateKey = curr.date;
          if (!acc[dateKey]) {
            acc[dateKey] = {
              date: format(new Date(dateKey), 'MMM dd'),
              page_views: 0,
              unique_visitors: 0,
              avg_time_on_page: 0,
              organic_traffic: 0,
              social_shares: 0,
            };
          }
          acc[dateKey].page_views += curr.page_views;
          acc[dateKey].unique_visitors += curr.unique_visitors;
          acc[dateKey].organic_traffic += curr.organic_traffic;
          acc[dateKey].social_shares += curr.social_shares;
          return acc;
        }, {});
        
        return Object.values(grouped);
      }
      
      return data?.map((d: any) => ({
        ...d,
        date: format(new Date(d.date), 'MMM dd'),
      })) as DailyAnalytics[];
    },
  });

  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Calculate aggregate metrics
  const aggregateMetrics = summaryData?.reduce((acc, post) => ({
    totalViews: acc.totalViews + (post.total_views || 0),
    totalVisitors: acc.totalVisitors + (post.total_visitors || 0),
    avgTimeOnPage: acc.avgTimeOnPage + (post.avg_time_on_page || 0),
    totalShares: acc.totalShares + (post.total_shares || 0),
    totalOrganic: acc.totalOrganic + (post.total_organic_traffic || 0),
  }), {
    totalViews: 0,
    totalVisitors: 0,
    avgTimeOnPage: 0,
    totalShares: 0,
    totalOrganic: 0,
  });

  const avgTimeOnPage = summaryData && summaryData.length > 0
    ? Math.round(aggregateMetrics!.avgTimeOnPage / summaryData.length)
    : 0;

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    suffix = '' 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    trend?: number; 
    suffix?: string;
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">
              {value}{suffix}
            </p>
            {trend !== undefined && (
              <div className="flex items-center gap-1">
                {trend >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={`text-sm font-medium ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
          <div className="p-3 bg-muted rounded-full">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (summaryLoading || dailyLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedPostId} onValueChange={setSelectedPostId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Selecteer post" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Posts</SelectItem>
            {posts?.map((post) => (
              <SelectItem key={post.id} value={post.id}>
                {post.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Laatste 7 dagen</SelectItem>
            <SelectItem value="30">Laatste 30 dagen</SelectItem>
            <SelectItem value="90">Laatste 90 dagen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Totaal Views"
          value={aggregateMetrics?.totalViews.toLocaleString() || 0}
          icon={Eye}
          trend={12}
        />
        <MetricCard
          title="Unieke Bezoekers"
          value={aggregateMetrics?.totalVisitors.toLocaleString() || 0}
          icon={MousePointerClick}
          trend={8}
        />
        <MetricCard
          title="Gem. Tijd op Pagina"
          value={formatTime(avgTimeOnPage)}
          icon={Clock}
          trend={-5}
        />
        <MetricCard
          title="Social Shares"
          value={aggregateMetrics?.totalShares || 0}
          icon={Share2}
          trend={15}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5" />
              Traffic Trend
            </CardTitle>
            <CardDescription>Page views en bezoekers over tijd</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyData && dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="page_views" 
                    stackId="1"
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    name="Page Views"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="unique_visitors" 
                    stackId="2"
                    stroke="hsl(var(--accent))" 
                    fill="hsl(var(--accent))"
                    name="Unieke Bezoekers"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Alert>
                <AlertDescription>Nog geen data beschikbaar voor deze periode.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Organisch Verkeer & Engagement
            </CardTitle>
            <CardDescription>Organisch verkeer en social shares</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyData && dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="organic_traffic" 
                    stroke="hsl(var(--success))" 
                    name="Organisch Verkeer"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="social_shares" 
                    stroke="hsl(var(--warning))" 
                    name="Social Shares"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Alert>
                <AlertDescription>Nog geen data beschikbaar voor deze periode.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Posts */}
      {selectedPostId === 'all' && summaryData && summaryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Presterende Posts</CardTitle>
            <CardDescription>Rangschikking op basis van totaal views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summaryData
                .sort((a, b) => (b.total_views || 0) - (a.total_views || 0))
                .slice(0, 5)
                .map((post, index) => (
                  <div 
                    key={post.post_id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-bold">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-semibold">{post.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(post.avg_time_on_page)} gem. tijd • {post.total_shares} shares
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{post.total_views?.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">views</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
