import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, TrendingUp, Target, Eye, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KeywordSuggestion {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  relevanceScore: number;
}

interface KeywordResearchToolProps {
  initialKeyword?: string;
  onSelectKeyword?: (keyword: string) => void;
}

export const KeywordResearchTool = ({ initialKeyword = '', onSelectKeyword }: KeywordResearchToolProps) => {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KeywordSuggestion[]>([]);
  const [disclaimer, setDisclaimer] = useState('');
  const { toast } = useToast();

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    if (difficulty < 60) return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 30) return "Makkelijk";
    if (difficulty < 60) return "Gemiddeld";
    return "Moeilijk";
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'informational': return <Eye className="h-4 w-4" />;
      case 'commercial': return <TrendingUp className="h-4 w-4" />;
      case 'transactional': return <Target className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getIntentLabel = (intent: string) => {
    const labels: Record<string, string> = {
      informational: 'Informatie',
      commercial: 'Commercieel',
      transactional: 'Transactie',
      navigational: 'Navigatie'
    };
    return labels[intent] || intent;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k`;
    return volume.toString();
  };

  const handleResearch = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Keyword vereist",
        description: "Voer een focus keyword in om te analyseren",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('keyword-research', {
        body: { focusKeyword: keyword.trim(), country: 'NL', language: 'nl' }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.keywords || []);
      setDisclaimer(data.metadata?.disclaimer || '');

      toast({
        title: "Keyword research voltooid",
        description: `${data.keywords?.length || 0} keyword suggesties gevonden`,
      });

    } catch (error: any) {
      console.error('Keyword research error:', error);
      toast({
        title: "Keyword research mislukt",
        description: error.message || "Er is een fout opgetreden bij het ophalen van keyword suggesties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordClick = (selectedKeyword: string) => {
    if (onSelectKeyword) {
      onSelectKeyword(selectedKeyword);
      toast({
        title: "Keyword geselecteerd",
        description: `"${selectedKeyword}" is ingesteld als focus keyword`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Keyword Research Tool
        </CardTitle>
        <CardDescription>
          Ontdek gerelateerde keywords met search volume en difficulty data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Voer een focus keyword in..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
            disabled={loading}
          />
          <Button onClick={handleResearch} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyseren...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyseer
              </>
            )}
          </Button>
        </div>

        {disclaimer && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{disclaimer}</AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Keyword Suggesties ({results.length})</h3>
            <div className="grid gap-2 max-h-[500px] overflow-y-auto">
              {results.map((result, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleKeywordClick(result.keyword)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{result.keyword}</span>
                          <Badge variant="outline" className="gap-1">
                            {getIntentIcon(result.intent)}
                            <span className="text-xs">{getIntentLabel(result.intent)}</span>
                          </Badge>
                        </div>
                        
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Volume:</span>
                            <span className="font-medium">{formatVolume(result.searchVolume)}/mo</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Relevantie:</span>
                            <span className="font-medium">{result.relevanceScore}%</span>
                          </div>
                        </div>
                      </div>

                      <Badge className={getDifficultyColor(result.difficulty)}>
                        {getDifficultyLabel(result.difficulty)} ({result.difficulty})
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && keyword && (
          <Alert>
            <AlertDescription>
              Geen resultaten gevonden. Probeer een ander keyword.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
