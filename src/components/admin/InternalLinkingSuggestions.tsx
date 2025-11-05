import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Link, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InternalLink {
  postId: string;
  title: string;
  slug: string;
  relevanceScore: number;
  suggestedAnchorText: string;
  context: string;
}

interface ExternalLinkSuggestion {
  url: string;
  title: string;
  relevanceScore: number;
  suggestedQuote: string;
  category: string;
}

interface InternalLinkingSuggestionsProps {
  content: string;
  title: string;
  focusKeyword?: string;
  currentPostId?: string;
  onInsertLink?: (url: string, anchorText: string) => void;
}

export const InternalLinkingSuggestions = ({
  content,
  title,
  focusKeyword,
  currentPostId,
  onInsertLink,
}: InternalLinkingSuggestionsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [internalLinks, setInternalLinks] = useState<InternalLink[]>([]);
  const [externalLinks, setExternalLinks] = useState<ExternalLinkSuggestion[]>([]);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleAnalyze = async () => {
    if (!content || content.length < 100) {
      toast({
        title: "Onvoldoende content",
        description: "Voeg eerst wat content toe om links te kunnen suggereren (minimaal 100 karakters).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('internal-linking', {
        body: {
          content,
          title,
          focusKeyword,
          excludePostId: currentPostId,
        },
      });

      if (error) throw error;

      setInternalLinks(data.internalLinks || []);
      setExternalLinks(data.externalLinks || []);

      toast({
        title: "Analyse compleet",
        description: `${data.internalLinks?.length || 0} interne en ${data.externalLinks?.length || 0} externe links gevonden.`,
      });
    } catch (error) {
      console.error('Error analyzing links:', error);
      toast({
        title: "Fout",
        description: "Kon geen link suggesties genereren. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'bg-success text-success-foreground';
    if (score >= 60) return 'bg-warning text-warning-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Research: 'bg-primary text-primary-foreground',
      Statistics: 'bg-accent text-accent-foreground',
      Guide: 'bg-secondary text-secondary-foreground',
      News: 'bg-warning text-warning-foreground',
      Tool: 'bg-success text-success-foreground',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [id]: true });
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [id]: false });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Link Suggesties
        </CardTitle>
        <CardDescription>
          Analyseer je content en krijg interne en externe link suggesties voor betere SEO
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleAnalyze}
          disabled={loading || !content}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyseren...
            </>
          ) : (
            'Analyseer Content'
          )}
        </Button>

        {(internalLinks.length > 0 || externalLinks.length > 0) && (
          <Tabs defaultValue="internal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="internal">
                Intern ({internalLinks.length})
              </TabsTrigger>
              <TabsTrigger value="external">
                Extern ({externalLinks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="internal" className="space-y-3 mt-4">
              {internalLinks.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    Geen interne link suggesties gevonden.
                  </AlertDescription>
                </Alert>
              ) : (
                internalLinks.map((link, index) => (
                  <Card key={link.postId} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{link.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            /{link.slug}
                          </p>
                        </div>
                        <Badge className={getRelevanceColor(link.relevanceScore)}>
                          {link.relevanceScore}%
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">{link.context}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-muted p-2 rounded text-xs">
                          <strong>Anchor text:</strong> {link.suggestedAnchorText}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(
                            `<a href="/${link.slug}">${link.suggestedAnchorText}</a>`,
                            `internal-${index}`
                          )}
                        >
                          {copiedStates[`internal-${index}`] ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="external" className="space-y-3 mt-4">
              {externalLinks.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    Geen externe link suggesties gevonden.
                  </AlertDescription>
                </Alert>
              ) : (
                externalLinks.map((link, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{link.title}</h4>
                            <Badge className={getCategoryColor(link.category)} variant="outline">
                              {link.category}
                            </Badge>
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            {link.url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <Badge className={getRelevanceColor(link.relevanceScore)}>
                          {link.relevanceScore}%
                        </Badge>
                      </div>
                      
                      <div className="bg-muted p-3 rounded text-xs space-y-2">
                        <p className="font-medium">Aanbevolen citaat:</p>
                        <p className="italic">"{link.suggestedQuote}"</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleCopy(link.suggestedQuote, `quote-${index}`)}
                        >
                          {copiedStates[`quote-${index}`] ? (
                            <>
                              <CheckCircle2 className="mr-2 h-3 w-3" />
                              Gekopieerd
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-3 w-3" />
                              Kopieer citaat
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleCopy(
                            `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.title}</a>`,
                            `link-${index}`
                          )}
                        >
                          {copiedStates[`link-${index}`] ? (
                            <>
                              <CheckCircle2 className="mr-2 h-3 w-3" />
                              Gekopieerd
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-3 w-3" />
                              Kopieer link
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
