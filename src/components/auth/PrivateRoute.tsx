import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import {
  selectIsAuthenticated,
  selectIsInitialized,
} from "../../redux/auth/selectors.ts";
import { useAppSelector } from "../../redux/hooks.ts";
import { Loader } from "../ui/Loader/Loader.tsx";

export const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const initialized = useAppSelector(selectIsInitialized);
  const authenticated = useAppSelector(selectIsAuthenticated);
  if (!initialized) return <Loader />;
  return authenticated ? children : <Navigate to="/" replace />;
};
