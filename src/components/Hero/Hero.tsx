import heroMainPng2x from "../../assets/images/hero/hero-main@2x.png";
import heroMainWebp2x from "../../assets/images/hero/hero-main@2x.webp";
import heroMainPng from "../../assets/images/hero/hero-main.png";
import heroMainWebp from "../../assets/images/hero/hero-main.webp";
import heroMainMobilePng2x from "../../assets/images/hero/hero-main-mobile@2x.png";
import heroMainMobileWebp2x from "../../assets/images/hero/hero-main-mobile@2x.webp";
import heroMainMobilePng from "../../assets/images/hero/hero-main-mobile.png";
import heroMainMobileWebp from "../../assets/images/hero/hero-main-mobile.webp";
import heroSmallPng2x from "../../assets/images/hero/hero-small@2x.png";
import heroSmallWebp2x from "../../assets/images/hero/hero-small@2x.webp";
import heroSmallPng from "../../assets/images/hero/hero-small.png";
import heroSmallWebp from "../../assets/images/hero/hero-small.webp";
import heroSmallMobilePng2x from "../../assets/images/hero/hero-small-mobile@2x.png";
import heroSmallMobileWebp2x from "../../assets/images/hero/hero-small-mobile@2x.webp";
import heroSmallMobilePng from "../../assets/images/hero/hero-small-mobile.png";
import heroSmallMobileWebp from "../../assets/images/hero/hero-small-mobile.webp";
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
              srcSet={`${heroSmallWebp} 1x, ${heroSmallWebp2x} 2x`}
            />
            <source
              media={TABLET_MEDIA}
              srcSet={`${heroSmallPng} 1x, ${heroSmallPng2x} 2x`}
            />
            <source
              type="image/webp"
              srcSet={`${heroSmallMobileWebp} 1x, ${heroSmallMobileWebp2x} 2x`}
            />
            <img
              src={heroSmallMobilePng}
              srcSet={`${heroSmallMobilePng} 1x, ${heroSmallMobilePng2x} 2x`}
              width={89}
              height={84}
              alt="Plated beef dish with sauce"
            />
          </picture>

          <picture className={styles.imageMain}>
            <source
              media={TABLET_MEDIA}
              type="image/webp"
              srcSet={`${heroMainWebp} 1x, ${heroMainWebp2x} 2x`}
            />
            <source
              media={TABLET_MEDIA}
              srcSet={`${heroMainPng} 1x, ${heroMainPng2x} 2x`}
            />
            <source
              type="image/webp"
              srcSet={`${heroMainMobileWebp} 1x, ${heroMainMobileWebp2x} 2x`}
            />
            <img
              src={heroMainMobilePng}
              srcSet={`${heroMainMobilePng} 1x, ${heroMainMobilePng2x} 2x`}
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
