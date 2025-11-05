import { AdminLayout } from '@/components/admin/AdminLayout';
import { PerformanceDashboard } from '@/components/admin/PerformanceDashboard';

export default function Performance() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Content Performance</h1>
          <p className="text-muted-foreground mt-2">
            Analyseer je content prestaties met uitgebreide metrics en trending data
          </p>
        </div>
        
        <PerformanceDashboard />
      </div>
    </AdminLayout>
  );
}
