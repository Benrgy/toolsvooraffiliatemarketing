import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ExternalLink, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Backlink {
  id: string;
  post_id: string;
  source_url: string;
  source_domain: string;
  anchor_text: string;
  link_type: string;
  status: string;
  domain_authority: number;
  spam_score: number;
  relevance_score: number;
  traffic_estimate: number;
  page_title: string;
  context_snippet: string;
  discovered_at: string;
  last_checked_at: string;
  notes: string;
}

interface Post {
  id: string;
  title: string;
}

export const BacklinkTracker = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  // Fetch backlinks
  const { data: backlinks, isLoading } = useQuery({
    queryKey: ['backlinks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backlinks')
        .select('*')
        .order('discovered_at', { ascending: false });
      
      if (error) throw error;
      return data as Backlink[];
    },
  });

  // Fetch posts for dropdown
  const { data: posts } = useQuery({
    queryKey: ['posts-for-backlinks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      return data as Post[];
    },
  });

  const [formData, setFormData] = useState({
    postId: '',
    sourceUrl: '',
    anchorText: '',
    linkType: 'dofollow',
    contextSnippet: '',
  });

  const addBacklinkMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Extract domain from URL
      let domain: string;
      try {
        const url = new URL(data.sourceUrl);
        domain = url.hostname;
      } catch (e) {
        throw new Error('Ongeldige URL');
      }

      // Analyze the backlink
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-backlink', {
        body: {
          sourceUrl: data.sourceUrl,
          sourceDomain: domain,
          anchorText: data.anchorText,
          contextSnippet: data.contextSnippet,
        },
      });

      if (analysisError) throw analysisError;

      // Insert backlink with analysis results
      const { error } = await supabase.from('backlinks').insert({
        post_id: data.postId || null,
        source_url: data.sourceUrl,
        source_domain: domain,
        anchor_text: data.anchorText,
        link_type: data.linkType,
        context_snippet: data.contextSnippet,
        domain_authority: analysisData.domainAuthority,
        spam_score: analysisData.spamScore,
        relevance_score: analysisData.relevanceScore,
        traffic_estimate: analysisData.trafficEstimate,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlinks'] });
      setIsAddDialogOpen(false);
      setFormData({
        postId: '',
        sourceUrl: '',
        anchorText: '',
        linkType: 'dofollow',
        contextSnippet: '',
      });
      toast({
        title: "Backlink toegevoegd",
        description: "De backlink is succesvol toegevoegd en geanalyseerd.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reanalyzeBacklinkMutation = useMutation({
    mutationFn: async (backlink: Backlink) => {
      setAnalyzing(backlink.id);
      
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-backlink', {
        body: {
          sourceUrl: backlink.source_url,
          sourceDomain: backlink.source_domain,
          anchorText: backlink.anchor_text,
          contextSnippet: backlink.context_snippet,
        },
      });

      if (analysisError) throw analysisError;

      const { error } = await supabase
        .from('backlinks')
        .update({
          domain_authority: analysisData.domainAuthority,
          spam_score: analysisData.spamScore,
          relevance_score: analysisData.relevanceScore,
          traffic_estimate: analysisData.trafficEstimate,
          last_checked_at: new Date().toISOString(),
        })
        .eq('id', backlink.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlinks'] });
      toast({
        title: "Backlink opnieuw geanalyseerd",
        description: "De kwaliteitsmetrics zijn bijgewerkt.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setAnalyzing(null);
    },
  });

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getQualityBadge = (score: number) => {
    if (score >= 80) return 'bg-success text-success-foreground';
    if (score >= 60) return 'bg-warning text-warning-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'lost':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'broken':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const calculateOverallScore = (backlink: Backlink) => {
    return Math.round(
      (backlink.domain_authority * 0.4) +
      ((100 - backlink.spam_score) * 0.3) +
      (backlink.relevance_score * 0.3)
    );
  };

  const activeBacklinks = backlinks?.filter(b => b.status === 'active') || [];
  const avgDA = activeBacklinks.length > 0
    ? Math.round(activeBacklinks.reduce((sum, b) => sum + (b.domain_authority || 0), 0) / activeBacklinks.length)
    : 0;
  const totalTraffic = activeBacklinks.reduce((sum, b) => sum + (b.traffic_estimate || 0), 0);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Totaal Backlinks</p>
              <p className="text-3xl font-bold">{backlinks?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Actieve Links</p>
              <p className="text-3xl font-bold text-success">{activeBacklinks.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Gem. Domain Authority</p>
              <p className="text-3xl font-bold">{avgDA}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Geschat Verkeer</p>
              <p className="text-3xl font-bold">{totalTraffic.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Backlink Tracker
              </CardTitle>
              <CardDescription>
                Monitor en analyseer inkomende links naar je content
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Backlink Toevoegen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nieuwe Backlink Toevoegen</DialogTitle>
                  <DialogDescription>
                    Voeg een backlink toe om de kwaliteit automatisch te laten analyseren
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="postId">Gekoppelde Post (optioneel)</Label>
                    <Select
                      value={formData.postId}
                      onValueChange={(value) => setFormData({ ...formData, postId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer een post" />
                      </SelectTrigger>
                      <SelectContent>
                        {posts?.map((post) => (
                          <SelectItem key={post.id} value={post.id}>
                            {post.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sourceUrl">Source URL *</Label>
                    <Input
                      id="sourceUrl"
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                      placeholder="https://example.com/artikel"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anchorText">Anchor Text</Label>
                    <Input
                      id="anchorText"
                      value={formData.anchorText}
                      onChange={(e) => setFormData({ ...formData, anchorText: e.target.value })}
                      placeholder="klik hier"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkType">Link Type</Label>
                    <Select
                      value={formData.linkType}
                      onValueChange={(value) => setFormData({ ...formData, linkType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dofollow">Dofollow</SelectItem>
                        <SelectItem value="nofollow">Nofollow</SelectItem>
                        <SelectItem value="ugc">UGC</SelectItem>
                        <SelectItem value="sponsored">Sponsored</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contextSnippet">Context Snippet</Label>
                    <Textarea
                      id="contextSnippet"
                      value={formData.contextSnippet}
                      onChange={(e) => setFormData({ ...formData, contextSnippet: e.target.value })}
                      placeholder="De tekst rondom de backlink..."
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={() => addBacklinkMutation.mutate(formData)}
                    disabled={!formData.sourceUrl || addBacklinkMutation.isPending}
                    className="w-full"
                  >
                    {addBacklinkMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyseren...
                      </>
                    ) : (
                      'Toevoegen & Analyseren'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : backlinks && backlinks.length > 0 ? (
            <div className="space-y-3">
              {backlinks.map((backlink) => {
                const overallScore = calculateOverallScore(backlink);
                return (
                  <Card key={backlink.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(backlink.status)}
                            <a
                              href={backlink.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold hover:underline flex items-center gap-1"
                            >
                              {backlink.source_domain}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <Badge variant="outline">{backlink.link_type}</Badge>
                          </div>
                          {backlink.anchor_text && (
                            <p className="text-sm text-muted-foreground">
                              Anchor: <span className="font-medium">{backlink.anchor_text}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getQualityBadge(overallScore)}>
                            Score: {overallScore}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => reanalyzeBacklinkMutation.mutate(backlink)}
                            disabled={analyzing === backlink.id}
                          >
                            {analyzing === backlink.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Domain Authority</p>
                          <p className={`font-semibold ${getQualityColor(backlink.domain_authority)}`}>
                            {backlink.domain_authority}/100
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Spam Score</p>
                          <p className={`font-semibold ${getQualityColor(100 - backlink.spam_score)}`}>
                            {backlink.spam_score}/100
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Relevantie</p>
                          <p className={`font-semibold ${getQualityColor(backlink.relevance_score)}`}>
                            {backlink.relevance_score}/100
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Verkeer</p>
                          <p className="font-semibold">
                            {backlink.traffic_estimate?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {backlink.context_snippet && (
                        <p className="text-sm text-muted-foreground italic">
                          "{backlink.context_snippet}"
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Nog geen backlinks toegevoegd. Klik op "Backlink Toevoegen" om te beginnen.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
