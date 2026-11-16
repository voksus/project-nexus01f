import { selectIsAuthenticated } from "../redux/auth/selectors.ts";
import { useAppSelector } from "../redux/hooks.ts";

export const useAuthGate = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return {
    isAuthenticated,
    // TODO [FE-04]: open SignInModal; after sign-in it should return to the current page
    openSignIn: () => undefined,
  };
};
