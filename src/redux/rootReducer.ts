import { combineReducers, type UnknownAction } from "@reduxjs/toolkit";
import { authReducer } from "./auth/authSlice.ts";
import { filtersReducer } from "./filters/filtersSlice.ts";
import { recipesReducer } from "./recipes/recipesSlice.ts";
import { referencesReducer } from "./references/referencesSlice.ts";
import { sessionCleared } from "./sessionActions.ts";

const appReducer = combineReducers({
  auth: authReducer,
  filters: filtersReducer,
  recipes: recipesReducer,
  references: referencesReducer,
});

type AppState = ReturnType<typeof appReducer>;

// Public references survive the session reset
export const rootReducer = (
  state: AppState | undefined,
  action: UnknownAction,
) =>
  appReducer(
    sessionCleared.match(action) ? { references: state?.references } : state,
    action,
  );
