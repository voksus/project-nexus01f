import { Modal } from "../../ui/Modal/Modal.tsx";
import styles from "../AuthForm.module.css";
import { SignInForm } from "./SignInForm.tsx";

interface SignInModalProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onSuccess?: () => void;
}

export const SignInModal = ({
  onClose,
  onSwitchToSignUp,
  onSuccess,
}: SignInModalProps) => {
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      onClose();
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className={styles.title}>Sign in</h2>
      <SignInForm onSuccess={handleSuccess} />
      <p className={styles.footerText}>
        Don&apos;t have an account?{" "}
        <button
          type="button"
          className={styles.switchButton}
          onClick={onSwitchToSignUp}
        >
          Create an account
        </button>
      </p>
    </Modal>
  );
};
