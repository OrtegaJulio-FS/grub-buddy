import { useMemo, useState } from 'react';
import { NavBar } from '../components/layout/NavBar';
import { SegmentedSearchBar } from '../components/layout/SegmentedSearchBar';
import { FilterPills } from '../components/layout/FilterPills';
import { SpotGrid } from '../components/spots/SpotGrid';
import { useSpots } from '../hooks/useSpots';
import { useFeedLogs } from '../hooks/useFeedLogs';
import './FeedPage.css';

export function FeedPage() {
  const [city, setCity] = useState('');
  const [activePill, setActivePill] = useState(null);

  const category = activePill && activePill !== 'trending' ? activePill : '';

  const { spots, loading: spotsLoading, error: spotsError } = useSpots({ city, category });
  const { statsBySpot, loggedSpotIds, loading: logsLoading } = useFeedLogs();

  const sortedSpots = useMemo(() => {
    if (activePill !== 'trending') return spots;
    return [...spots].sort((a, b) => {
      const countA = statsBySpot.get(String(a.id))?.count || 0;
      const countB = statsBySpot.get(String(b.id))?.count || 0;
      return countB - countA;
    });
  }, [spots, activePill, statsBySpot]);

  function handleCategoryChange(value) {
    setActivePill(value || null);
  }

  function handlePillSelect(key) {
    setActivePill((current) => (current === key ? null : key));
  }

  const loading = spotsLoading || logsLoading;

  return (
    <>
      <NavBar>
        <SegmentedSearchBar
          city={city}
          category={activePill && activePill !== 'trending' ? activePill : ''}
          onCityChange={setCity}
          onCategoryChange={handleCategoryChange}
        />
      </NavBar>

      <main className="feed-page container">
        <div className="feed-page__header">
          <h1>Discover spots</h1>
          <p className="feed-page__subhead">Fresh finds and local favorites, logged by real people.</p>
        </div>

        <FilterPills active={activePill} onSelect={handlePillSelect} />

        {spotsError && (
          <p className="feed-page__error">
            Couldn't load spots: {spotsError.message}
          </p>
        )}

        {loading && !spotsError ? (
          <p className="feed-page__loading">Loading spots...</p>
        ) : (
          <SpotGrid spots={sortedSpots} statsBySpot={statsBySpot} loggedSpotIds={loggedSpotIds} />
        )}
      </main>
    </>
  );
}
