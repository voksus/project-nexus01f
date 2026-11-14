import clsx from "clsx";
import { useState } from "react";
import styles from "./AuthBar.module.css";

interface AuthBarProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

type AuthAction = "signIn" | "signUp";

export const AuthBar = ({ onSignIn, onSignUp }: AuthBarProps) => {
  // За макетом активна (темна) кнопка — Sign up; після кліку стиль переходить на натиснуту
  const [active, setActive] = useState<AuthAction>("signUp");

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
