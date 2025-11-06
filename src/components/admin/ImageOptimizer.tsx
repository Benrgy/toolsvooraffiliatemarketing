import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon, Download, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const ImageOptimizer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState([80]);
  const [format, setFormat] = useState('webp');
  const [width, setWidth] = useState('');
  const [preview, setPreview] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        toast({
          title: 'Ongeldig bestand',
          description: 'Selecteer een afbeelding.',
          variant: 'destructive',
        });
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleOptimize = async () => {
    if (!file) {
      toast({
        title: 'Geen afbeelding geselecteerd',
        description: 'Upload eerst een afbeelding.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create canvas for image manipulation
      const img = new Image();
      img.src = preview;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Calculate new dimensions
      let newWidth = width ? parseInt(width) : img.width;
      let newHeight = width ? (parseInt(width) / img.width) * img.height : img.height;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw resized image
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert to desired format
      const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob),
          mimeType,
          quality[0] / 100
        );
      });

      if (!blob) {
        throw new Error('Failed to create blob');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `optimized-${file.name.split('.')[0]}.${format}`;
      link.click();
      URL.revokeObjectURL(url);

      // Show file size comparison
      const originalSize = (file.size / 1024).toFixed(2);
      const optimizedSize = (blob.size / 1024).toFixed(2);
      const reduction = (((file.size - blob.size) / file.size) * 100).toFixed(1);

      toast({
        title: 'Afbeelding geoptimaliseerd',
        description: `${originalSize}KB → ${optimizedSize}KB (${reduction}% kleiner)`,
      });
    } catch (error) {
      console.error('Error optimizing image:', error);
      toast({
        title: 'Fout bij optimalisatie',
        description: 'Er is iets misgegaan. Probeer het opnieuw.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Afbeelding Optimizer</h3>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="image-upload">Upload Afbeelding</Label>
            <div className="mt-2">
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded"
                    />
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Klik om een afbeelding te uploaden
                      </p>
                    </div>
                  )}
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Kwaliteit: {quality[0]}%</Label>
              <Slider
                value={quality}
                onValueChange={setQuality}
                min={1}
                max={100}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lagere kwaliteit = kleinere bestandsgrootte
              </p>
            </div>

            <div>
              <Label htmlFor="format">Formaat</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="format" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webp">WebP (Aanbevolen)</SelectItem>
                  <SelectItem value="jpg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="width">Breedte (pixels, optioneel)</Label>
              <Input
                id="width"
                type="number"
                placeholder="Auto"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Hoogte wordt automatisch berekend
              </p>
            </div>
          </div>

          <Button onClick={handleOptimize} disabled={!file} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Optimaliseer & Download
          </Button>
        </div>
      </Card>
    </div>
  );
};
