import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NavBar } from '../components/layout/NavBar';
import { ForkRating } from '../components/spots/ForkRating';
import { VisitStamp } from '../components/spots/VisitStamp';
import { PlaceholderPhoto } from '../components/spots/PlaceholderPhoto';
import { Button } from '../components/common/Button';
import { LogVisitModal } from '../components/logs/LogVisitModal';
import { ReviewsList } from '../components/reviews/ReviewsList';
import { useSpot } from '../hooks/useSpot';
import { useLoggedByMe } from '../hooks/useLoggedByMe';
import { useReviews } from '../hooks/useReviews';
import './SpotPage.css';

export function SpotPage() {
  const { id } = useParams();
  const { spot, loading: spotLoading, error: spotError, refetch: refetchSpot } = useSpot(id);
  const { loggedByMe, refetch: refetchLoggedByMe } = useLoggedByMe(id);
  const { reviews, loading: reviewsLoading } = useReviews(id);
  const [modalOpen, setModalOpen] = useState(false);

  function handleLogged() {
    refetchSpot();
    refetchLoggedByMe();
  }

  // Only block on the *initial* load. Background refetches (after logging a
  // visit) also flip spotLoading briefly - returning early for those would
  // unmount the open Log-a-Visit modal mid-confirmation, wiping out its
  // "submitted" state before the user ever sees it.
  if (spotLoading && !spot) {
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
              <ForkRating average={spot.average_rating} count={spot.log_count} size="lg" />
              <Button variant="primary" size="lg" onClick={() => setModalOpen(true)}>
                Log a visit
              </Button>
            </div>
          </div>
        </section>

        <section className="container reviews-section">
          <h2 className="reviews-section__title">Reviews</h2>
          {reviewsLoading ? (
            <p className="reviews-section__loading">Loading reviews...</p>
          ) : (
            <ReviewsList reviews={reviews} />
          )}
        </section>
      </main>

      <LogVisitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        spot={spot}
        onLogged={handleLogged}
      />
    </>
  );
}
