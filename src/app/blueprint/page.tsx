import { Suspense } from 'react';
import { BlueprintPage } from '@/views/BlueprintPage';

export default function Page() {
  return (
    <Suspense fallback={<p role="status">Loading...</p>}>
      <BlueprintPage />
    </Suspense>
  );
}
