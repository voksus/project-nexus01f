import type { UserShort } from "../types/api.ts";

/**
 * Поточний користувач для Header.
 * TODO [FE-02]: після мерджу authSlice (#4) замінити на `useAppSelector(selectUser)`.
 */
export const useAuthUser = (): UserShort | null => null;
