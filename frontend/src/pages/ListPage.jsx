import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NavBar } from '../components/layout/NavBar';
import { SpotGrid } from '../components/spots/SpotGrid';
import { useList } from '../hooks/useList';
import { useUser } from '../hooks/useUser';
import { useSpots } from '../hooks/useSpots';
import { useLoggedSpotIds } from '../hooks/useLoggedSpotIds';
import './ListPage.css';

export function ListPage() {
  const { id } = useParams();
  const { list, loading, error } = useList(id);
  const { user: owner } = useUser(list?.user_id);
  const { spots: allSpots } = useSpots();
  const { loggedSpotIds } = useLoggedSpotIds();

  const spotsById = useMemo(() => {
    const map = new Map();
    for (const spot of allSpots) map.set(String(spot.id), spot);
    return map;
  }, [allSpots]);

  // list.model.js's findSpots doesn't compute average_rating/log_count (that
  // LEFT JOIN lives on spots.findAll/findById) - enrich with the aggregate
  // spot data already fetched via useSpots() rather than duplicating it.
  const enrichedSpots = useMemo(() => {
    if (!list) return [];
    return list.spots.map((spot) => spotsById.get(String(spot.id)) || spot);
  }, [list, spotsById]);

  if (loading) {
    return (
      <>
        <NavBar />
        <main className="container list-page__status">Loading list...</main>
      </>
    );
  }

  if (error || !list) {
    return (
      <>
        <NavBar />
        <main className="container list-page__status">
          <p>Couldn't find that list.</p>
          <Link to="/">&larr; Back to Discover</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="list-page container">
        <p className="list-page__breadcrumb">
          <Link to="/">&larr; Discover</Link>
        </p>
        <h1 className="list-page__title">{list.title}</h1>
        {owner && (
          <p className="list-page__owner">
            by{' '}
            <Link to={`/profile/${owner.id}`} className="list-page__owner-link">
              {owner.name}
            </Link>
          </p>
        )}
        {list.description && <p className="list-page__description">{list.description}</p>}
        <p className="list-page__count mono">
          {enrichedSpots.length} spot{enrichedSpots.length === 1 ? '' : 's'}
        </p>

        <SpotGrid spots={enrichedSpots} loggedSpotIds={loggedSpotIds} />
      </main>
    </>
  );
}
