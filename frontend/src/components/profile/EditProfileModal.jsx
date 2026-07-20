import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { updateUser } from '../../api/users';
import { uploadImage } from '../../api/uploads';
import { useMutation } from '../../hooks/useAsync';
import './EditProfileModal.css';

export function EditProfileModal({ open, onClose, user, onUpdated }) {
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const { loading, error, mutate } = useMutation(updateUser);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const result = await uploadImage(file, 'avatars');
      setAvatarUrl(result.url);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await mutate(user.id, { name, bio: bio || undefined, avatarUrl: avatarUrl || undefined });
    onUpdated?.();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="edit-profile-heading">
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <h2 id="edit-profile-heading" className="edit-profile-form__title">
          Edit profile
        </h2>

        <div className="edit-profile-form__avatar-row">
          <Avatar name={name} src={avatarUrl} size="lg" />
          <label className="edit-profile-form__avatar-upload">
            <span>{uploading ? 'Uploading...' : 'Change photo'}</span>
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} hidden />
          </label>
        </div>
        {uploadError && <p className="edit-profile-form__error">{uploadError}</p>}

        <label className="edit-profile-form__field">
          <span>Name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
        </label>

        <label className="edit-profile-form__field">
          <span>Bio</span>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={300} />
        </label>

        {error && <p className="edit-profile-form__error">{error.message}</p>}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!name.trim() || loading || uploading}
          className="edit-profile-form__submit"
        >
          {loading ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </Modal>
  );
}
