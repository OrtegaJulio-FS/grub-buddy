import { useParams } from 'react-router-dom';
import { NavBar } from '../components/layout/NavBar';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { useUser } from '../hooks/useUser';
import { useUserLogs } from '../hooks/useUserLogs';
import { CURRENT_USER_ID } from '../lib/currentUser';
import './ProfilePage.css';

export function ProfilePage() {
  const { userId = CURRENT_USER_ID } = useParams();
  const { user, loading: userLoading, error: userError } = useUser(userId);
  const { logs } = useUserLogs(userId);

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
      </main>
    </>
  );
}
