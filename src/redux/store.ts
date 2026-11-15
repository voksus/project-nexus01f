import {
  configureStore,
  type ThunkAction,
  type UnknownAction,
} from "@reduxjs/toolkit";
import { api, authApi } from "../services/api.ts";
import { createAuthSession } from "../services/session.ts";
import { sessionReceived } from "./auth/authSlice.ts";
import { rootReducer } from "./rootReducer.ts";
import { sessionCleared } from "./sessionActions.ts";

export const store = configureStore({ reducer: rootReducer });
let navigateHome: (() => void) | undefined;

export const authSession = createAuthSession({
  api,
  authApi,
  storage: {
    getItem: (key) => window.localStorage.getItem(key),
    setItem: (key, value) => window.localStorage.setItem(key, value),
    removeItem: (key) => window.localStorage.removeItem(key),
  },
  isOnline: () => navigator.onLine,
  withLock: (task) =>
    navigator.locks
      ? navigator.locks.request("foodies-auth-cookie", task)
      : task(),
  onUser: (user) => store.dispatch(sessionReceived(user)),
  onReset: () => store.dispatch(sessionCleared()),
  onNavigateHome: () => {
    if (navigateHome) navigateHome();
    else window.location.replace("/");
  },
});

export const setAuthNavigation = (callback?: () => void) => {
  navigateHome = callback;
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<T = void> = ThunkAction<
  T,
  RootState,
  unknown,
  UnknownAction
>;
