import clsx from "clsx";
import { useEffect, useState } from "react";
import type { AuthModalType } from "../../auth/AuthModalContext.tsx";
import styles from "./AuthBar.module.css";

interface AuthBarProps {
  onSignIn: () => void;
  onSignUp: () => void;
  activeModal?: AuthModalType;
}

type AuthAction = "signIn" | "signUp";

export const AuthBar = ({ onSignIn, onSignUp, activeModal }: AuthBarProps) => {
  // За макетом початково активна (темна) кнопка — Sign up; синхронізується з відкритою модалкою
  const [active, setActive] = useState<AuthAction>("signUp");

  useEffect(() => {
    if (activeModal === "signIn" || activeModal === "signUp") {
      setActive(activeModal);
    }
  }, [activeModal]);

  const handleClick = (action: AuthAction) => {
    setActive(action);
    if (action === "signIn") {
      onSignIn();
    } else {
      onSignUp();
    }
  };

  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={clsx(styles.button, active === "signIn" && styles.active)}
        onClick={() => handleClick("signIn")}
      >
        Sign in
      </button>
      <button
        type="button"
        className={clsx(styles.button, active === "signUp" && styles.active)}
        onClick={() => handleClick("signUp")}
      >
        Sign up
      </button>
    </div>
  );
};
