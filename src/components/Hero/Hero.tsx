import { Subtitle } from "../ui/Subtitle/Subtitle.tsx";
import styles from "./Hero.module.css";

const TABLET_MEDIA = "(min-width: 768px)";

interface HeroProps {
  onAddRecipe: () => void;
}

export const Hero = ({ onAddRecipe }: HeroProps) => {
  return (
    <section className={styles.section}>
      <div className={styles.hero}>
        {/* Декоративні вертикальні лінії з макета */}
        <span className={styles.lines} aria-hidden="true">
          <span className={styles.line} />
          <span className={styles.line} />
          <span className={styles.line} />
          <span className={styles.line} />
        </span>

        <h1 className={styles.title}>Improve Your Culinary Talents</h1>
        <Subtitle className={styles.subtitle}>
          Amazing recipes for beginners in the world of cooking, enveloping you
          in the aromas and tastes of various cuisines.
        </Subtitle>
        <button type="button" className={styles.button} onClick={onAddRecipe}>
          Add recipe
        </button>

        {/* Поворот і скруглення вже є в самих зображеннях */}
        <div className={styles.images}>
          <picture className={styles.imageSmall}>
            <source
              media={TABLET_MEDIA}
              type="image/webp"
              srcSet="/images/hero/hero-small.webp 1x, /images/hero/hero-small@2x.webp 2x"
            />
            <source
              media={TABLET_MEDIA}
              srcSet="/images/hero/hero-small.png 1x, /images/hero/hero-small@2x.png 2x"
            />
            <source
              type="image/webp"
              srcSet="/images/hero/hero-small-mobile.webp 1x, /images/hero/hero-small-mobile@2x.webp 2x"
            />
            <img
              src="/images/hero/hero-small-mobile.png"
              srcSet="/images/hero/hero-small-mobile.png 1x, /images/hero/hero-small-mobile@2x.png 2x"
              width={89}
              height={84}
              alt="Plated beef dish with sauce"
            />
          </picture>

          <picture className={styles.imageMain}>
            <source
              media={TABLET_MEDIA}
              type="image/webp"
              srcSet="/images/hero/hero-main.webp 1x, /images/hero/hero-main@2x.webp 2x"
            />
            <source
              media={TABLET_MEDIA}
              srcSet="/images/hero/hero-main.png 1x, /images/hero/hero-main@2x.png 2x"
            />
            <source
              type="image/webp"
              srcSet="/images/hero/hero-main-mobile.webp 1x, /images/hero/hero-main-mobile@2x.webp 2x"
            />
            <img
              src="/images/hero/hero-main-mobile.png"
              srcSet="/images/hero/hero-main-mobile.png 1x, /images/hero/hero-main-mobile@2x.png 2x"
              width={222}
              height={208}
              alt="Sliced beef Wellington on a wooden board"
            />
          </picture>
        </div>
      </div>
    </section>
  );
};
