import { AdminLayout } from '@/components/admin/AdminLayout';
import { BacklinkTracker } from '@/components/admin/BacklinkTracker';

export default function Backlinks() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Backlink Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Monitor inkomende links en analyseer hun kwaliteit om je SEO strategie te verbeteren
          </p>
        </div>
        
        <BacklinkTracker />
      </div>
    </AdminLayout>
  );
}
