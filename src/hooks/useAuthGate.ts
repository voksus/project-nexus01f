import { useAuthModal } from "../components/auth/AuthModalContext.tsx";
import { selectIsAuthenticated } from "../redux/auth/selectors.ts";
import { useAppSelector } from "../redux/hooks.ts";

export const useAuthGate = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { openSignIn } = useAuthModal();

  return {
    isAuthenticated,
    openSignIn,
  };
};
