import { Suspense } from 'react';
import { AnalyzePage } from '@/views/AnalyzePage';

export default function Page() {
  return (
    <Suspense fallback={<p role="status">Loading...</p>}>
      <AnalyzePage />
    </Suspense>
  );
}
