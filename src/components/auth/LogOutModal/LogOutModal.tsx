import { useNavigate } from "react-router-dom";
import { logout } from "../../../redux/auth/operations.ts";
import { useAppDispatch } from "../../../redux/hooks.ts";
import { sessionCleared } from "../../../redux/sessionActions.ts";
import { PENDING_LOGOUT_KEY } from "../../../services/api.ts";
import { Modal } from "../../ui/Modal/Modal.tsx";
import styles from "./LogOutModal.module.css";

interface LogOutModalProps {
  onClose: () => void;
}

const clearClientStorage = () => {
  try {
    const pendingLogout = window.localStorage.getItem(PENDING_LOGOUT_KEY);
    window.localStorage.clear();
    if (pendingLogout === "true") {
      window.localStorage.setItem(PENDING_LOGOUT_KEY, "true");
    }
  } catch {
    /* Доступ до localStorage може бути обмежений політиками браузера */
  }
};

export const LogOutModal = ({ onClose }: LogOutModalProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    onClose();
    try {
      await dispatch(logout());
    } finally {
      clearClientStorage();
      dispatch(sessionCleared());
      navigate("/", { replace: true });
    }
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
