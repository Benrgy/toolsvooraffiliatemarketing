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
import { ArrowLeft, Save, Eye, Wand2, Sparkles } from 'lucide-react';
import { ContentGenerationModal } from '@/components/admin/ContentGenerationModal';
import { cn } from '@/lib/utils';
import type { GenerationConfig } from '@/types/blog';

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
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [featured, setFeatured] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredImageAlt, setFeaturedImageAlt] = useState('');

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

    setTitle(data.title || '');
    setSlug(data.slug || '');
    setExcerpt(data.excerpt || '');
    setContent(data.content || '');
    setCategory(data.category || '');
    setStatus((data.status as 'draft' | 'published') || 'draft');
    setFeatured(data.featured || false);
    setMetaTitle(data.meta_title || '');
    setMetaDescription(data.meta_description || '');
    setFeaturedImage(data.featured_image || '');
    setFeaturedImageAlt(data.featured_image_alt || '');
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

    setLoading(true);

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
      featured_image: featuredImage,
      featured_image_alt: featuredImageAlt,
      author_id: user?.id,
      published_at: publish ? new Date().toISOString() : null,
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
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
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateSEO}
              disabled={isGeneratingSEO || !title}
              className="w-full mb-4"
            >
              <Sparkles className={cn("h-4 w-4 mr-2", isGeneratingSEO && "animate-spin")} />
              {isGeneratingSEO ? 'Genereren...' : 'Auto-genereer alle SEO metadata'}
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
              <Select value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Concept</SelectItem>
                  <SelectItem value="published">Gepubliceerd</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
