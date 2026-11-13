import { configureStore } from "@reduxjs/toolkit";

// Тимчасовий кореневий ред'юсер до підключення authSlice ([FE-02]) та довідників ([FE-06])
const appStatusReducer = (state = { initialized: true }) => state;

export const store = configureStore({
  reducer: {
    appStatus: appStatusReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
