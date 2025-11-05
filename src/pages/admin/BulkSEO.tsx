import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Wand2, AlertCircle, CheckCircle2, TrendingUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Post {
  id: string;
  title: string;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
}

interface Optimization {
  postId: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  improvements: string[];
  score: number;
}

export default function BulkSEO() {
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [optimizations, setOptimizations] = useState<Optimization[]>([]);

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts-bulk-seo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, status, meta_title, meta_description')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Post[];
    },
  });

  const togglePost = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const selectAll = () => {
    if (posts) {
      setSelectedPosts(new Set(posts.map(p => p.id)));
    }
  };

  const deselectAll = () => {
    setSelectedPosts(new Set());
  };

  const handleBulkOptimize = async () => {
    if (selectedPosts.size === 0) {
      toast({
        title: 'Geen posts geselecteerd',
        description: 'Selecteer minimaal 1 post om te optimaliseren',
        variant: 'destructive',
      });
      return;
    }

    setIsOptimizing(true);
    setProgress(0);
    setOptimizations([]);

    try {
      const postIds = Array.from(selectedPosts);
      
      toast({
        title: 'Optimalisatie gestart',
        description: `${postIds.length} post(s) worden geoptimaliseerd...`,
      });

      const { data, error } = await supabase.functions.invoke('bulk-optimize-seo', {
        body: { postIds }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Optimalisatie mislukt');
      }

      setOptimizations(data.optimizations);
      setProgress(100);

      toast({
        title: 'Optimalisatie voltooid! ✨',
        description: `${data.totalProcessed} post(s) succesvol geoptimaliseerd`,
      });

      // Refresh the posts list
      refetch();
      deselectAll();

    } catch (error) {
      console.error('Bulk optimization error:', error);
      toast({
        title: 'Optimalisatie mislukt',
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden',
        variant: 'destructive',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bulk SEO Optimizer</h1>
            <p className="text-muted-foreground mt-1">
              Optimaliseer meerdere posts tegelijk met AI-gegenereerde metadata
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={selectAll} disabled={isOptimizing}>
              Selecteer Alles
            </Button>
            <Button variant="outline" onClick={deselectAll} disabled={isOptimizing}>
              Deselecteer Alles
            </Button>
            <Button 
              onClick={handleBulkOptimize} 
              disabled={selectedPosts.size === 0 || isOptimizing}
              className="min-w-[200px]"
            >
              <Wand2 className={cn("h-4 w-4 mr-2", isOptimizing && "animate-spin")} />
              {isOptimizing ? 'Optimaliseren...' : `Optimaliseer ${selectedPosts.size} post(s)`}
            </Button>
          </div>
        </div>

        {isOptimizing && (
          <Card className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Voortgang</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Posts worden geoptimaliseerd... Dit kan enkele momenten duren.
              </p>
            </div>
          </Card>
        )}

        {optimizations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Optimalisatie Resultaten
            </h2>
            {optimizations.map((opt) => {
              const post = posts?.find(p => p.id === opt.postId);
              return (
                <Card key={opt.postId} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{post?.title}</h3>
                        <Badge variant={getScoreBadge(opt.score)} className="mt-2">
                          SEO Score: {opt.score}/100
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Meta Titel</p>
                        <p className="text-sm text-muted-foreground">{opt.metaTitle}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Meta Beschrijving</p>
                        <p className="text-sm text-muted-foreground">{opt.metaDescription}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Focus Keyword</p>
                        <Badge variant="outline">{opt.focusKeyword}</Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Secondary Keywords</p>
                        <div className="flex flex-wrap gap-1">
                          {opt.secondaryKeywords.map((kw, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {opt.improvements.length > 0 && (
                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          <p className="font-medium mb-2">Verbeterpunten:</p>
                          <ul className="text-sm space-y-1">
                            {opt.improvements.map((imp, i) => (
                              <li key={i}>• {imp}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Posts ({posts?.length || 0})
          </h2>

          {posts && posts.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Geen posts gevonden. Maak eerst een post aan om te optimaliseren.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            {posts?.map((post) => (
              <Card key={post.id} className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedPosts.has(post.id)}
                    onCheckedChange={() => togglePost(post.id)}
                    disabled={isOptimizing}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{post.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Meta Titel: </span>
                        {post.meta_title ? (
                          <span className={post.meta_title.length > 60 ? 'text-destructive' : ''}>
                            {post.meta_title.length}/60
                          </span>
                        ) : (
                          <span className="text-destructive">Niet ingesteld</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Meta Beschrijving: </span>
                        {post.meta_description ? (
                          <span className={post.meta_description.length > 160 ? 'text-destructive' : ''}>
                            {post.meta_description.length}/160
                          </span>
                        ) : (
                          <span className="text-destructive">Niet ingesteld</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
