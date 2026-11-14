import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initializeAuth } from "../redux/auth/operations.ts";
import { useAppDispatch } from "../redux/hooks.ts";
import { authSession, setAuthNavigation } from "../redux/store.ts";

export const useAuthLifecycle = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    setAuthNavigation(() => navigate("/", { replace: true }));
    const onOnline = () => {
      void authSession.handleOnline();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea === window.localStorage)
        void authSession.handleStorageEvent(event);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("storage", onStorage);
    void dispatch(initializeAuth());
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("storage", onStorage);
      setAuthNavigation();
    };
  }, [dispatch, navigate]);
};
