import { Suspense } from 'react';
import { DashboardPage } from '@/views/DashboardPage';

export default function Page() {
  return (
    <Suspense fallback={<p role="status">Loading...</p>}>
      <DashboardPage />
    </Suspense>
  );
}
