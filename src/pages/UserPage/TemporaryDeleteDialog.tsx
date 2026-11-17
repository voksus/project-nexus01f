import { useEffect, useId, useRef } from "react";
import { Icon } from "../../components/ui/Icon/Icon.tsx";
import styles from "./TemporaryLogOutDialog.module.css";

interface TemporaryDeleteDialogProps {
  open: boolean;
  favorite: boolean;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

// Тимчасова оболонка, доки FE-04 не додасть універсальний Modal.
// Самого підтвердження видалення в тій тасці немає: там лише вхід, реєстрація і вихід.
export const TemporaryDeleteDialog = ({
  open,
  favorite,
  pending,
  onCancel,
  onConfirm,
}: TemporaryDeleteDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={onCancel}
      onCancel={(event) => {
        if (pending) event.preventDefault();
      }}
      onMouseDown={(event) => {
        if (pending || event.target !== event.currentTarget) return;
        onCancel();
      }}
    >
      <button
        type="button"
        className={styles.close}
        aria-label="Close"
        disabled={pending}
        onClick={onCancel}
      >
        <Icon name="close" className={styles.closeIcon} />
      </button>
      <h2 id={titleId} className={styles.title}>
        {favorite ? "Remove from favorites?" : "Delete this recipe?"}
      </h2>
      <p className={styles.text}>
        {favorite
          ? "You can add this recipe to your favorites again later."
          : "This recipe will be removed from your profile."}
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.confirm}
          disabled={pending}
          onClick={onConfirm}
        >
          {favorite ? "Remove" : "Delete"}
        </button>
        <button
          type="button"
          className={styles.cancel}
          disabled={pending}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </dialog>
  );
};
