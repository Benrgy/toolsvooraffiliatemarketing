import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import { ArrowLeft, Save, Eye, Wand2, Sparkles, Globe, Video, Award, Clock } from 'lucide-react';
import { ContentGenerationModal } from '@/components/admin/ContentGenerationModal';
import { SEOAnalyzerPanel } from '@/components/admin/SEOAnalyzerPanel';
import { ImageOptimizer } from '@/components/admin/ImageOptimizer';
import { RichSnippetPreview } from '@/components/admin/RichSnippetPreview';
import { StructuredDataValidator } from '@/components/admin/StructuredDataValidator';
import { KeywordResearchTool } from '@/components/admin/KeywordResearchTool';
import { InternalLinkingSuggestions } from '@/components/admin/InternalLinkingSuggestions';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { cn } from '@/lib/utils';
import type { GenerationConfig } from '@/types/blog';
import { Badge } from '@/components/ui/badge';

const postSchema = z.object({
  title: z.string().min(1, 'Titel is verplicht').max(200, 'Titel te lang'),
  slug: z.string().min(1, 'Slug is verplicht').max(200, 'Slug te lang'),
  excerpt: z.string().max(500, 'Excerpt te lang').optional(),
  content: z.string().min(1, 'Content is verplicht'),
  category: z.string().min(1, 'Categorie is verplicht'),
  meta_title: z.string().max(60, 'Meta titel mag max 60 karakters zijn').optional(),
  meta_description: z.string().max(160, 'Meta beschrijving mag max 160 karakters zijn').optional(),
  featured_image_alt: z.string().max(200, 'Alt tekst te lang').optional(),
});

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [publishedAt, setPublishedAt] = useState<Date | undefined>();
  const [featured, setFeatured] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredImageAlt, setFeaturedImageAlt] = useState('');
  const [featuredImageTitle, setFeaturedImageTitle] = useState('');
  const [featuredImageCaption, setFeaturedImageCaption] = useState('');

  // Advanced SEO fields
  const [focusKeyword, setFocusKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);
  const [articleTags, setArticleTags] = useState<string[]>([]);
  const [schemaType, setSchemaType] = useState('BlogPosting');
  
  // Geo-targeting
  const [geoTargetCountry, setGeoTargetCountry] = useState('NL');
  const [geoTargetLanguage, setGeoTargetLanguage] = useState('nl-NL');
  
  // Video schema
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  
  // E-E-A-T signals
  const [factChecked, setFactChecked] = useState(false);
  const [expertReviewed, setExpertReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>();
  const [reviewCount, setReviewCount] = useState<number>();

  // Social media
  const [twitterCardType, setTwitterCardType] = useState('summary_large_image');
  const [pinterestDescription, setPinterestDescription] = useState('');
  const [linkedinTitle, setLinkedinTitle] = useState('');

  // AI Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadPost();
    }
  }, [id]);

  useEffect(() => {
    if (!isEdit && title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title, isEdit]);

  const loadPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: 'Fout bij laden',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/admin/posts');
      return;
    }

    // Type assertion for new fields until types regenerate
    const post = data as any;

    setTitle(post.title || '');
    setSlug(post.slug || '');
    setExcerpt(post.excerpt || '');
    setContent(post.content || '');
    setCategory(post.category || '');
    setStatus((post.status as 'draft' | 'published' | 'scheduled') || 'draft');
    setFeatured(post.featured || false);
    if (post.published_at) {
      setPublishedAt(new Date(post.published_at));
    }
    setMetaTitle(post.meta_title || '');
    setMetaDescription(post.meta_description || '');
    setFeaturedImage(post.featured_image || '');
    setFeaturedImageAlt(post.featured_image_alt || '');
    setFeaturedImageTitle(post.featured_image_title || '');
    setFeaturedImageCaption(post.featured_image_caption || '');
    
    // Advanced SEO
    setFocusKeyword(post.focus_keyword || '');
    setSecondaryKeywords(post.secondary_keywords || []);
    setMetaKeywords(post.meta_keywords || []);
    setArticleTags(post.article_tags || []);
    setSchemaType(post.schema_type || 'BlogPosting');
    
    // Geo-targeting
    setGeoTargetCountry(post.geo_target_country || 'NL');
    setGeoTargetLanguage(post.geo_target_language || 'nl-NL');
    
    // Video
    setVideoUrl(post.video_url || '');
    setVideoThumbnailUrl(post.video_thumbnail_url || '');
    setVideoDuration(post.video_duration || '');
    setVideoDescription(post.video_description || '');
    
    // E-E-A-T
    setFactChecked(post.fact_checked || false);
    setExpertReviewed(post.expert_reviewed || false);
    setReviewRating(post.review_rating);
    setReviewCount(post.review_count);
    
    // Social
    setTwitterCardType(post.twitter_card_type || 'summary_large_image');
    setPinterestDescription(post.pinterest_description || '');
    setLinkedinTitle(post.linkedin_title || '');
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars except spaces/hyphens
      .replace(/\s+/g, '-')           // Replace spaces with single hyphen
      .replace(/-+/g, '-')            // Replace multiple hyphens with single
      .trim();                        // Trim whitespace
  };

  // AI Content Generation Handler
  const handleGenerateContent = async (config: GenerationConfig) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          title,
          wordCount: config.wordCount,
          keywords: config.keywords,
          includeFAQ: config.includeFAQ
        }
      });
      
      if (error) throw error;
      
      setContent(data.content);
      toast({
        title: 'Content gegenereerd! ✨',
        description: `${data.wordCount} woorden gegenereerd met ${data.keywordsUsed.length} keywords.`,
      });
      setShowContentModal(false);
    } catch (error) {
      console.error('Content generation error:', error);
      toast({
        title: 'Generatie mislukt',
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Image Generation Handler
  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { title }
      });
      
      if (error) throw error;
      
      setFeaturedImage(data.imageUrl);
      setFeaturedImageAlt(data.altText);
      toast({
        title: 'Afbeelding gegenereerd! 🎨',
        description: 'Hero image succesvol aangemaakt.',
      });
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: 'Image generatie mislukt',
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // AI SEO Generation Handler
  const handleGenerateSEO = async () => {
    setIsGeneratingSEO(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-seo', {
        body: { title, excerpt }
      });
      
      if (error) throw error;
      
      if (!excerpt) setExcerpt(data.excerpt);
      setMetaTitle(data.metaTitle);
      setMetaDescription(data.metaDescription);
      if (!featuredImageAlt && data.altText) {
        setFeaturedImageAlt(data.altText);
      }
      
      toast({
        title: 'SEO metadata gegenereerd! 🚀',
        description: 'Meta title en description zijn ingevuld.',
      });
    } catch (error) {
      console.error('SEO generation error:', error);
      toast({
        title: 'SEO generatie mislukt',
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  const handleSave = async (publish: boolean = false) => {
    try {
      postSchema.parse({
        title,
        slug,
        excerpt,
        content,
        category,
        meta_title: metaTitle,
        meta_description: metaDescription,
        featured_image_alt: featuredImageAlt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validatiefout',
          description: error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    // Validate scheduled posts
    if (status === 'scheduled' && !publishedAt) {
      toast({
        title: 'Validatiefout',
        description: 'Kies een publicatiedatum en tijd voor geplande posts',
        variant: 'destructive',
      });
      return;
    }

    if (status === 'scheduled' && publishedAt && publishedAt <= new Date()) {
      toast({
        title: 'Validatiefout',
        description: 'De publicatiedatum moet in de toekomst liggen',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    // Calculate word count and links
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const internalLinks = (content.match(/\[.*?\]\(\/.*?\)/g) || []).length;
    const externalLinks = (content.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []).length;

    const postData = {
      title,
      slug,
      excerpt,
      content,
      category,
      status: publish ? 'published' : status,
      featured,
      meta_title: metaTitle,
      meta_description: metaDescription,
      meta_keywords: metaKeywords,
      featured_image: featuredImage,
      featured_image_alt: featuredImageAlt,
      featured_image_title: featuredImageTitle,
      featured_image_caption: featuredImageCaption,
      focus_keyword: focusKeyword,
      secondary_keywords: secondaryKeywords,
      article_tags: articleTags,
      schema_type: schemaType,
      geo_target_country: geoTargetCountry,
      geo_target_language: geoTargetLanguage,
      video_url: videoUrl || null,
      video_thumbnail_url: videoThumbnailUrl || null,
      video_duration: videoDuration || null,
      video_description: videoDescription || null,
      video_upload_date: videoUrl ? new Date().toISOString() : null,
      fact_checked: factChecked,
      expert_reviewed: expertReviewed,
      review_rating: reviewRating || null,
      review_count: reviewCount || null,
      twitter_card_type: twitterCardType,
      pinterest_description: pinterestDescription || null,
      linkedin_title: linkedinTitle || null,
      word_count: wordCount,
      internal_links_count: internalLinks,
      external_links_count: externalLinks,
      author_id: user?.id,
      published_at: publish 
        ? new Date().toISOString() 
        : (status === 'scheduled' && publishedAt ? publishedAt.toISOString() : null),
    };

    if (isEdit) {
      const { error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', id);

      if (error) {
        toast({
          title: 'Opslaan mislukt',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Post opgeslagen',
          description: 'De wijzigingen zijn succesvol opgeslagen.',
        });
      }
    } else {
      const { error } = await supabase
        .from('posts')
        .insert([postData]);

      if (error) {
        toast({
          title: 'Aanmaken mislukt',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Post aangemaakt',
          description: 'De post is succesvol aangemaakt.',
        });
        navigate('/admin/posts');
      }
    }

    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/posts')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">
              {isEdit ? 'Post Bewerken' : 'Nieuwe Post'}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Opslaan
            </Button>
            <Button onClick={() => handleSave(true)} disabled={loading}>
              <Eye className="h-4 w-4 mr-2" />
              Publiceren
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="advanced">Geavanceerd</TabsTrigger>
            <TabsTrigger value="geo">Geo/Social</TabsTrigger>
            <TabsTrigger value="eeat">E-E-A-T</TabsTrigger>
            <TabsTrigger value="settings">Instellingen</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <div className="relative">
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Voer de post titel in..."
                  className="pr-12"
                />
                {title && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={() => setShowContentModal(true)}
                          disabled={isGenerating}
                        >
                          <Wand2 className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Genereer blog content met AI</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="post-slug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categorie *</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Affiliate Marketing"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Korte samenvatting..."
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                {excerpt.length}/500 karakters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Schrijf je artikel hier..."
                rows={15}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                {title && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleGenerateImage}
                          disabled={isGeneratingImage}
                        >
                          <Wand2 className={cn("h-4 w-4 mr-2", isGeneratingImage && "animate-spin")} />
                          {isGeneratingImage ? 'Genereren...' : 'AI Genereren'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Genereer blog image met AI</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <Input
                id="featuredImage"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {featuredImage && (
                <div className="mt-2 rounded-lg border overflow-hidden">
                  <img 
                    src={featuredImage} 
                    alt={featuredImageAlt || 'Featured image preview'} 
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImageAlt">Featured Image Alt Tekst</Label>
              <Input
                id="featuredImageAlt"
                value={featuredImageAlt}
                onChange={(e) => setFeaturedImageAlt(e.target.value)}
                placeholder="Beschrijving van de afbeelding"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImageTitle">Featured Image Title</Label>
              <Input
                id="featuredImageTitle"
                value={featuredImageTitle}
                onChange={(e) => setFeaturedImageTitle(e.target.value)}
                placeholder="Titel voor de afbeelding"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImageCaption">Featured Image Caption</Label>
              <Input
                id="featuredImageCaption"
                value={featuredImageCaption}
                onChange={(e) => setFeaturedImageCaption(e.target.value)}
                placeholder="Bijschrift voor de afbeelding"
              />
            </div>

            {featuredImage && (
              <ImageOptimizer
                imageUrl={featuredImage}
                altText={featuredImageAlt}
                onUpdate={(updates) => {
                  setFeaturedImageAlt(updates.alt);
                  setFeaturedImageTitle(updates.title || '');
                  setFeaturedImageCaption(updates.caption || '');
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <div className="space-y-6">
              <KeywordResearchTool 
                initialKeyword={focusKeyword}
                onSelectKeyword={(keyword) => setFocusKeyword(keyword)}
              />

              <InternalLinkingSuggestions
                content={content}
                title={title}
                focusKeyword={focusKeyword}
                currentPostId={id}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateSEO}
                    disabled={isGeneratingSEO || !title}
                    className="w-full"
                  >
                    <Sparkles className={cn("h-4 w-4 mr-2", isGeneratingSEO && "animate-spin")} />
                    {isGeneratingSEO ? 'Genereren...' : 'Auto-genereer SEO metadata'}
                  </Button>

                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Titel</Label>
                    <Input
                      id="metaTitle"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="SEO titel..."
                      maxLength={60}
                    />
                    <p className="text-sm text-muted-foreground">
                      {metaTitle.length}/60 karakters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Beschrijving</Label>
                    <Textarea
                      id="metaDescription"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="SEO beschrijving..."
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-sm text-muted-foreground">
                      {metaDescription.length}/160 karakters
                    </p>
                  </div>
                </div>

                <SEOAnalyzerPanel
                  title={title}
                  content={content}
                  metaTitle={metaTitle}
                  metaDescription={metaDescription}
                  focusKeyword={focusKeyword}
                  slug={slug}
                  featuredImageAlt={featuredImageAlt}
                />
              </div>

              <RichSnippetPreview
                title={title}
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                slug={slug}
                featuredImage={featuredImage}
                videoUrl={videoUrl}
                reviewRating={reviewRating}
                reviewCount={reviewCount}
                factChecked={factChecked}
                expertReviewed={expertReviewed}
                schemaType={schemaType}
              />

              <StructuredDataValidator
                title={title}
                content={content}
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                featuredImage={featuredImage}
                featuredImageAlt={featuredImageAlt}
                videoUrl={videoUrl}
                videoThumbnailUrl={videoThumbnailUrl}
                videoDuration={videoDuration}
                videoDescription={videoDescription}
                reviewRating={reviewRating}
                reviewCount={reviewCount}
                factChecked={factChecked}
                expertReviewed={expertReviewed}
                schemaType={schemaType}
                slug={slug}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="focusKeyword">Focus Keyword</Label>
              <Input
                id="focusKeyword"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="main keyword"
              />
              <p className="text-xs text-muted-foreground">Het primaire keyword voor deze post</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryKeywords">Secondary Keywords</Label>
              <Input
                id="secondaryKeywords"
                value={secondaryKeywords.join(', ')}
                onChange={(e) => setSecondaryKeywords(e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                placeholder="keyword 1, keyword 2, keyword 3"
              />
              <p className="text-xs text-muted-foreground">Komma-gescheiden lijst van gerelateerde keywords</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaKeywords">Meta Keywords</Label>
              <Input
                id="metaKeywords"
                value={metaKeywords.join(', ')}
                onChange={(e) => setMetaKeywords(e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-muted-foreground">Legacy meta keywords (optioneel)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="articleTags">Article Tags</Label>
              <Input
                id="articleTags"
                value={articleTags.join(', ')}
                onChange={(e) => setArticleTags(e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-muted-foreground">Tags voor de artikel classificatie</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schemaType">Schema Type</Label>
              <Select value={schemaType} onValueChange={setSchemaType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BlogPosting">Blog Posting</SelectItem>
                  <SelectItem value="Article">Article</SelectItem>
                  <SelectItem value="NewsArticle">News Article</SelectItem>
                  <SelectItem value="TechArticle">Tech Article</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="HowTo">How-To Guide</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Type structured data schema</p>
            </div>
          </TabsContent>

          <TabsContent value="geo" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Geo-Targeting
              </h3>

              <div className="space-y-2">
                <Label htmlFor="geoTargetCountry">Target Land</Label>
                <Select value={geoTargetCountry} onValueChange={setGeoTargetCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NL">Nederland</SelectItem>
                    <SelectItem value="BE">België</SelectItem>
                    <SelectItem value="US">Verenigde Staten</SelectItem>
                    <SelectItem value="GB">Verenigd Koninkrijk</SelectItem>
                    <SelectItem value="DE">Duitsland</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="geoTargetLanguage">Target Taal</Label>
                <Select value={geoTargetLanguage} onValueChange={setGeoTargetLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nl-NL">Nederlands (NL)</SelectItem>
                    <SelectItem value="nl-BE">Nederlands (BE)</SelectItem>
                    <SelectItem value="en-US">Engels (US)</SelectItem>
                    <SelectItem value="en-GB">Engels (GB)</SelectItem>
                    <SelectItem value="de-DE">Duits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Social Media Optimalisatie</h3>

              <div className="space-y-2">
                <Label htmlFor="twitterCardType">Twitter Card Type</Label>
                <Select value={twitterCardType} onValueChange={setTwitterCardType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pinterestDescription">Pinterest Description</Label>
                <Textarea
                  id="pinterestDescription"
                  value={pinterestDescription}
                  onChange={(e) => setPinterestDescription(e.target.value)}
                  placeholder="Aangepaste beschrijving voor Pinterest..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinTitle">LinkedIn Title Override</Label>
                <Input
                  id="linkedinTitle"
                  value={linkedinTitle}
                  onChange={(e) => setLinkedinTitle(e.target.value)}
                  placeholder="Aangepaste titel voor LinkedIn"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="eeat" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5" />
                E-E-A-T Signalen
              </h3>
              <p className="text-sm text-muted-foreground">
                Experience, Expertise, Authoritativeness, Trustworthiness
              </p>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Fact Checked</Label>
                  <p className="text-sm text-muted-foreground">Content is geverifieerd en fact-checked</p>
                </div>
                <Switch checked={factChecked} onCheckedChange={setFactChecked} />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Expert Reviewed</Label>
                  <p className="text-sm text-muted-foreground">Content is gereviewed door een expert</p>
                </div>
                <Switch checked={expertReviewed} onCheckedChange={setExpertReviewed} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewRating">Review Rating (1-5)</Label>
                <Input
                  id="reviewRating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={reviewRating || ''}
                  onChange={(e) => setReviewRating(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="4.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewCount">Review Count</Label>
                <Input
                  id="reviewCount"
                  type="number"
                  min="0"
                  value={reviewCount || ''}
                  onChange={(e) => setReviewCount(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="42"
                />
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Schema
              </h3>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {videoUrl && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="videoThumbnailUrl">Video Thumbnail URL</Label>
                    <Input
                      id="videoThumbnailUrl"
                      value={videoThumbnailUrl}
                      onChange={(e) => setVideoThumbnailUrl(e.target.value)}
                      placeholder="https://img.youtube.com/vi/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="videoDuration">Video Duration (ISO 8601)</Label>
                    <Input
                      id="videoDuration"
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(e.target.value)}
                      placeholder="PT10M30S"
                    />
                    <p className="text-xs text-muted-foreground">Formaat: PT[uur]H[minuten]M[seconden]S (bijv. PT10M30S)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="videoDescription">Video Beschrijving</Label>
                    <Textarea
                      id="videoDescription"
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="Beschrijving van de video..."
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Featured Post</Label>
                <p className="text-sm text-muted-foreground">
                  Toon deze post als featured op de homepage
                </p>
              </div>
              <Switch
                checked={featured}
                onCheckedChange={setFeatured}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: 'draft' | 'published' | 'scheduled') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Concept</SelectItem>
                  <SelectItem value="published">Gepubliceerd</SelectItem>
                  <SelectItem value="scheduled">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Gepland
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status === 'scheduled' && (
              <div className="space-y-2">
                <Label>Publicatiedatum en tijd</Label>
                <DateTimePicker
                  date={publishedAt}
                  setDate={setPublishedAt}
                  placeholder="Kies wanneer de post gepubliceerd moet worden"
                />
                <p className="text-sm text-muted-foreground">
                  De post wordt automatisch gepubliceerd op het gekozen moment
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Content Generation Modal */}
        <ContentGenerationModal
          open={showContentModal}
          onOpenChange={setShowContentModal}
          title={title}
          onGenerate={handleGenerateContent}
          isGenerating={isGenerating}
        />
      </div>
    </AdminLayout>
  );
}
