import { useState } from 'react';
import { Button } from '../common/Button';
import { followUser, unfollowUser } from '../../api/follows';

export function FollowButton({ targetUserId, isFollowing, onChange }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId);
      } else {
        await followUser(targetUserId);
      }
      onChange?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={isFollowing ? 'ghost' : 'primary'} size="md" onClick={handleClick} disabled={loading}>
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}
