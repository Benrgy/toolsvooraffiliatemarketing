import { AdminLayout } from '@/components/admin/AdminLayout';
import { GA4Settings } from '@/components/admin/GA4Settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Settings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Instellingen</h1>
          <p className="text-muted-foreground mt-2">
            Beheer je applicatie instellingen en integraties
          </p>
        </div>
        
        <Tabs defaultValue="ga4" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ga4">Google Analytics 4</TabsTrigger>
            <TabsTrigger value="general" disabled>Algemeen</TabsTrigger>
            <TabsTrigger value="notifications" disabled>Notificaties</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ga4" className="space-y-6">
            <GA4Settings />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
