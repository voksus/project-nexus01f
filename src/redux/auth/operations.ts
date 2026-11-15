import { nanoid } from "@reduxjs/toolkit";
import axios from "axios";
import type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from "../../types/auth.ts";
import { type AppThunk, authSession } from "../store.ts";
import { requestFailed, requestStarted } from "./authSlice.ts";

const authenticate =
  (request: () => Promise<AuthUser>): AppThunk<Promise<AuthUser>> =>
  async (dispatch) => {
    const promise = request();
    const requestId = nanoid();
    dispatch(requestStarted(requestId));
    try {
      return await promise;
    } catch (error) {
      if (!axios.isCancel(error)) {
        const data: unknown = axios.isAxiosError(error)
          ? error.response?.data
          : undefined;
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Unable to sign in. Please try again.";
        dispatch(requestFailed({ requestId, message }));
      }
      throw error;
    }
  };

export const login = (credentials: LoginCredentials) =>
  authenticate(() => authSession.login(credentials));
export const register = (credentials: RegisterCredentials) =>
  authenticate(() => authSession.register(credentials));
export const logout = (): AppThunk<Promise<void>> => () => authSession.logout();
export const initializeAuth = (): AppThunk<Promise<void>> => () =>
  authSession.initialize();
