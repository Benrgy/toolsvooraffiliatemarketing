import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Video, Upload, Loader2, Link } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Props {
  content: string;
  onChange: (content: string) => void;
}

export const RichContentEditor = ({ content, onChange }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);
  
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
      // Upload to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `content/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      // Create HTML with SEO attributes
      const alignClass = imagePosition === 'center' ? 'mx-auto' : imagePosition === 'left' ? 'float-left mr-4' : 'float-right ml-4';
      const geoAttr = imageGeoTag ? ` data-geo="${imageGeoTag}"` : '';
      
      const imageHtml = `\n<figure class="${alignClass} my-4">
  <img src="${publicUrl}" alt="${imageAlt}" title="${imageTitle || imageAlt}" class="rounded-lg max-w-full h-auto"${geoAttr} loading="lazy" />
  ${imageCaption ? `<figcaption class="text-sm text-muted-foreground mt-2 text-center">${imageCaption}</figcaption>` : ''}
</figure>\n\n`;

      insertAtCursor(imageHtml);
      
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

    let embedCode = '';
    
    // YouTube embed
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      let videoId = '';
      if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
      } else {
        const urlParams = new URLSearchParams(new URL(videoUrl).search);
        videoId = urlParams.get('v') || '';
      }
      
      embedCode = `\n<div class="video-container my-6">
  <iframe 
    src="https://www.youtube.com/embed/${videoId}" 
    title="${videoTitle || 'YouTube video'}"
    ${videoDescription ? `aria-label="${videoDescription}"` : ''}
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen
    class="w-full aspect-video rounded-lg"
    loading="lazy"
  ></iframe>
  ${videoDescription ? `<p class="text-sm text-muted-foreground mt-2">${videoDescription}</p>` : ''}
</div>\n\n`;
    }
    // Vimeo embed
    else if (videoUrl.includes('vimeo.com')) {
      const videoId = videoUrl.split('vimeo.com/')[1].split('?')[0];
      embedCode = `\n<div class="video-container my-6">
  <iframe 
    src="https://player.vimeo.com/video/${videoId}" 
    title="${videoTitle || 'Vimeo video'}"
    ${videoDescription ? `aria-label="${videoDescription}"` : ''}
    frameborder="0" 
    allow="autoplay; fullscreen; picture-in-picture" 
    allowfullscreen
    class="w-full aspect-video rounded-lg"
    loading="lazy"
  ></iframe>
  ${videoDescription ? `<p class="text-sm text-muted-foreground mt-2">${videoDescription}</p>` : ''}
</div>\n\n`;
    } else {
      toast({
        title: 'Niet ondersteund',
        description: 'Alleen YouTube en Vimeo URLs worden ondersteund.',
        variant: 'destructive',
      });
      return;
    }

    insertAtCursor(embedCode);
    setShowVideoDialog(false);
    setVideoUrl('');
    setVideoTitle('');
    setVideoDescription('');

    toast({
      title: 'Video toegevoegd',
      description: 'De video is succesvol ingevoegd.',
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="content">Content *</Label>
        <div className="flex gap-2">
          <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Image className="h-4 w-4 mr-2" />
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
      
      <Textarea
        id="content"
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Begin met typen... Gebruik de knoppen hierboven om media in te voegen."
        rows={20}
        className="font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground">
        {content.split(/\s+/).filter(Boolean).length} woorden
      </p>
    </div>
  );
};
