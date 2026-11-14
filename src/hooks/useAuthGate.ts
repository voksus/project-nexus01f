// Temporary seam: replace the body with the auth selector ([FE-02]) and the SignInModal opener ([FE-04])
export const useAuthGate = () => ({
  isAuthenticated: false,
  openSignIn: () => undefined,
});
