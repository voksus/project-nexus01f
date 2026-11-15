import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  selectIsAuthenticated,
  selectIsInitialized,
} from "../../redux/auth/selectors.ts";
import { useAppSelector } from "../../redux/hooks.ts";
import { Loader } from "../ui/Loader/Loader.tsx";

export const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const initialized = useAppSelector(selectIsInitialized);
  const authenticated = useAppSelector(selectIsAuthenticated);
  if (!initialized) return <Loader />;
  return authenticated ? (
    children
  ) : (
    <Navigate to="/" replace state={{ from: location }} />
  );
};
