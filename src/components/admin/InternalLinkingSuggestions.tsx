import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface InternalLinkSuggestion {
  anchorText: string;
  targetSlug: string;
  context: string;
  relevanceScore: number;
  reasoning: string;
  targetPost: {
    title: string;
    slug: string;
    excerpt: string;
  };
}

interface Props {
  postId?: string;
  content: string;
  title: string;
  focusKeyword?: string;
  currentPostId?: string;
}

export const InternalLinkingSuggestions = ({ postId, content, title, focusKeyword, currentPostId }: Props) => {
  const [suggestions, setSuggestions] = useState<InternalLinkSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!content || !title) {
      toast({
        title: 'Content vereist',
        description: 'Voer eerst content en een titel in.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('internal-linking', {
        body: { 
          postId: postId || currentPostId || null,
          content: content.substring(0, 3000), // Limit content length
          title,
          focusKeyword 
        }
      });

      if (error) {
        if (error.message.includes('Rate limit')) {
          toast({
            title: 'Rate limit bereikt',
            description: 'Te veel verzoeken. Probeer het later opnieuw.',
            variant: 'destructive',
          });
        } else if (error.message.includes('Payment required')) {
          toast({
            title: 'Onvoldoende credits',
            description: 'Voeg credits toe aan je Lovable AI workspace.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      setSuggestions(data.suggestions);
      toast({
        title: 'Analyse voltooid',
        description: `${data.suggestions.length} link suggesties gevonden.`,
      });
    } catch (error) {
      console.error('Error analyzing internal links:', error);
      toast({
        title: 'Fout bij analyse',
        description: 'Er is iets misgegaan. Probeer het opnieuw.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMarkdown = (suggestion: InternalLinkSuggestion, index: number) => {
    const markdown = `[${suggestion.anchorText}](/blog/${suggestion.targetSlug})`;
    navigator.clipboard.writeText(markdown);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: 'Gekopieerd',
      description: 'Link markdown gekopieerd naar clipboard.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Internal Linking Suggesties</h3>
        <Button onClick={handleAnalyze} disabled={loading}>
          <Link2 className="h-4 w-4 mr-2" />
          {loading ? 'Analyseren...' : 'Analyseer Links'}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{suggestion.targetPost.title}</h4>
                      <Badge variant="outline">
                        Relevantie: {suggestion.relevanceScore}/100
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Anchor text: </span>
                        <code className="bg-muted px-2 py-1 rounded">{suggestion.anchorText}</code>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Context: </span>
                        <span>{suggestion.context}</span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Waarom: </span>
                        <span>{suggestion.reasoning}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyMarkdown(suggestion, index)}
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {suggestions.length === 0 && !loading && (
        <Card className="p-8 text-center text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Klik op "Analyseer Links" om interne link suggesties te krijgen</p>
        </Card>
      )}
    </div>
  );
};
