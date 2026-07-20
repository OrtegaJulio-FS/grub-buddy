import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { createList } from '../../api/lists';
import { useMutation } from '../../hooks/useAsync';
import './CreateListModal.css';

export function CreateListModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const { loading, error, mutate } = useMutation(createList);

  function resetAndClose() {
    setTitle('');
    setDescription('');
    setIsPublic(true);
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const list = await mutate({ title, description: description || undefined, isPublic });
    resetAndClose();
    onCreated?.(list);
  }

  return (
    <Modal open={open} onClose={resetAndClose} labelledBy="create-list-heading">
      <form onSubmit={handleSubmit} className="create-list-form">
        <h2 id="create-list-heading" className="create-list-form__title">
          Create a list
        </h2>

        <label className="create-list-form__field">
          <span>Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Best patios for a date night"
            maxLength={200}
            required
          />
        </label>

        <label className="create-list-form__field">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this list about?"
            rows={3}
            maxLength={500}
          />
        </label>

        <label className="create-list-form__toggle">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          <span>Public - anyone with the link can view this list</span>
        </label>

        {error && <p className="create-list-form__error">{error.message}</p>}

        <Button type="submit" variant="primary" size="lg" disabled={!title.trim() || loading} className="create-list-form__submit">
          {loading ? 'Creating...' : 'Create list'}
        </Button>
      </form>
    </Modal>
  );
}
