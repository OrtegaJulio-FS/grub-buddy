import { useMemo, useState } from 'react';
import { NavBar } from '../components/layout/NavBar';
import { SegmentedSearchBar } from '../components/layout/SegmentedSearchBar';
import { FilterPills } from '../components/layout/FilterPills';
import { RatingFilter } from '../components/layout/RatingFilter';
import { SpotGrid } from '../components/spots/SpotGrid';
import { MapView } from '../components/map/MapView';
import { Button } from '../components/common/Button';
import { useSpots } from '../hooks/useSpots';
import { useTrendingSpots } from '../hooks/useTrendingSpots';
import { useLoggedSpotIds } from '../hooks/useLoggedSpotIds';
import { useActivity } from '../hooks/useActivity';
import { useAuth } from '../hooks/useAuth';
import './FeedPage.css';

export function FeedPage() {
  const { user } = useAuth();
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [minRating, setMinRating] = useState(undefined);
  const [activePill, setActivePill] = useState(null);
  // Defaults to the free-text "search" segment, not "location" - the visible
  // search box is the primary way users look for a spot by name, and
  // "location" does an exact-match against city (not a fuzzy search), so
  // defaulting there made typing a spot name silently return zero results.
  const [searchTab, setSearchTab] = useState('search');
  const [viewMode, setViewMode] = useState('grid');

  const category = activePill && activePill !== 'trending' ? activePill : '';

  // limit: 100 (the API's max page size) rather than the default 50 - no
  // "load more" UI exists yet, so a lower limit would silently drop spots
  // off the end of the grid instead of paginating them.
  const { spots, loading: spotsLoading, error: spotsError } = useSpots({ city, category, minRating, search, limit: 100 });
  // Real "spots with the most logs in the last 7 days" from the backend -
  // fetched regardless of whether the Trending pill is active (cheap, and
  // keeps this a plain hook call) but only used when it is.
  const { spots: trendingSpots, loading: trendingLoading } = useTrendingSpots();
  const { loggedSpotIds, loading: logsLoading } = useLoggedSpotIds();
  const { activity } = useActivity();

  // Spots at least one followed user has logged or reviewed - drives the
  // "Trusted by friends" search tab.
  const friendsLoggedSpotIds = useMemo(() => {
    const set = new Set();
    for (const item of activity) set.add(String(item.spot_id));
    return set;
  }, [activity]);

  const sortedSpots = useMemo(() => {
    if (activePill === 'trending') return trendingSpots;
    return searchTab === 'friends' ? spots.filter((spot) => friendsLoggedSpotIds.has(String(spot.id))) : spots;
  }, [spots, trendingSpots, activePill, searchTab, friendsLoggedSpotIds]);

  function handleCategoryChange(value) {
    setActivePill(value || null);
  }

  function handlePillSelect(key) {
    setActivePill((current) => (current === key ? null : key));
  }

  // Switching segments doesn't clear the other segments' typed text, so a
  // stale value (e.g. a leftover `search` term after switching to Location)
  // would silently AND-combine with the new one and zero out results. Only
  // clear city/search here, not category/activePill - that one's
  // intentionally shared with the always-visible FilterPills row.
  function handleSearchTabChange(tab) {
    setSearchTab(tab);
    if (tab !== 'location') setCity('');
    if (tab !== 'search') setSearch('');
  }

  const loading = spotsLoading || logsLoading || (activePill === 'trending' && trendingLoading);

  return (
    <>
      <NavBar>
        <SegmentedSearchBar
          active={searchTab}
          onActiveChange={handleSearchTabChange}
          city={city}
          category={activePill && activePill !== 'trending' ? activePill : ''}
          search={search}
          onCityChange={setCity}
          onCategoryChange={handleCategoryChange}
          onSearchChange={setSearch}
          disabledKeys={user ? [] : ['friends']}
        />
      </NavBar>

      <main className="feed-page container">
        <div className="feed-page__header">
          <h1>Discover spots</h1>
          <p className="feed-page__subhead">Fresh finds and local favorites, logged by real people.</p>
        </div>

        <div className="feed-page__toolbar">
          <div className="feed-page__toolbar-filters">
            <FilterPills active={activePill} onSelect={handlePillSelect} />
            <RatingFilter value={minRating} onChange={setMinRating} />
          </div>
          <div className="feed-page__view-toggle">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>
              Grid
            </Button>
            <Button variant={viewMode === 'map' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('map')}>
              Map
            </Button>
          </div>
        </div>

        {spotsError && (
          <p className="feed-page__error">
            Couldn't load spots: {spotsError.message}
          </p>
        )}

        {loading && !spotsError ? (
          <p className="feed-page__loading">Loading spots...</p>
        ) : viewMode === 'map' ? (
          <MapView spots={sortedSpots} />
        ) : (
          <SpotGrid spots={sortedSpots} loggedSpotIds={loggedSpotIds} />
        )}
      </main>
    </>
  );
}
