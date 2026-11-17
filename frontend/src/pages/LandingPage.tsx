import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <section className="page page--landing">
      <p className="eyebrow">Soundscape production co-pilot</p>
      <h1>From a creative scene to a production-ready sound.</h1>
      <p className="page__lede">
        SceneTone turns a scene brief into a structured soundscape blueprint and helps you interpret
        objective audio measurements. This build is the application scaffold.
      </p>
      <div className="cta-row">
        <Link className="button button--primary" to="/dashboard">
          Open dashboard
        </Link>
      </div>
    </section>
  );
}
