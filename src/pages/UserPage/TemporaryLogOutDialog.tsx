import { useEffect, useId, useRef } from "react";
import { Icon } from "../../components/ui/Icon/Icon.tsx";
import styles from "./TemporaryLogOutDialog.module.css";

interface TemporaryLogOutDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

// Тимчасово, доки FE-04 не додасть LogOutModal. Тоді кнопку профілю перемкнути на нього.
export const TemporaryLogOutDialog = ({
  open,
  onCancel,
  onConfirm,
}: TemporaryLogOutDialogProps) => {
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
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <button
        type="button"
        className={styles.close}
        aria-label="Close"
        onClick={onCancel}
      >
        <Icon name="close" className={styles.closeIcon} />
      </button>
      <h2 id={titleId} className={styles.title}>
        Are you logging out?
      </h2>
      <p className={styles.text}>You can always log back in at my time.</p>
      <div className={styles.actions}>
        <button type="button" className={styles.confirm} onClick={onConfirm}>
          Log out
        </button>
        <button type="button" className={styles.cancel} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </dialog>
  );
};
