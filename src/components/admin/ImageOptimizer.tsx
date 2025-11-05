import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Image, AlertCircle, CheckCircle, Download } from 'lucide-react';

interface ImageOptimizerProps {
  imageUrl: string;
  altText: string;
  onUpdate: (data: {
    alt: string;
    title: string;
    caption: string;
    width?: number;
    height?: number;
    format?: string;
  }) => void;
}

export const ImageOptimizer = ({ imageUrl, altText, onUpdate }: ImageOptimizerProps) => {
  const [alt, setAlt] = useState(altText || '');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [imageInfo, setImageInfo] = useState<{
    width?: number;
    height?: number;
    size?: number;
    format?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const analyzeImage = async () => {
    if (!imageUrl) return;
    
    setLoading(true);
    try {
      const img = document.createElement('img');
      img.onload = () => {
        const info = {
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: imageUrl.split('.').pop()?.toUpperCase() || 'UNKNOWN'
        };
        setImageInfo(info);
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('Image analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onUpdate({
      alt,
      title,
      caption,
      width: imageInfo.width,
      height: imageInfo.height,
      format: imageInfo.format
    });
  };

  const getOptimizationScore = () => {
    let score = 0;
    if (alt && alt.length > 10) score += 25;
    if (title && title.length > 5) score += 25;
    if (imageInfo.width && imageInfo.width <= 1920) score += 25;
    if (imageInfo.format === 'WEBP' || imageInfo.format === 'AVIF') score += 25;
    return score;
  };

  const score = getOptimizationScore();

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Image SEO Optimalisatie</h3>
        </div>
        <Badge variant={score >= 75 ? 'default' : score >= 50 ? 'secondary' : 'destructive'}>
          Score: {score}/100
        </Badge>
      </div>

      {imageUrl && (
        <div className="space-y-4">
          <div className="rounded-lg border overflow-hidden">
            <img 
              src={imageUrl} 
              alt={alt || 'Preview'} 
              className="w-full h-48 object-cover"
              onLoad={analyzeImage}
            />
          </div>

          {imageInfo.width && (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Dimensies</p>
                <p className="font-semibold">{imageInfo.width} × {imageInfo.height}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Format</p>
                <p className="font-semibold">{imageInfo.format}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Aspect Ratio</p>
                <p className="font-semibold">
                  {imageInfo.width && imageInfo.height 
                    ? `${(imageInfo.width / imageInfo.height).toFixed(2)}:1`
                    : 'N/A'}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Alert variant={alt.length > 10 ? 'default' : 'destructive'}>
              {alt.length > 10 ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {alt.length > 10 
                  ? 'Alt tekst is goed geoptimaliseerd!'
                  : 'Alt tekst is te kort. Gebruik 10-125 karakters voor beste resultaten.'}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="imageAlt">Alt Tekst * (SEO Kritiek)</Label>
              <Input
                id="imageAlt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Beschrijvende alt tekst met keywords..."
                maxLength={125}
              />
              <p className="text-xs text-muted-foreground">
                {alt.length}/125 karakters - Beschrijf wat er op de afbeelding staat
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageTitle">Title Attribuut</Label>
              <Input
                id="imageTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Image title voor tooltips..."
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Optioneel - Wordt getoond bij hover
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageCaption">Caption</Label>
              <Input
                id="imageCaption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Zichtbare caption onder de afbeelding..."
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Optioneel - Helpt context te geven
              </p>
            </div>
          </div>

          {imageInfo.format && imageInfo.format !== 'WEBP' && imageInfo.format !== 'AVIF' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Tip:</strong> Gebruik WebP of AVIF formaat voor betere prestaties en SEO.
                Deze moderne formaten zijn 25-35% kleiner dan JPEG/PNG.
              </AlertDescription>
            </Alert>
          )}

          {imageInfo.width && imageInfo.width > 1920 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Waarschuwing:</strong> Afbeelding is te groot ({imageInfo.width}px breed).
                Schaal terug naar max 1920px voor betere laadtijd.
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSave} className="w-full">
            Sla Optimalisaties Op
          </Button>
        </div>
      )}

      {!imageUrl && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Voeg eerst een featured image toe om de SEO optimalisaties te zien.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2 text-sm">
        <h4 className="font-semibold">Best Practices:</h4>
        <ul className="space-y-1 text-muted-foreground">
          <li>✓ Gebruik beschrijvende alt tekst met focus keyword</li>
          <li>✓ Houd afbeeldingen onder 200KB voor snelle laadtijd</li>
          <li>✓ Gebruik WebP/AVIF formaat waar mogelijk</li>
          <li>✓ Max breedte 1920px voor desktop displays</li>
          <li>✓ Aspect ratio 16:9 of 4:3 voor blog posts</li>
        </ul>
      </div>
    </Card>
  );
};
