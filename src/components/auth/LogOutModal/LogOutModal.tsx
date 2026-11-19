import { logout } from "../../../redux/auth/operations.ts";
import { useAppDispatch } from "../../../redux/hooks.ts";
import { Modal } from "../../ui/Modal/Modal.tsx";
import styles from "./LogOutModal.module.css";

interface LogOutModalProps {
  onClose: () => void;
}

export const LogOutModal = ({ onClose }: LogOutModalProps) => {
  const dispatch = useAppDispatch();

  const handleLogOut = async () => {
    onClose();
    await dispatch(logout());
  };

  return (
    <Modal onClose={onClose}>
      <div className={styles.content}>
        <h2 className={styles.title}>Are you logging out?</h2>
        <p className={styles.subtitle}>
          You can always log back in at any time.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogOut}
          >
            Log out
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};
