import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader } from "./components/ui/Loader/Loader.tsx";
import { MainTitle } from "./components/ui/MainTitle/MainTitle.tsx";
import { Subtitle } from "./components/ui/Subtitle/Subtitle.tsx";

const HomePage = lazy(() => import("./pages/HomePage/HomePage.tsx"));

const PagePlaceholder = ({ title }: { title: string }) => (
  <main className="container" style={{ padding: "48px 16px" }}>
    <MainTitle>{title}</MainTitle>
    <Subtitle>
      Page module will be connected according to Trello ticket.
    </Subtitle>
  </main>
);

export const App = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* [FE-04]: модалки; [FE-05], [FE-06]: HomePage */}
          <Route path="/" element={<HomePage />} />

          {/* [FE-07]: RecipePage */}
          <Route
            path="/recipe/:id"
            element={<PagePlaceholder title="Recipe Page" />}
          />

          {/* [FE-08]: AddRecipePage (канонічний шлях /recipe/add + редірект з /add за рішенням #6) */}
          <Route
            path="/recipe/add"
            element={<PagePlaceholder title="Add Recipe Page" />}
          />
          <Route path="/add" element={<Navigate to="/recipe/add" replace />} />

          {/* [FE-09]: UserPage (PrivateRoute буде підключено в [FE-02]) */}
          <Route
            path="/user/:id"
            element={<PagePlaceholder title="User Profile Page" />}
          />

          {/* TODO [FE-03] (404)*/}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
