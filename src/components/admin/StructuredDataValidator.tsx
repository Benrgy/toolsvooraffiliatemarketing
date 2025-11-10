import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertTriangle, Code } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  metadata: {
    validatedAt: string;
    schemaType: string;
  };
}

interface Props {
  title?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  videoUrl?: string;
  videoThumbnailUrl?: string;
  videoDuration?: string;
  videoDescription?: string;
  reviewRating?: number;
  reviewCount?: number;
  factChecked?: boolean;
  expertReviewed?: boolean;
  schemaType?: string;
  slug?: string;
}

export const StructuredDataValidator = (props: Props) => {
  const [structuredData, setStructuredData] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    if (!structuredData.trim()) {
      toast({
        title: 'Structured data vereist',
        description: 'Voer structured data in om te valideren.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-structured-data', {
        body: { structuredData: structuredData.trim() }
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

      setResult(data);
      toast({
        title: 'Validatie voltooid',
        description: data.valid ? 'Structured data is valide!' : 'Er zijn problemen gevonden.',
        variant: data.valid ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Error validating structured data:', error);
      toast({
        title: 'Fout bij validatie',
        description: 'Er is iets misgegaan. Probeer het opnieuw.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    const example = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "De Ultieme Gids voor SEO in 2024",
      "image": "https://example.com/image.jpg",
      "author": {
        "@type": "Person",
        "name": "Jan Jansen"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Mijn Website",
        "logo": {
          "@type": "ImageObject",
          "url": "https://example.com/logo.jpg"
        }
      },
      "datePublished": "2024-01-01",
      "dateModified": "2024-01-15"
    };
    setStructuredData(JSON.stringify(example, null, 2));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Structured Data Validator</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadExample}>
            <Code className="h-4 w-4 mr-2" />
            Laad Voorbeeld
          </Button>
          <Button onClick={handleValidate} disabled={loading}>
            {loading ? 'Valideren...' : 'Valideer Schema'}
          </Button>
        </div>
      </div>

      <Textarea
        placeholder="Plak hier je Schema.org JSON-LD structured data..."
        value={structuredData}
        onChange={(e) => setStructuredData(e.target.value)}
        rows={12}
        className="font-mono text-sm"
      />

      {result && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              {result.valid ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <div>
                    <h4 className="font-semibold">Structured Data is Valide</h4>
                    <p className="text-sm text-muted-foreground">
                      Schema Type: {result.metadata.schemaType}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <h4 className="font-semibold">Problemen Gevonden</h4>
                    <p className="text-sm text-muted-foreground">
                      {result.errors.length} errors, {result.warnings.length} warnings
                    </p>
                  </div>
                </>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  <XCircle className="h-4 w-4" />
                  <span>Errors</span>
                </div>
                {result.errors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {result.warnings.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-yellow-600 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Warnings</span>
                </div>
                {result.warnings.map((warning, index) => (
                  <Alert key={index}>
                    <AlertDescription>{warning}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {result.suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Suggesties voor Verbetering</span>
                </div>
                <div className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="mt-0.5">
                        {index + 1}
                      </Badge>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
