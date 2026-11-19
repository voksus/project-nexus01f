import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  selectIsAuthenticated,
  selectIsInitialized,
} from "../../redux/auth/selectors.ts";
import { useAppSelector } from "../../redux/hooks.ts";
import { LogOutModal } from "./LogOutModal/LogOutModal.tsx";
import { SignInModal } from "./SignInModal/SignInModal.tsx";
import { SignUpModal } from "./SignUpModal/SignUpModal.tsx";

export type AuthModalType = "signIn" | "signUp" | "logOut" | null;

interface AuthModalContextValue {
  activeModal: AuthModalType;
  openSignIn: (redirectTo?: string) => void;
  openSignUp: (redirectTo?: string) => void;
  openLogOut: () => void;
  closeModal: () => void;
}

interface LocationStateWithFrom {
  from?: {
    pathname?: string;
    search?: string;
  };
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);

  const [activeModal, setActiveModal] = useState<AuthModalType>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  // Автоматичне відкриття SignInModal після редіректу з PrivateRoute (через state.from)
  useEffect(() => {
    if (!isInitialized) return;

    const state = location.state as LocationStateWithFrom | null;
    const fromPath = state?.from?.pathname;

    if (!isAuthenticated && fromPath) {
      const fullRedirectPath = `${fromPath}${state?.from?.search ?? ""}`;
      setRedirectTo(fullRedirectPath);
      setActiveModal("signIn");
      // Очищуємо location.state, щоб модалка не відкривалася повторно при оновленні сторінки
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [
    isAuthenticated,
    isInitialized,
    location.pathname,
    location.state,
    navigate,
  ]);

  const openSignIn = useCallback((targetPath?: string) => {
    if (typeof targetPath === "string") {
      setRedirectTo(targetPath);
    }
    setActiveModal("signIn");
  }, []);

  const openSignUp = useCallback((targetPath?: string) => {
    if (typeof targetPath === "string") {
      setRedirectTo(targetPath);
    }
    setActiveModal("signUp");
  }, []);

  const openLogOut = useCallback(() => {
    setRedirectTo(null);
    setActiveModal("logOut");
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setRedirectTo(null);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    const target = redirectTo;
    setActiveModal(null);
    setRedirectTo(null);
    if (target) {
      navigate(target, { replace: true });
    }
  }, [navigate, redirectTo]);

  // При перемиканні між SignInModal та SignUpModal зберігаємо поточний redirectTo
  const switchToSignUp = useCallback(() => {
    setActiveModal("signUp");
  }, []);

  const switchToSignIn = useCallback(() => {
    setActiveModal("signIn");
  }, []);

  const contextValue = useMemo<AuthModalContextValue>(
    () => ({
      activeModal,
      openSignIn,
      openSignUp,
      openLogOut,
      closeModal,
    }),
    [activeModal, openSignIn, openSignUp, openLogOut, closeModal],
  );

  return (
    <AuthModalContext.Provider value={contextValue}>
      {children}

      {activeModal === "signIn" && (
        <SignInModal
          onClose={closeModal}
          onSwitchToSignUp={switchToSignUp}
          onSuccess={handleAuthSuccess}
        />
      )}

      {activeModal === "signUp" && (
        <SignUpModal
          onClose={closeModal}
          onSwitchToSignIn={switchToSignIn}
          onSuccess={handleAuthSuccess}
        />
      )}

      {activeModal === "logOut" && <LogOutModal onClose={closeModal} />}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = (): AuthModalContextValue => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
};
