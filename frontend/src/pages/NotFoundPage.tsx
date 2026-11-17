import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="page">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p className="page__lede">The page you requested does not exist.</p>
      <div className="cta-row">
        <Link className="button button--secondary" to="/">
          Return home
        </Link>
      </div>
    </section>
  );
}
