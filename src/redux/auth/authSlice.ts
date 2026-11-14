import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "../../types/auth.ts";
import { sessionCleared } from "../sessionActions.ts";

interface AuthState {
  user: AuthUser | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  requestId: string | null;
}

const initialState: AuthState = {
  user: null,
  isInitialized: false,
  isLoading: false,
  error: null,
  requestId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionReceived: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isInitialized = true;
      state.isLoading = false;
      state.requestId = null;
      state.error = null;
    },
    requestStarted: (state, action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
      state.requestId = action.payload;
    },
    requestFailed: (
      state,
      action: PayloadAction<{ requestId: string; message: string }>,
    ) => {
      if (state.requestId !== action.payload.requestId) return;
      state.isLoading = false;
      state.requestId = null;
      state.error = action.payload.message;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionCleared, () => ({
      ...initialState,
      isInitialized: true,
    }));
  },
});

export const {
  sessionReceived,
  requestStarted,
  requestFailed,
  clearAuthError,
} = authSlice.actions;
export const authReducer = authSlice.reducer;
