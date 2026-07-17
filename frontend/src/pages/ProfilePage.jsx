import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { NavBar } from '../components/layout/NavBar';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { TopSpots } from '../components/profile/TopSpots';
import { ListsSection } from '../components/profile/ListsSection';
import { DiaryList } from '../components/profile/DiaryList';
import { useUser } from '../hooks/useUser';
import { useUserLogs } from '../hooks/useUserLogs';
import { useSpots } from '../hooks/useSpots';
import { CURRENT_USER_ID } from '../lib/currentUser';
import './ProfilePage.css';

export function ProfilePage() {
  const { userId = CURRENT_USER_ID } = useParams();
  const { user, loading: userLoading, error: userError } = useUser(userId);
  const { logs } = useUserLogs(userId);
  const { spots } = useSpots();

  const spotsById = useMemo(() => {
    const map = new Map();
    for (const spot of spots) map.set(String(spot.id), spot);
    return map;
  }, [spots]);

  // Ranks by each spot's server-side average_rating/log_count (GET /spots),
  // restricted to spots this user has actually logged. With only the one
  // fake user right now, "this spot's average" and "my average" are the same
  // number - once real multi-user auth exists, this should switch to a
  // per-user aggregate instead of the spot-wide one.
  const rankedSpots = useMemo(() => {
    const visitedSpotIds = new Set(logs.map((log) => String(log.spot_id)));
    return Array.from(visitedSpotIds)
      .map((spotId) => spotsById.get(spotId))
      .filter(Boolean)
      .sort((a, b) => {
        if ((b.average_rating || 0) !== (a.average_rating || 0)) {
          return (b.average_rating || 0) - (a.average_rating || 0);
        }
        return (b.log_count || 0) - (a.log_count || 0);
      })
      .map((spot) => ({ spotId: String(spot.id), average: spot.average_rating, count: spot.log_count }));
  }, [logs, spotsById]);

  if (userLoading) {
    return (
      <>
        <NavBar />
        <main className="container profile-page__status">Loading profile...</main>
      </>
    );
  }

  if (userError || !user) {
    return (
      <>
        <NavBar />
        <main className="container profile-page__status">Couldn't find that user.</main>
      </>
    );
  }

  // followers/following have no backend yet (no /follows routes) - hardcoded
  // to 0 rather than faked. listCount is likewise 0 until /lists exists.
  const stats = {
    logCount: logs.length,
    listCount: 0,
    followers: 0,
    following: 0,
  };

  return (
    <>
      <NavBar />
      <main className="profile-page container">
        <ProfileHeader user={user} stats={stats} />
        <TopSpots ranked={rankedSpots} spotsById={spotsById} />
        <ListsSection />
        <DiaryList logs={logs} spotsById={spotsById} />
      </main>
    </>
  );
}
