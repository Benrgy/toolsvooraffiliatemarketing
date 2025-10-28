import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles } from 'lucide-react';
import type { GenerationConfig } from '@/types/blog';

interface ContentGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onGenerate: (config: GenerationConfig) => Promise<void>;
  isGenerating: boolean;
}

export function ContentGenerationModal({
  open,
  onOpenChange,
  title,
  onGenerate,
  isGenerating,
}: ContentGenerationModalProps) {
  const [wordCount, setWordCount] = useState<500 | 750 | 1000 | 1250 | 1500>(1000);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [includeFAQ, setIncludeFAQ] = useState(true);

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && keywords.length < 5 && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleGenerate = async () => {
    await onGenerate({
      wordCount,
      keywords,
      includeFAQ,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Content Generatie
          </DialogTitle>
          <DialogDescription>
            Configureer de AI om jouw blog post te genereren voor: <span className="font-semibold">"{title}"</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Word Count */}
          <div className="space-y-2">
            <Label htmlFor="wordCount">Woordenaantal</Label>
            <Select 
              value={wordCount.toString()} 
              onValueChange={(value) => setWordCount(parseInt(value) as 500 | 750 | 1000 | 1250 | 1500)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500">500 woorden (kort)</SelectItem>
                <SelectItem value="750">750 woorden</SelectItem>
                <SelectItem value="1000">1000 woorden (standaard)</SelectItem>
                <SelectItem value="1250">1250 woorden</SelectItem>
                <SelectItem value="1500">1500 woorden (uitgebreid)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label htmlFor="keywords">
              SEO Keywords 
              <span className="text-sm text-muted-foreground ml-2">
                ({keywords.length}/5)
              </span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="keywords"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Voeg keyword toe..."
                disabled={keywords.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddKeyword}
                disabled={keywords.length >= 5 || !keywordInput.trim()}
              >
                Toevoegen
              </Button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="gap-1">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Keywords worden natuurlijk verwerkt in de content (max 5)
            </p>
          </div>

          {/* FAQ Toggle */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="includeFAQ">FAQ Sectie Toevoegen</Label>
              <p className="text-xs text-muted-foreground">
                Voeg een FAQ sectie toe met 3-4 vragen
              </p>
            </div>
            <Switch
              id="includeFAQ"
              checked={includeFAQ}
              onCheckedChange={setIncludeFAQ}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Annuleren
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !title}
          >
            <Sparkles className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Genereren...' : 'Genereer Content'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
