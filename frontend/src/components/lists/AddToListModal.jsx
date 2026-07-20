import { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CreateListModal } from './CreateListModal';
import { getList, addListItem, removeListItem } from '../../api/lists';
import { useUserLists } from '../../hooks/useUserLists';
import { CURRENT_USER_ID } from '../../lib/currentUser';
import './AddToListModal.css';

export function AddToListModal({ open, onClose, spot }) {
  const { lists, loading: listsLoading, refetch: refetchLists } = useUserLists(CURRENT_USER_ID);
  const [memberListIds, setMemberListIds] = useState(new Set());
  const [checking, setChecking] = useState(false);
  const [pendingListId, setPendingListId] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Figure out which of the user's lists already contain this spot. There's
  // no bulk "which lists have spot X" endpoint, so this fetches each list's
  // full detail once when the modal opens - fine at the scale of "a handful
  // of lists per user."
  useEffect(() => {
    if (!open || lists.length === 0) {
      setMemberListIds(new Set());
      return;
    }
    let cancelled = false;
    setChecking(true);
    Promise.all(lists.map((list) => getList(list.id))).then((fullLists) => {
      if (cancelled) return;
      const ids = new Set();
      for (const list of fullLists) {
        if (list.spots.some((s) => String(s.id) === String(spot.id))) {
          ids.add(String(list.id));
        }
      }
      setMemberListIds(ids);
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, lists, spot.id]);

  async function toggleList(listId) {
    setPendingListId(listId);
    const key = String(listId);
    try {
      if (memberListIds.has(key)) {
        await removeListItem(listId, spot.id);
        setMemberListIds((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        await addListItem(listId, spot.id);
        setMemberListIds((prev) => new Set(prev).add(key));
      }
    } finally {
      setPendingListId(null);
    }
  }

  async function handleListCreated(list) {
    await addListItem(list.id, spot.id);
    setMemberListIds((prev) => new Set(prev).add(String(list.id)));
    refetchLists();
  }

  return (
    <>
      <Modal open={open && !createModalOpen} onClose={onClose} labelledBy="add-to-list-heading">
        <h2 id="add-to-list-heading" className="add-to-list__title">
          Add <em>{spot.name}</em> to a list
        </h2>

        {listsLoading || checking ? (
          <p className="add-to-list__loading">Loading your lists...</p>
        ) : lists.length === 0 ? (
          <p className="add-to-list__empty">You don't have any lists yet.</p>
        ) : (
          <ul className="add-to-list__lists">
            {lists.map((list) => {
              const isMember = memberListIds.has(String(list.id));
              return (
                <li key={list.id} className="add-to-list__list-row">
                  <span className="add-to-list__list-title">{list.title}</span>
                  <Button
                    variant={isMember ? 'ghost' : 'primary'}
                    size="sm"
                    disabled={pendingListId === list.id}
                    onClick={() => toggleList(list.id)}
                  >
                    {pendingListId === list.id ? '...' : isMember ? 'Remove' : 'Add'}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        <Button variant="ghost" size="md" className="add-to-list__create-btn" onClick={() => setCreateModalOpen(true)}>
          + Create a new list
        </Button>
      </Modal>

      <CreateListModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleListCreated}
      />
    </>
  );
}
