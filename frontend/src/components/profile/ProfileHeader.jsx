import { Avatar } from '../common/Avatar';
import { deriveHandle } from '../../lib/profile';
import './ProfileHeader.css';

export function ProfileHeader({ user, stats }) {
  return (
    <section className="profile-header">
      <Avatar name={user.name} size="lg" />

      <div className="profile-header__identity">
        <h1 className="profile-header__name">{user.name}</h1>
        <p className="profile-header__handle mono">{deriveHandle(user.name)}</p>
        {user.bio && <p className="profile-header__bio">{user.bio}</p>}
        {user.city && <p className="profile-header__city mono">{user.city}</p>}
      </div>

      <dl className="profile-header__stats">
        <div className="profile-header__stat">
          <dt className="mono">{stats.logCount}</dt>
          <dd>Logs</dd>
        </div>
        <div className="profile-header__stat">
          <dt className="mono">{stats.listCount}</dt>
          <dd>Lists</dd>
        </div>
        <div className="profile-header__stat">
          <dt className="mono">{stats.followers}</dt>
          <dd>Followers</dd>
        </div>
        <div className="profile-header__stat">
          <dt className="mono">{stats.following}</dt>
          <dd>Following</dd>
        </div>
      </dl>
    </section>
  );
}
