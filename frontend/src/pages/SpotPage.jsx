import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NavBar } from '../components/layout/NavBar';
import { ForkRating } from '../components/spots/ForkRating';
import { VisitStamp } from '../components/spots/VisitStamp';
import { PlaceholderPhoto } from '../components/spots/PlaceholderPhoto';
import { Button } from '../components/common/Button';
import { LogVisitModal } from '../components/logs/LogVisitModal';
import { useSpot } from '../hooks/useSpot';
import { useLogsForSpot } from '../hooks/useLogsForSpot';
import './SpotPage.css';

export function SpotPage() {
  const { id } = useParams();
  const { spot, loading: spotLoading, error: spotError } = useSpot(id);
  const { average, count, loggedByMe, refetch: refetchLogs } = useLogsForSpot(id);
  const [modalOpen, setModalOpen] = useState(false);

  if (spotLoading) {
    return (
      <>
        <NavBar />
        <main className="container spot-page__status">Loading spot...</main>
      </>
    );
  }

  if (spotError || !spot) {
    return (
      <>
        <NavBar />
        <main className="container spot-page__status">
          <p>Couldn't find that spot.</p>
          <Link to="/">&larr; Back to Discover</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />

      <main className="spot-page">
        <section className="spot-hero">
          <div className="spot-hero__photo-wrap">
            {spot.cover_photo_url ? (
              <img className="spot-hero__photo" src={spot.cover_photo_url} alt={spot.name} />
            ) : (
              <PlaceholderPhoto className="spot-hero__photo" label={spot.name} />
            )}
            {loggedByMe && (
              <div className="spot-hero__stamp">
                <VisitStamp size="lg" />
              </div>
            )}
          </div>

          <div className="container spot-hero__content">
            <p className="spot-hero__breadcrumb">
              <Link to="/">&larr; Discover</Link>
            </p>
            <h1 className="spot-hero__name">{spot.name}</h1>
            <div className="spot-hero__meta">
              {spot.category && <span className="spot-hero__category">{spot.category}</span>}
              {spot.city && <span className="spot-hero__city mono">{spot.city}</span>}
              {spot.address && <span className="spot-hero__address">{spot.address}</span>}
            </div>

            <div className="spot-hero__ratings-row">
              <ForkRating average={average} count={count} size="lg" />
              <Button variant="primary" size="lg" onClick={() => setModalOpen(true)}>
                Log a visit
              </Button>
            </div>
          </div>
        </section>

        <section className="container reviews-section">
          <h2 className="reviews-section__title">Reviews</h2>
          <div className="reviews-section__placeholder">
            <p>
              Full reviews are coming in a later phase. For now, every log's fork rating
              and quick note feed straight into this spot's stats above.
            </p>
          </div>
        </section>
      </main>

      <LogVisitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        spot={spot}
        onLogged={refetchLogs}
      />
    </>
  );
}
