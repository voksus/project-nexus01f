import { useCallback, useRef } from "react";
import styles from "../../components/auth/LogOutModal/LogOutModal.module.css";
import { Modal } from "../../components/ui/Modal/Modal.tsx";

interface TemporaryDeleteDialogProps {
  open: boolean;
  favorite: boolean;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const TemporaryDeleteDialog = ({
  open,
  favorite,
  pending,
  onCancel,
  onConfirm,
}: TemporaryDeleteDialogProps) => {
  const onCancelRef = useRef(onCancel);
  const pendingRef = useRef(pending);
  onCancelRef.current = onCancel;
  pendingRef.current = pending;

  const handleClose = useCallback(() => {
    if (pendingRef.current) return;
    onCancelRef.current();
  }, []);

  if (!open) return null;

  return (
    <Modal onClose={handleClose}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          {favorite ? "Remove from favorites?" : "Delete this recipe?"}
        </h2>
        <p className={styles.subtitle}>
          {favorite
            ? "You can add this recipe to your favorites again later."
            : "This recipe will be removed from your profile."}
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.logoutButton}
            disabled={pending}
            onClick={onConfirm}
          >
            {favorite ? "Remove" : "Delete"}
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            disabled={pending}
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};
