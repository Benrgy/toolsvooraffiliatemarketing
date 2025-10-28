import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Circle, Plus } from 'lucide-react';
import topicalMapData from '@/data/topical-map.json';

interface PostStatus {
  [slug: string]: 'published' | 'draft' | 'none';
}

export default function TopicalMap() {
  const [postStatuses, setPostStatuses] = useState<PostStatus>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPostStatuses();
  }, []);

  const loadPostStatuses = async () => {
    const { data: posts } = await supabase
      .from('posts')
      .select('slug, status');

    const statuses: PostStatus = {};
    posts?.forEach(post => {
      statuses[post.slug] = post.status as 'published' | 'draft';
    });

    setPostStatuses(statuses);
    setLoading(false);
  };

  const getStatusIcon = (slug: string) => {
    const status = postStatuses[slug] || 'none';
    switch (status) {
      case 'published':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'draft':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getStatusBadge = (slug: string) => {
    const status = postStatuses[slug] || 'none';
    switch (status) {
      case 'published':
        return <Badge variant="default">Gepubliceerd</Badge>;
      case 'draft':
        return <Badge variant="secondary">Concept</Badge>;
      default:
        return <Badge variant="outline">Niet aangemaakt</Badge>;
    }
  };

  const calculateProgress = () => {
    const totalArticles = topicalMapData.pillarPages.reduce(
      (total, pillar) => total + 1 + pillar.clusters.reduce(
        (clusterTotal, cluster) => clusterTotal + 1 + cluster.supportingArticles.length,
        0
      ),
      0
    );

    const publishedCount = Object.values(postStatuses).filter(
      status => status === 'published'
    ).length;

    return Math.round((publishedCount / totalArticles) * 100);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Topical Map</h1>
          <p className="text-muted-foreground">{topicalMapData.niche}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Voortgang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Contentstructuur voltooid</span>
                <span className="font-medium">{calculateProgress()}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {topicalMapData.pillarPages.map((pillar, pillarIndex) => {
            const pillarSlug = pillar.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
            
            return (
            <Card key={pillarIndex}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(pillarSlug)}
                      <CardTitle className="text-xl">{pillar.title}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">Pillar Page</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(pillarSlug)}
                    {!postStatuses[pillarSlug] && (
                      <Link to={`/admin/posts/new?slug=${pillarSlug}`}>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Aanmaken
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pillar.clusters.map((cluster, clusterIndex) => {
                    const clusterSlug = cluster.clusterTitle
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-|-$/g, '');
                    
                    return (
                    <div key={clusterIndex} className="border-l-2 border-border pl-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(clusterSlug)}
                            <h3 className="font-semibold">{cluster.clusterTitle}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">Content Cluster</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(clusterSlug)}
                          {!postStatuses[clusterSlug] && (
                            <Link to={`/admin/posts/new?slug=${clusterSlug}`}>
                              <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-1" />
                                Aanmaken
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="ml-4 space-y-2">
                        {cluster.supportingArticles.map((article, articleIndex) => {
                          const articleSlug = article.title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, '');
                          
                          return (
                          <div
                            key={articleIndex}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              {getStatusIcon(articleSlug)}
                              <span className="text-sm">{article.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(articleSlug)}
                              {!postStatuses[articleSlug] && (
                                <Link to={`/admin/posts/new?slug=${articleSlug}`}>
                                  <Button size="sm" variant="ghost">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        )})}
                      </div>
                    </div>
                  )})}
                </div>
              </CardContent>
            </Card>
          )})}
        </div>
      </div>
    </AdminLayout>
  );
}
