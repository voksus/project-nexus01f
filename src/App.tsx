import { lazy } from "react";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthModalProvider } from "./components/auth/AuthModalContext.tsx";
import { PrivateRoute } from "./components/auth/PrivateRoute.tsx";
import { SharedLayout } from "./components/SharedLayout/SharedLayout.tsx";
import { MainTitle } from "./components/ui/MainTitle/MainTitle.tsx";
import { Subtitle } from "./components/ui/Subtitle/Subtitle.tsx";
import { useAuthLifecycle } from "./hooks/useAuthLifecycle.ts";

const AddRecipePage = lazy(() => import("./pages/AddRecipePage/AddRecipePage"));
const HomePage = lazy(() => import("./pages/HomePage/HomePage.tsx"));
const NotFoundPage = lazy(
  () => import("./pages/NotFoundPage/NotFoundPage.tsx"),
);
const RecipePage = lazy(() => import("./pages/RecipePage/RecipePage.tsx"));

const PagePlaceholder = ({ title }: { title: string }) => (
  <main className="container" style={{ padding: "48px 16px" }}>
    <MainTitle>{title}</MainTitle>
    <Subtitle>
      Page module will be connected according to Trello ticket.
    </Subtitle>
  </main>
);

export const App = () => {
  useAuthLifecycle();
  return (
    <AuthModalProvider>
      <Toaster position="top-right" />
      <Routes>
        {/* Темний Header: сторінки, що починаються з чорного блоку */}
        <Route element={<SharedLayout headerTheme="dark" />}>
          {/* [FE-04]: модалки; [FE-05], [FE-06]: HomePage */}
          <Route path="/" element={<HomePage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<SharedLayout headerTheme="light" />}>
          {/* [FE-07]: RecipePage */}
          <Route path="/recipe/:id" element={<RecipePage />} />

          {/* [FE-08]: AddRecipePage (канонічний шлях /recipe/add + редірект з /add за рішенням #6) */}
          <Route
            path="/recipe/add"
            element={
              <PrivateRoute>
                <AddRecipePage />
              </PrivateRoute>
            }
          />
          <Route path="/add" element={<Navigate to="/recipe/add" replace />} />

          {/* [FE-09]: UserPage */}
          <Route
            path="/user/:id"
            element={
              <PrivateRoute>
                <PagePlaceholder title="User Profile Page" />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </AuthModalProvider>
  );
};

export default App;
