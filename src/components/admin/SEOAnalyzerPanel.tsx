import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { analyzeSEO, type SEOAnalysisResult } from '@/utils/seoAnalyzer';
import { useMemo } from 'react';

interface SEOAnalyzerPanelProps {
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  slug: string;
  featuredImageAlt?: string;
}

export const SEOAnalyzerPanel = (props: SEOAnalyzerPanelProps) => {
  const analysis: SEOAnalysisResult = useMemo(() => {
    return analyzeSEO(props);
  }, [props]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-accent';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Uitstekend';
    if (score >= 60) return 'Goed';
    if (score >= 40) return 'Matig';
    return 'Slecht';
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">SEO Analyse</h3>
          <Badge variant={analysis.score >= 80 ? 'default' : analysis.score >= 60 ? 'secondary' : 'destructive'}>
            {getScoreLabel(analysis.score)}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">SEO Score</span>
            <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}/100
            </span>
          </div>
          <Progress value={analysis.score} className="h-3" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Woorden</p>
          <p className="text-2xl font-semibold">{analysis.wordCount}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Leesbaarheid</p>
          <p className="text-2xl font-semibold">{analysis.readabilityScore}/100</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Interne Links</p>
          <p className="text-2xl font-semibold">{analysis.internalLinks}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Externe Links</p>
          <p className="text-2xl font-semibold">{analysis.externalLinks}</p>
        </div>
      </div>

      {props.focusKeyword && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Keyword Density</p>
          <p className="text-xl font-semibold">{analysis.keywordDensity}%</p>
          <p className="text-xs text-muted-foreground">Ideaal: 0.5-2.5%</p>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="font-semibold text-sm">Problemen & Verbeterpunten</h4>
        <div className="space-y-2">
          {analysis.issues.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription>
                Geen problemen gevonden! Je content is goed geoptimaliseerd.
              </AlertDescription>
            </Alert>
          ) : (
            analysis.issues.map((issue, index) => (
              <Alert key={index} variant={issue.type === 'error' ? 'destructive' : 'default'}>
                {issue.type === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : issue.type === 'warning' ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <span className="font-medium">{issue.field}:</span> {issue.message}
                </AlertDescription>
              </Alert>
            ))
          )}
        </div>
      </div>

      {analysis.recommendations.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Aanbevelingen
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
