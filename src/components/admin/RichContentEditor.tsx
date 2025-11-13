import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon, Video, Upload, Loader2, Link, FileCode, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Props {
  content: string;
  onChange: (content: string) => void;
  mode?: 'html' | 'markdown';
  onModeChange?: (mode: 'html' | 'markdown') => void;
}

export const RichContentEditor = ({ content, onChange, mode = 'html', onModeChange }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Image upload dialog state
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAlt, setImageAlt] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imagePosition, setImagePosition] = useState<'left' | 'center' | 'right'>('center');
  const [imageGeoTag, setImageGeoTag] = useState('');
  
  // Video embed dialog state
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');

  const optimizeImage = async (file: File): Promise<{ webp: Blob; jpeg: Blob }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      img.onload = () => {
        // Set maximum dimensions
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1920;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Generate both WebP and JPEG for fallback support
        let webpBlob: Blob | null = null;
        let jpegBlob: Blob | null = null;

        // First create WebP
        canvas.toBlob(
          (blob) => {
            if (blob) {
              webpBlob = blob;
              
              // Then create JPEG fallback
              canvas.toBlob(
                (jpegBlobResult) => {
                  if (jpegBlobResult) {
                    jpegBlob = jpegBlobResult;
                    
                    const originalSizeKB = Math.round(file.size / 1024);
                    const webpSizeKB = Math.round(webpBlob!.size / 1024);
                    const jpegSizeKB = Math.round(jpegBlob.size / 1024);
                    console.log(`Image optimized: ${originalSizeKB}KB → WebP: ${webpSizeKB}KB, JPEG fallback: ${jpegSizeKB}KB`);
                    
                    resolve({ webp: webpBlob!, jpeg: jpegBlob });
                  } else {
                    reject(new Error('Failed to create JPEG blob'));
                  }
                },
                'image/jpeg',
                0.85 // 85% quality for JPEG fallback
              );
            } else {
              reject(new Error('Failed to create WebP blob'));
            }
          },
          'image/webp',
          0.90 // 90% quality for WebP
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);
    
    const newContent = before + text + after;
    onChange(newContent);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const getImageMarkup = (webpUrl: string, jpegUrl: string, alt: string, title: string, caption: string, position: string) => {
    if (mode === 'markdown') {
      // Markdown doesn't support picture element, use WebP as primary
      let markup = `![${alt}](${webpUrl}${title ? ` "${title}"` : ''})`;
      if (caption) {
        markup += `\n*${caption}*`;
      }
      return markup;
    } else {
      // HTML mode with picture element for fallback support
      const alignClass = position === 'center' ? 'mx-auto' : position === 'right' ? 'ml-auto' : 'mr-auto';
      let html = `<figure class="my-6 ${alignClass}">\n`;
      html += `  <picture>\n`;
      html += `    <source srcset="${webpUrl}" type="image/webp">\n`;
      html += `    <img src="${jpegUrl}" alt="${alt}"${title ? ` title="${title}"` : ''} class="rounded-lg shadow-md w-full" loading="lazy" />\n`;
      html += `  </picture>\n`;
      if (caption) {
        html += `  <figcaption class="text-center text-sm text-muted-foreground mt-2">${caption}</figcaption>\n`;
      }
      html += `</figure>`;
      return html;
    }
  };

  const getVideoMarkup = (embedUrl: string, title: string, description: string) => {
    if (mode === 'markdown') {
      let markup = `[![${title || 'Video'}](${embedUrl.replace('/embed/', '/vi/').replace('player.vimeo.com/video/', 'i.vimeocdn.com/video/')}/0.jpg)](${embedUrl})`;
      if (description) {
        markup += `\n*${description}*`;
      }
      return markup;
    } else {
      // HTML mode
      let html = `<div class="video-container my-6">\n`;
      html += `  <iframe src="${embedUrl}" ${title ? `title="${title}"` : ''} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full aspect-video rounded-lg shadow-md"></iframe>\n`;
      if (description) {
        html += `  <p class="text-center text-sm text-muted-foreground mt-2">${description}</p>\n`;
      }
      html += `</div>`;
      return html;
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast({
        title: 'Geen bestand geselecteerd',
        description: 'Selecteer een afbeelding om te uploaden.',
        variant: 'destructive',
      });
      return;
    }

    if (!imageAlt) {
      toast({
        title: 'Alt tekst verplicht',
        description: 'Voer alt tekst in voor SEO en toegankelijkheid.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // Optimize image before upload (generates both WebP and JPEG)
      const { webp, jpeg } = await optimizeImage(imageFile);
      
      // Upload both formats to Supabase Storage
      const baseFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const webpPath = `content/${baseFileName}.webp`;
      const jpegPath = `content/${baseFileName}.jpg`;

      // Upload WebP
      const { error: webpError } = await supabase.storage
        .from('blog-images')
        .upload(webpPath, webp);

      if (webpError) throw webpError;

      // Upload JPEG fallback
      const { error: jpegError } = await supabase.storage
        .from('blog-images')
        .upload(jpegPath, jpeg);

      if (jpegError) throw jpegError;

      // Get public URLs
      const { data: { publicUrl: webpUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(webpPath);

      const { data: { publicUrl: jpegUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(jpegPath);

      // Insert image markup (HTML or Markdown)
      const imageMarkup = getImageMarkup(webpUrl, jpegUrl, imageAlt, imageTitle, imageCaption, imagePosition);
      insertAtCursor(imageMarkup);
      
      // Reset form
      setShowImageDialog(false);
      setImageFile(null);
      setImageAlt('');
      setImageTitle('');
      setImageCaption('');
      setImagePosition('center');
      setImageGeoTag('');

      toast({
        title: 'Afbeelding toegevoegd',
        description: 'De afbeelding is succesvol geüpload en ingevoegd.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload mislukt',
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoEmbed = () => {
    if (!videoUrl) {
      toast({
        title: 'Geen URL opgegeven',
        description: 'Voer een YouTube of Vimeo URL in.',
        variant: 'destructive',
      });
      return;
    }

    // Parse video URL
    let embedUrl = '';
    
    // YouTube
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch) {
      embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    if (!embedUrl) {
      toast({
        title: "Ongeldige URL",
        description: "Voer een geldige YouTube of Vimeo URL in.",
        variant: "destructive",
      });
      return;
    }

    // Insert video markup (HTML or Markdown)
    const videoMarkup = getVideoMarkup(embedUrl, videoTitle, videoDescription);
    insertAtCursor(videoMarkup);
    setShowVideoDialog(false);
    setVideoUrl('');
    setVideoTitle('');
    setVideoDescription('');

    toast({
      title: 'Video toegevoegd',
      description: 'De video is succesvol ingevoegd.',
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast({
        title: 'Geen afbeeldingen gevonden',
        description: 'Sleep alleen afbeeldingen naar dit veld.',
        variant: 'destructive',
      });
      return;
    }

    // Process first image file
    const file = imageFiles[0];
    
    setUploading(true);
    try {
      // Optimize image before upload (generates both WebP and JPEG)
      const { webp, jpeg } = await optimizeImage(file);
      
      // Upload both formats to Supabase Storage
      const baseFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const webpPath = `content/${baseFileName}.webp`;
      const jpegPath = `content/${baseFileName}.jpg`;

      // Upload WebP
      const { error: webpError } = await supabase.storage
        .from('blog-images')
        .upload(webpPath, webp);

      if (webpError) throw webpError;

      // Upload JPEG fallback
      const { error: jpegError } = await supabase.storage
        .from('blog-images')
        .upload(jpegPath, jpeg);

      if (jpegError) throw jpegError;

      // Get public URLs
      const { data: { publicUrl: webpUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(webpPath);

      const { data: { publicUrl: jpegUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(jpegPath);

      // Generate simple alt text from filename
      const simpleAlt = file.name.split('.')[0].replace(/[-_]/g, ' ');
      
      // Insert image markup (HTML or Markdown)
      const imageMarkup = getImageMarkup(webpUrl, jpegUrl, simpleAlt, '', '', 'center');
      insertAtCursor(imageMarkup);

      toast({
        title: 'Afbeelding toegevoegd',
        description: 'Je kunt de SEO attributen later aanpassen via de afbeelding knop.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload mislukt',
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="content">Content *</Label>
        <div className="flex gap-2">
          <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <ImageIcon className="h-4 w-4 mr-2" />
                Afbeelding
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Afbeelding Invoegen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-file">Afbeelding Bestand *</Label>
                  <Input
                    id="image-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="image-alt">Alt Tekst * (SEO)</Label>
                  <Input
                    id="image-alt"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Beschrijving van de afbeelding"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Belangrijk voor SEO en toegankelijkheid
                  </p>
                </div>

                <div>
                  <Label htmlFor="image-title">Titel (SEO)</Label>
                  <Input
                    id="image-title"
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                    placeholder="Titel bij hover"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="image-caption">Bijschrift</Label>
                  <Input
                    id="image-caption"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Optioneel bijschrift onder afbeelding"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="image-position">Positie</Label>
                  <Select value={imagePosition} onValueChange={(v: any) => setImagePosition(v)}>
                    <SelectTrigger id="image-position" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Links</SelectItem>
                      <SelectItem value="center">Gecentreerd</SelectItem>
                      <SelectItem value="right">Rechts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="image-geo">Geo Tag (Optioneel)</Label>
                  <Input
                    id="image-geo"
                    value={imageGeoTag}
                    onChange={(e) => setImageGeoTag(e.target.value)}
                    placeholder="Bijv. Amsterdam, Nederland"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Voor lokale SEO optimalisatie
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleImageUpload}
                  disabled={uploading || !imageFile || !imageAlt}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploaden...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Invoegen
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Video className="h-4 w-4 mr-2" />
                Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Video Invoegen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="video-url">YouTube of Vimeo URL *</Label>
                  <Input
                    id="video-url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="video-title">Video Titel (SEO)</Label>
                  <Input
                    id="video-title"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Titel voor SEO"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="video-description">Beschrijving (SEO)</Label>
                  <Textarea
                    id="video-description"
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="Korte beschrijving van de video"
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleVideoEmbed} disabled={!videoUrl}>
                  <Link className="h-4 w-4 mr-2" />
                  Invoegen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative transition-all ${
          isDragging ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}
      >
        <Textarea
          id="content"
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Begin met typen... Gebruik de knoppen hierboven om media in te voegen, of sleep afbeeldingen hierheen."
          rows={20}
          className="font-mono text-sm"
          disabled={uploading}
        />
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-md flex items-center justify-center pointer-events-none">
            <div className="bg-background/90 px-6 py-4 rounded-lg shadow-lg">
              <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Sleep afbeelding hier</p>
            </div>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
            <div className="bg-background px-6 py-4 rounded-lg shadow-lg">
              <Loader2 className="h-8 w-8 mx-auto mb-2 text-primary animate-spin" />
              <p className="text-sm font-medium">Uploaden...</p>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {content.split(/\s+/).filter(Boolean).length} woorden
      </p>
    </div>
  );
};
