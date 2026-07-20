import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { NavBar } from '../components/layout/NavBar';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { TopSpots } from '../components/profile/TopSpots';
import { ListsSection } from '../components/profile/ListsSection';
import { DiaryList } from '../components/profile/DiaryList';
import { FollowButton } from '../components/profile/FollowButton';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { Button } from '../components/common/Button';
import { CreateListModal } from '../components/lists/CreateListModal';
import { useUser } from '../hooks/useUser';
import { useUserLogs } from '../hooks/useUserLogs';
import { useSpots } from '../hooks/useSpots';
import { useFollowers } from '../hooks/useFollowers';
import { useFollowing } from '../hooks/useFollowing';
import { useIsFollowing } from '../hooks/useIsFollowing';
import { useUserLists } from '../hooks/useUserLists';
import { CURRENT_USER_ID } from '../lib/currentUser';
import './ProfilePage.css';

export function ProfilePage() {
  const { userId = CURRENT_USER_ID } = useParams();
  const isOwnProfile = String(userId) === String(CURRENT_USER_ID);
  const { user, loading: userLoading, error: userError, refetch: refetchUser } = useUser(userId);
  const { logs } = useUserLogs(userId);
  // limit: 100 since this builds a lookup map (Top Spots, Diary thumbnails)
  // that needs to resolve any spot the user has logged, not just the 50
  // most-recently-created spots overall.
  const { spots } = useSpots({ limit: 100 });
  const { followers, refetch: refetchFollowers } = useFollowers(userId);
  const { following } = useFollowing(userId);
  const { isFollowing, refetch: refetchIsFollowing } = useIsFollowing(userId);
  const { lists, refetch: refetchLists } = useUserLists(userId);
  const [createListModalOpen, setCreateListModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  function handleFollowChange() {
    refetchFollowers();
    refetchIsFollowing();
  }

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

  // Only block on the *initial* load - see the same fix on SpotPage for why
  // (a background refetch, e.g. after saving profile edits, would otherwise
  // unmount any open modal mid-interaction).
  if (userLoading && !user) {
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

  const stats = {
    logCount: logs.length,
    listCount: lists.length,
    followers: followers.length,
    following: following.length,
  };

  return (
    <>
      <NavBar />
      <main className="profile-page container">
        <ProfileHeader
          user={user}
          stats={stats}
          action={
            isOwnProfile ? (
              <Button variant="ghost" size="md" onClick={() => setEditProfileModalOpen(true)}>
                Edit profile
              </Button>
            ) : (
              <FollowButton targetUserId={userId} isFollowing={isFollowing} onChange={handleFollowChange} />
            )
          }
        />
        <TopSpots ranked={rankedSpots} spotsById={spotsById} />
        <ListsSection lists={lists} onCreateClick={isOwnProfile ? () => setCreateListModalOpen(true) : undefined} />
        <DiaryList logs={logs} spotsById={spotsById} />
      </main>

      <CreateListModal
        open={createListModalOpen}
        onClose={() => setCreateListModalOpen(false)}
        onCreated={refetchLists}
      />

      {isOwnProfile && (
        <EditProfileModal
          open={editProfileModalOpen}
          onClose={() => setEditProfileModalOpen(false)}
          user={user}
          onUpdated={refetchUser}
        />
      )}
    </>
  );
}
