import { Link } from "react-router-dom";
import { MainTitle } from "../../components/ui/MainTitle/MainTitle.tsx";
import { Subtitle } from "../../components/ui/Subtitle/Subtitle.tsx";
import styles from "./NotFoundPage.module.css";

// Окремого макета 404 немає — темний блок як у Hero, щоб на ньому стояв темний Header
const NotFoundPage = () => {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code}>404</p>
        <MainTitle as="h1" className={styles.title}>
          Page not found
        </MainTitle>
        <Subtitle className={styles.text}>
          The page you are looking for doesn&apos;t exist or has been moved.
        </Subtitle>
        <Link to="/" className={styles.button}>
          Back to home
        </Link>
      </div>
    </main>
  );
};

export default NotFoundPage;
