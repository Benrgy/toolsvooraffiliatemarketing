import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Video, CheckCircle, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RichSnippetPreviewProps {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
  featuredImage?: string;
  videoUrl?: string;
  reviewRating?: number;
  reviewCount?: number;
  factChecked?: boolean;
  expertReviewed?: boolean;
  schemaType?: string;
  baseUrl?: string;
}

export const RichSnippetPreview = ({
  title,
  metaTitle,
  metaDescription,
  slug,
  featuredImage,
  videoUrl,
  reviewRating,
  reviewCount,
  factChecked,
  expertReviewed,
  schemaType = 'BlogPosting',
  baseUrl = 'https://beginnenmetaffiliate.nl'
}: RichSnippetPreviewProps) => {
  const displayTitle = metaTitle || title || 'Jouw post titel';
  const displayDescription = metaDescription || 'Jouw meta beschrijving verschijnt hier. Maak het aantrekkelijk en informatief voor betere click-through rates.';
  const displayUrl = `${baseUrl}/blog/${slug || 'jouw-slug'}`;
  
  // Truncate title and description to match Google's limits
  const truncatedTitle = displayTitle.length > 60 ? displayTitle.substring(0, 57) + '...' : displayTitle;
  const truncatedDescription = displayDescription.length > 160 ? displayDescription.substring(0, 157) + '...' : displayDescription;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400 opacity-50" />
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }
    return stars;
  };

  const renderBasicSnippet = () => (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-sm">
        <span className="text-green-700 font-normal">{baseUrl}</span>
        <span className="text-gray-600">›</span>
        <span className="text-gray-600">blog</span>
        <span className="text-gray-600">›</span>
        <span className="text-gray-600">{slug || 'jouw-slug'}</span>
      </div>
      <div className="text-xl text-blue-600 hover:underline cursor-pointer font-normal">
        {truncatedTitle}
      </div>
      <div className="text-sm text-gray-600 leading-relaxed">
        {truncatedDescription}
      </div>
    </div>
  );

  const renderRichSnippet = () => (
    <div className="flex gap-4">
      {featuredImage && (
        <div className="flex-shrink-0">
          <img 
            src={featuredImage} 
            alt="Preview" 
            className="w-32 h-32 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-green-700 font-normal">{baseUrl}</span>
          <span className="text-gray-600">›</span>
          <span className="text-gray-600">blog</span>
        </div>
        <div className="text-xl text-blue-600 hover:underline cursor-pointer font-normal">
          {truncatedTitle}
        </div>
        
        {/* E-E-A-T Signals */}
        {(factChecked || expertReviewed) && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            {factChecked && (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Fact-checked
              </span>
            )}
            {expertReviewed && (
              <span className="flex items-center gap-1">
                <Award className="h-3 w-3 text-blue-600" />
                Expert-reviewed
              </span>
            )}
          </div>
        )}
        
        {/* Rating */}
        {reviewRating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStars(reviewRating)}
            </div>
            <span className="text-sm text-gray-600">
              {reviewRating.toFixed(1)} {reviewCount && `(${reviewCount} reviews)`}
            </span>
          </div>
        )}
        
        <div className="text-sm text-gray-600 leading-relaxed">
          {truncatedDescription}
        </div>
      </div>
    </div>
  );

  const renderVideoSnippet = () => (
    <div className="flex gap-4">
      <div className="flex-shrink-0 relative">
        <img 
          src={featuredImage || 'https://via.placeholder.com/180x100'} 
          alt="Video thumbnail" 
          className="w-44 h-28 object-cover rounded-lg"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-red-600 rounded-full p-3 hover:bg-red-700 cursor-pointer">
            <Video className="h-6 w-6 text-white" fill="white" />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-green-700 font-normal">{baseUrl}</span>
          <span className="text-gray-600">›</span>
          <span className="text-gray-600">blog</span>
        </div>
        <div className="text-xl text-blue-600 hover:underline cursor-pointer font-normal">
          {truncatedTitle}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Video className="h-3 w-3 mr-1" />
            Video
          </Badge>
          {reviewRating && (
            <div className="flex items-center gap-1">
              {renderStars(reviewRating)}
              <span className="text-xs text-gray-600 ml-1">
                {reviewRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-600 leading-relaxed">
          {truncatedDescription}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Google Search Preview</h3>
        <p className="text-sm text-muted-foreground">
          Zo ziet jouw post eruit in Google zoekresultaten
        </p>
      </div>

      <Tabs defaultValue="desktop" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="desktop">Desktop</TabsTrigger>
          <TabsTrigger value="rich">Rich Snippet</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
        </TabsList>

        <TabsContent value="desktop" className="space-y-4">
          <div className="bg-white p-6 rounded-lg border-2">
            {renderBasicSnippet()}
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Titel: {displayTitle.length}/60 karakters {displayTitle.length > 60 && '⚠️'}</p>
            <p>• Beschrijving: {displayDescription.length}/160 karakters {displayDescription.length > 160 && '⚠️'}</p>
          </div>
        </TabsContent>

        <TabsContent value="rich" className="space-y-4">
          <div className="bg-white p-6 rounded-lg border-2">
            {renderRichSnippet()}
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>✓ Featured image: {featuredImage ? 'Ja' : 'Nee'}</p>
            <p>✓ Rating: {reviewRating ? `${reviewRating}/5 (${reviewCount || 0} reviews)` : 'Geen'}</p>
            <p>✓ E-E-A-T signalen: {(factChecked || expertReviewed) ? 'Actief' : 'Geen'}</p>
          </div>
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <div className="bg-white p-6 rounded-lg border-2">
            {videoUrl ? renderVideoSnippet() : (
              <div className="text-center py-8 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Voeg een video URL toe om video snippet preview te zien</p>
              </div>
            )}
          </div>
          {videoUrl && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>✓ Video URL: Ja</p>
              <p>✓ Thumbnail: {featuredImage ? 'Ja' : 'Nee'}</p>
              <p>• Video snippets krijgen vaak hogere CTR in zoekresultaten</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Character counter warnings */}
      {(displayTitle.length > 60 || displayDescription.length > 160) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-yellow-800">⚠️ Aanbevelingen:</p>
          <ul className="text-sm text-yellow-700 space-y-1">
            {displayTitle.length > 60 && (
              <li>• Titel is te lang en wordt afgekapt in zoekresultaten</li>
            )}
            {displayDescription.length > 160 && (
              <li>• Beschrijving is te lang en wordt afgekapt in zoekresultaten</li>
            )}
          </ul>
        </div>
      )}

      {/* SEO Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-blue-800">💡 SEO Tips:</p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Gebruik power words in je titel voor betere CTR</li>
          <li>• Voeg een call-to-action toe in de beschrijving</li>
          <li>• Featured images verhogen de zichtbaarheid met 30-40%</li>
          {!reviewRating && <li>• Overweeg review schema toe te voegen voor hogere CTR</li>}
          {!videoUrl && schemaType === 'HowTo' && <li>• HowTo artikelen presteren beter met video content</li>}
        </ul>
      </div>
    </Card>
  );
};
