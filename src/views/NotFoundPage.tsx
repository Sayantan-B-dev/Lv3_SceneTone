'use client';

import Link from 'next/link';
import { Window } from '@/components/ui/Window';

export function NotFoundPage() {
  return (
    <section className="page page--narrow">
      <h1 className="page__title">404</h1>
      <p className="page__jp" lang="ja">
        ページがありません
      </p>
      <Window title="missing_page.exe">
        <p>The page you requested does not exist.</p>
        <div className="workspace-actions">
          <Link className="button button--secondary" href="/">
            Return home
          </Link>
        </div>
      </Window>
    </section>
  );
}
