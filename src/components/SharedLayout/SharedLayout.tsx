import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Footer } from "../Footer/Footer.tsx";
import { Header } from "../Header/Header.tsx";
import { Loader } from "../ui/Loader/Loader.tsx";
import styles from "./SharedLayout.module.css";

interface SharedLayoutProps {
  /** `dark` — для сторінок, що починаються з чорного блоку (Hero на `/`, 404) */
  headerTheme: "dark" | "light";
}

export const SharedLayout = ({ headerTheme }: SharedLayoutProps) => {
  return (
    <div className={styles.layout}>
      <Header theme={headerTheme} />
      {/* Suspense усередині каркаса: Header і Footer лишаються на місці, поки вантажиться сторінка */}
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
      <Footer />
    </div>
  );
};
