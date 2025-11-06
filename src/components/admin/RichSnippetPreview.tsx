import { Card } from '@/components/ui/card';
import { Star, User, Calendar } from 'lucide-react';

interface Props {
  title: string;
  metaDescription: string;
  author?: string;
  publishDate?: string;
  rating?: number;
  reviewCount?: number;
}

export const RichSnippetPreview = ({
  title,
  metaDescription,
  author,
  publishDate,
  rating,
  reviewCount,
}: Props) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Rich Snippet Preview</h3>
      
      <Card className="p-4 bg-background">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>example.com › blog › article</span>
          </div>
          
          <h4 className="text-xl text-blue-600 hover:underline cursor-pointer font-normal">
            {title || 'Artikel Titel'}
          </h4>
          
          {(author || publishDate) && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {author && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{author}</span>
                </div>
              )}
              {publishDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(publishDate).toLocaleDateString('nl-NL')}</span>
                </div>
              )}
            </div>
          )}
          
          {rating && reviewCount && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {rating.toFixed(1)} · {reviewCount} reviews
              </span>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            {metaDescription || 'Meta beschrijving van het artikel verschijnt hier...'}
          </p>
        </div>
      </Card>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>💡 Tips voor betere rich snippets:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Gebruik duidelijke, aantrekkelijke titels (50-60 karakters)</li>
          <li>Schrijf overtuigende meta descriptions (150-160 karakters)</li>
          <li>Voeg structured data toe voor ratings en reviews</li>
          <li>Include author en publish date in je structured data</li>
        </ul>
      </div>
    </div>
  );
};
