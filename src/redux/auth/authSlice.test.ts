import { describe, expect, it } from "vitest";
import type { AuthUser } from "../../types/auth.ts";
import { sessionCleared } from "../sessionActions.ts";
import { authReducer, avatarUpdated, sessionReceived } from "./authSlice.ts";

const user: AuthUser = {
  id: "user-1",
  name: "Olena",
  email: "olena@example.com",
  avatar: null,
};

const signedOut = authReducer(undefined, { type: "unknown" });

describe("avatarUpdated", () => {
  it("replaces only the avatar of the signed-in user", () => {
    const signedIn = authReducer(signedOut, sessionReceived(user));
    const next = authReducer(
      signedIn,
      avatarUpdated("https://cdn.example/a.png"),
    );

    expect(next.user).toEqual({
      ...user,
      avatar: "https://cdn.example/a.png",
    });
    expect(next.isInitialized).toBe(true);
  });

  it("does nothing when nobody is signed in", () => {
    const next = authReducer(
      signedOut,
      avatarUpdated("https://cdn.example/a.png"),
    );

    expect(next.user).toBeNull();
  });

  it("clears the updated avatar together with the session", () => {
    const signedIn = authReducer(
      authReducer(signedOut, sessionReceived(user)),
      avatarUpdated("https://cdn.example/a.png"),
    );
    const next = authReducer(signedIn, sessionCleared());

    expect(next.user).toBeNull();
    expect(next.isInitialized).toBe(true);
  });
});
