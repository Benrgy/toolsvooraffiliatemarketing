import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, RefreshCw, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  path?: string;
}

interface ValidationResult {
  valid: boolean;
  schemaType: string;
  issues: ValidationIssue[];
  score: number;
}

interface StructuredDataValidatorProps {
  title: string;
  content: string;
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
  slug: string;
}

export const StructuredDataValidator = (props: StructuredDataValidatorProps) => {
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [schema, setSchema] = useState<any>(null);

  const generateSchema = () => {
    const baseUrl = 'https://beginnenmetaffiliate.nl';
    
    const blogSchema = {
      '@context': 'https://schema.org',
      '@type': props.schemaType || 'BlogPosting',
      headline: props.metaTitle || props.title,
      description: props.metaDescription,
      image: props.featuredImage ? [props.featuredImage] : [],
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      author: {
        '@type': 'Person',
        name: 'Admin',
        url: baseUrl
      },
      publisher: {
        '@type': 'Organization',
        name: 'Beginnen met Affiliate',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}/blog/${props.slug}`
      }
    };

    return blogSchema;
  };

  const handleValidate = async () => {
    setValidating(true);
    setResult(null);

    try {
      const generatedSchema = generateSchema();
      setSchema(generatedSchema);

      const { data, error } = await supabase.functions.invoke('validate-structured-data', {
        body: { schema: generatedSchema }
      });

      if (error) throw error;

      setResult(data);

      if (data.valid) {
        toast({
          title: 'Schema is valide! ✅',
          description: `Score: ${data.score}/100`,
        });
      } else {
        toast({
          title: 'Schema bevat fouten',
          description: `${data.issues.filter((i: ValidationIssue) => i.type === 'error').length} error(s) gevonden`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: 'Validatie mislukt',
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden',
        variant: 'destructive',
      });
    } finally {
      setValidating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Structured Data Validator</h3>
          <p className="text-sm text-muted-foreground">
            Test je JSON-LD schema volgens Google's richtlijnen
          </p>
        </div>
        <Button onClick={handleValidate} disabled={validating}>
          <RefreshCw className={cn("h-4 w-4 mr-2", validating && "animate-spin")} />
          {validating ? 'Valideren...' : 'Valideer Schema'}
        </Button>
      </div>

      {result && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Resultaten</TabsTrigger>
            <TabsTrigger value="schema">Schema Code</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                {result.valid ? (
                  <CheckCircle2 className="h-8 w-8 text-success" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-destructive" />
                )}
                <div>
                  <p className="font-semibold">
                    {result.valid ? 'Schema is valide!' : 'Schema bevat fouten'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Type: {result.schemaType}
                  </p>
                </div>
              </div>
              <Badge variant={getScoreBadge(result.score)} className="text-lg px-4 py-2">
                {result.score}/100
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Validatie Score</span>
                <span className={cn("font-bold", getScoreColor(result.score))}>
                  {result.score}%
                </span>
              </div>
              <Progress value={result.score} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950">
                <p className="text-2xl font-bold text-red-600">
                  {result.issues.filter(i => i.type === 'error').length}
                </p>
                <p className="text-sm text-red-600">Errors</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                <p className="text-2xl font-bold text-yellow-600">
                  {result.issues.filter(i => i.type === 'warning').length}
                </p>
                <p className="text-sm text-yellow-600">Warnings</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                <p className="text-2xl font-bold text-blue-600">
                  {result.issues.filter(i => i.type === 'info').length}
                </p>
                <p className="text-sm text-blue-600">Info</p>
              </div>
            </div>

            {result.issues.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Issues</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {result.issues.map((issue, index) => (
                    <Alert key={index} variant={issue.type === 'error' ? 'destructive' : 'default'}>
                      {getIssueIcon(issue.type)}
                      <AlertDescription>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <span className="font-medium">{issue.field}:</span> {issue.message}
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {issue.type}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {result.valid && (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription>
                  <p className="font-medium">Perfect! Je schema is volledig valide.</p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>✓ Alle verplichte velden zijn aanwezig</li>
                    <li>✓ Schema volgt Google's richtlijnen</li>
                    <li>✓ Klaar voor gebruik in productie</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="schema" className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span className="text-sm font-medium">JSON-LD Schema</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
                    toast({ title: 'Schema gekopieerd!' });
                  }}
                >
                  Kopieer
                </Button>
              </div>
              <pre className="text-xs overflow-x-auto max-h-96 p-4 bg-background rounded border">
                {JSON.stringify(schema, null, 2)}
              </pre>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Test met Google's Rich Results Test</p>
                <p className="text-sm mt-1">
                  Kopieer deze code en test het op:{' '}
                  <a
                    href="https://search.google.com/test/rich-results"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Rich Results Test
                  </a>
                </p>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      )}

      {!result && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Klik op "Valideer Schema" om je structured data te testen volgens Google's richtlijnen.
            De validator controleert op verplichte velden, aanbevolen eigenschappen, en schema.org compliance.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};
