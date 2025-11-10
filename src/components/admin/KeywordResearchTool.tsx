import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface KeywordSuggestion {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  relevanceScore: number;
}

interface Props {
  initialKeyword?: string;
  onSelectKeyword?: (keyword: string) => void;
}

export const KeywordResearchTool = ({ initialKeyword = '', onSelectKeyword }: Props) => {
  const [focusKeyword, setFocusKeyword] = useState(initialKeyword);
  const [keywords, setKeywords] = useState<KeywordSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const handleResearch = async () => {
    if (!focusKeyword.trim()) {
      toast({
        title: 'Focus keyword vereist',
        description: 'Voer een focus keyword in om te zoeken.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('keyword-research', {
        body: { focusKeyword: focusKeyword.trim() }
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

      setKeywords(data.keywords);
      toast({
        title: 'Keyword research voltooid',
        description: `${data.keywords.length} keywords gevonden.`,
      });
    } catch (error) {
      console.error('Error researching keywords:', error);
      toast({
        title: 'Fout bij keyword research',
        description: 'Er is iets misgegaan. Probeer het opnieuw.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'bg-green-500';
    if (difficulty < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'informational': return <Lightbulb className="h-4 w-4" />;
      case 'commercial': return <TrendingUp className="h-4 w-4" />;
      case 'transactional': return <Target className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Focus keyword..."
          value={focusKeyword}
          onChange={(e) => setFocusKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
        />
        <Button onClick={handleResearch} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          {loading ? 'Zoeken...' : 'Zoek Keywords'}
        </Button>
      </div>

      {keywords.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{keywords.length} Keyword Suggesties</h3>
            <p className="text-sm text-muted-foreground">
              Geschat zoekvolume en difficulty scores
            </p>
          </div>

          <div className="grid gap-3">
            {keywords.map((kw, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{kw.keyword}</h4>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getIntentIcon(kw.intent)}
                        <span className="capitalize">{kw.intent}</span>
                      </Badge>
                    </div>
                    
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>{kw.searchVolume.toLocaleString()} zoekvolume/maand</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getDifficultyColor(kw.difficulty)}`} />
                        <span>Difficulty: {kw.difficulty}/100</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>Relevantie: {kw.relevanceScore}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
