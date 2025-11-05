import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const GA4Settings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['ga4-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ga4_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const [measurementId, setMeasurementId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [syncEnabled, setSyncEnabled] = useState(false);

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setMeasurementId(settings.measurement_id || '');
      setPropertyId(settings.property_id || '');
      setApiSecret(settings.api_secret || '');
      setSyncEnabled(settings.sync_enabled || false);
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('ga4_settings')
        .update({
          measurement_id: measurementId || null,
          property_id: propertyId || null,
          api_secret: apiSecret || null,
          sync_enabled: syncEnabled,
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ga4-settings'] });
      toast({
        title: 'Instellingen opgeslagen',
        description: 'Google Analytics 4 instellingen zijn bijgewerkt.',
      });
      
      // Update GA4 script if measurement ID changed
      if (measurementId) {
        updateGA4Script(measurementId);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Fout bij opslaan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateGA4Script = (id: string) => {
    // Update gtag config
    if (window.gtag) {
      window.gtag('config', id, {
        send_page_view: false
      });
    }

    // Update script src
    const existingScript = document.querySelector('script[src*="googletagmanager.com/gtag"]');
    if (existingScript) {
      const newSrc = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      if (!existingScript.getAttribute('src')?.includes(id)) {
        const newScript = document.createElement('script');
        newScript.async = true;
        newScript.src = newSrc;
        existingScript.parentNode?.replaceChild(newScript, existingScript);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Configureer je Google Analytics 4 instellingen om automatisch traffic data te verzamelen en synchroniseren met het performance dashboard.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Google Analytics 4 Configuratie</CardTitle>
          <CardDescription>
            Vul je GA4 credentials in om tracking en data synchronisatie in te schakelen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="measurement-id">Measurement ID</Label>
            <Input
              id="measurement-id"
              placeholder="G-XXXXXXXXXX"
              value={measurementId}
              onChange={(e) => setMeasurementId(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Je GA4 Measurement ID vind je in Google Analytics onder Admin → Data Streams
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="property-id">Property ID (optioneel)</Label>
            <Input
              id="property-id"
              placeholder="123456789"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Vereist voor data synchronisatie via de GA4 Data API
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-secret">API Secret (optioneel)</Label>
            <Input
              id="api-secret"
              type="password"
              placeholder="●●●●●●●●●●●●"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Measurement Protocol API Secret voor server-side tracking
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sync-enabled">Automatische Synchronisatie</Label>
              <p className="text-sm text-muted-foreground">
                Sync GA4 data dagelijks naar het performance dashboard
              </p>
            </div>
            <Switch
              id="sync-enabled"
              checked={syncEnabled}
              onCheckedChange={setSyncEnabled}
            />
          </div>

          <Button
            onClick={() => updateSettings.mutate()}
            disabled={updateSettings.isPending}
            className="w-full"
          >
            {updateSettings.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opslaan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Instellingen Opslaan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Maak een GA4 Property aan</h4>
            <p className="text-sm text-muted-foreground">
              Ga naar Google Analytics → Admin → Create Property en volg de stappen.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">2. Verkrijg je Measurement ID</h4>
            <p className="text-sm text-muted-foreground">
              Navigeer naar Admin → Data Streams → Selecteer je web stream → Kopieer het Measurement ID (begint met G-)
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">3. (Optioneel) Configureer Data API Access</h4>
            <p className="text-sm text-muted-foreground">
              Voor geavanceerde data synchronisatie, maak een Service Account aan in Google Cloud Console en voeg de Property ID toe.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
