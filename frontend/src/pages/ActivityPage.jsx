import { NavBar } from '../components/layout/NavBar';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { useActivity } from '../hooks/useActivity';
import './ActivityPage.css';

export function ActivityPage() {
  const { activity, loading, error } = useActivity();

  return (
    <>
      <NavBar />
      <main className="activity-page container">
        <div className="activity-page__header">
          <h1>Activity</h1>
          <p className="activity-page__subhead">Recent logs and reviews from people you follow.</p>
        </div>

        {error && <p className="activity-page__error">Couldn't load activity: {error.message}</p>}

        {loading && !error ? (
          <p className="activity-page__loading">Loading activity...</p>
        ) : (
          !error && <ActivityFeed activity={activity} />
        )}
      </main>
    </>
  );
}
