import { Modal } from "../../ui/Modal/Modal.tsx";
import styles from "../AuthForm.module.css";
import { SignUpForm } from "./SignUpForm.tsx";

interface SignUpModalProps {
  onClose: () => void;
  onSwitchToSignIn: () => void;
  onSuccess?: () => void;
}

export const SignUpModal = ({
  onClose,
  onSwitchToSignIn,
  onSuccess,
}: SignUpModalProps) => {
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      onClose();
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className={styles.title}>Sign up</h2>
      <SignUpForm onSuccess={handleSuccess} />
      <p className={styles.footerText}>
        I already have an account?{" "}
        <button
          type="button"
          className={styles.switchButton}
          onClick={onSwitchToSignIn}
        >
          Sign in
        </button>
      </p>
    </Modal>
  );
};
