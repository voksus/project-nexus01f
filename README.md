# Foodies frontend

## Local development

Use Node.js 24 and run:

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell use `Copy-Item .env.example .env`. Vite proxies /api to http://localhost:3000. Production uses the existing Vercel rewrite to Render; keep VITE_API_URL=/api for same-origin cookies. A direct cross-origin URL also requires compatible backend cookie and CORS settings.

## FE-02 authentication

The shared Axios instance is exported from src/services/api.ts. All requests use withCredentials: true. Tokens stay in httpOnly cookies; the client does not persist tokens or include them in Redux actions/state. JSON accessToken fields returned for Swagger are ignored.

The backend contract is:

| Request                 | Expected result                                                 |
| ----------------------- | --------------------------------------------------------------- |
| POST /api/auth/register | 201 with user: { id, name, email, avatar }; sets both cookies   |
| POST /api/auth/login    | 200 with user: { id, name, email, avatar }; sets both cookies   |
| POST /api/auth/refresh  | Rotates cookies; no body is required by the client              |
| POST /api/auth/logout   | 204, including missing or expired sessions; clears both cookies |
| GET /api/users/current  | Current user as a plain object or under user                    |

The backend auth ticket uses secure production cookies with sameSite=lax and httpOnly=true. Backend BE-03 is not yet available in the repository, so real cookie integration must be checked after it is merged.

Login/register forms use typed Redux operations from src/redux/auth/operations.ts:

```tsx
await dispatch(login({ email, password }));
await dispatch(register({ name, email, password }));
void dispatch(logout());
```

Handle rejected login/register promises in the form. Error and loading selectors are in src/redux/auth/selectors.ts. Logout resolves after its cleanup attempt and clears local state before waiting for the network. The header/modal tickets should call the logout operation rather than POST /auth/logout directly.

App initialization and online/storage listeners are attached by useAuthLifecycle. PrivateRoute protects /recipe/add and /user/:id until initialization completes and a user exists. StrictMode does not duplicate initialization requests. If the first lookup fails because of the network or a server error, an online event retries it. Explicit logout and pending-logout startup never trigger this auto-login recovery.

### Refresh

A 401 on a normal API request triggers one shared refresh and one retry. Login, register, refresh and logout never trigger recursive refresh. Responses from a previous local session are rejected so that pending requests cannot repopulate state after logout. A refresh rejected with 401 or 403 clears the session. A network failure keeps the current user and does not create a refresh loop.

### Offline logout

Clicking logout clears Redux through session/cleared and navigates to / immediately. The finally block repeats local cleanup if the same logout is still current. A pending network request therefore cannot keep the user logged in locally.

The only stored value is the nonsecret foodies_pending_logout=true marker. It is written before the server request to survive closing the tab mid-request and removed after a successful logout. Network errors and server failures keep the marker. If storage is blocked by the browser, local logout still works, but a marker cannot survive a browser reload.

On startup with the marker, neither current-user lookup nor refresh runs. Online recovery first sends logout, then clears the marker, and leaves the client anonymous. A successful intentional login/register clears any old marker. Cookie-changing requests run sequentially within a tab and use Web Locks across tabs where supported, so old logout/refresh requests settle before a newer login.

Storage events clear other tabs. A delayed event whose marker was already removed checks the current cookie session without refresh; it does not replace a newer valid account or restore user state. This handles background tabs that receive events after server cleanup has finished.

Add future profile/favorites reducers to appReducer in src/redux/rootReducer.ts. The root reset passes undefined state to all reducers, clearing their caches together. Those modules should use the shared Axios instance so stale responses are rejected too.

## Verification

Before pushing:

```bash
npm run check
npm run typecheck
npm run test
npm run build
```

check applies Biome fixes; inspect the diff before committing. Tests use Axios adapters and isolated in-memory storage, without backend credentials or a running backend. They cover refresh coalescing, repeated 401s, offline cleanup, pending startup, account changes, late responses and cross-tab ordering.
