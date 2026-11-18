import clsx from "clsx";
import { useCallback, useState } from "react";
import { selectUser } from "../../redux/auth/selectors.ts";
import { useAppSelector } from "../../redux/hooks.ts";
import { useAuthModal } from "../auth/AuthModalContext.tsx";
import { Icon } from "../ui/Icon/Icon.tsx";
import { Logo } from "../ui/Logo/Logo.tsx";
import { AuthBar } from "./AuthBar/AuthBar.tsx";
import styles from "./Header.module.css";
import { MobileMenu } from "./MobileMenu/MobileMenu.tsx";
import { Nav } from "./Nav/Nav.tsx";
import { UserBar } from "./UserBar/UserBar.tsx";

interface HeaderProps {
  /** `dark` — поверх чорного блоку (Hero на `/`, 404), `light` — на решті сторінок */
  theme: "dark" | "light";
}

export const Header = ({ theme }: HeaderProps) => {
  const user = useAppSelector(selectUser);
  const { activeModal, openSignIn, openSignUp, openLogOut } = useAuthModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <header className={clsx(styles.header, styles[theme])}>
      <div className={clsx("container", styles.inner)}>
        <Logo className={styles.logo} />

        {/* Рішення #11: Nav і бургер — лише для авторизованих */}
        {user && (
          <div className={styles.nav}>
            <Nav variant="header" />
          </div>
        )}

        <div className={styles.actions}>
          {user ? (
            <>
              <UserBar user={user} onLogout={openLogOut} />
              <button
                type="button"
                className={styles.burger}
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(true)}
              >
                <Icon name="burger-menu" className={styles.burgerIcon} />
              </button>
            </>
          ) : (
            <AuthBar
              onSignIn={openSignIn}
              onSignUp={openSignUp}
              activeModal={activeModal}
            />
          )}
        </div>
      </div>

      {user && <MobileMenu isOpen={isMenuOpen} onClose={closeMenu} />}
    </header>
  );
};
