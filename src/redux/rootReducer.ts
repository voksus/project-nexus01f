import { combineReducers, type UnknownAction } from "@reduxjs/toolkit";
import { authReducer } from "./auth/authSlice.ts";
import { sessionCleared } from "./sessionActions.ts";

const appReducer = combineReducers({ auth: authReducer });

export const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: UnknownAction,
) => appReducer(sessionCleared.match(action) ? undefined : state, action);
