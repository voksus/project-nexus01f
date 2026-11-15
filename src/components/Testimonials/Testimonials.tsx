import clsx from "clsx";
import { Icon } from "../ui/Icon/Icon.tsx";
import { Loader } from "../ui/Loader/Loader.tsx";
import { MainTitle } from "../ui/MainTitle/MainTitle.tsx";
import { Subtitle } from "../ui/Subtitle/Subtitle.tsx";
import styles from "./Testimonials.module.css";
import { useTestimonials } from "./useTestimonials.ts";

export const Testimonials = () => {
  const { items, isLoading, activeIndex, setActiveIndex } = useTestimonials();

  if (isLoading) return <Loader />;
  if (items.length === 0) return null;

  return (
    <section aria-label="Testimonials">
      <div className={clsx("container", styles.content)}>
        <div className={styles.heading}>
          <Subtitle className={styles.subtitle}>What our customer say</Subtitle>
          <MainTitle>Testimonials</MainTitle>
        </div>

        <Icon name="quote" className={styles.quote} />

        {/* Усі слайди в одній клітинці grid: висота блоку = найдовший відгук, сторінка не стрибає при перемиканні */}
        <div className={styles.slides} aria-live="polite">
          {items.map((item, index) => (
            <figure
              key={item.id}
              className={clsx(
                styles.slide,
                index === activeIndex && styles.slideActive,
              )}
              aria-hidden={index !== activeIndex}
            >
              <blockquote className={styles.text}>
                <p>{item.testimonial}</p>
              </blockquote>
              <figcaption className={styles.author}>
                {item.owner.name}
              </figcaption>
            </figure>
          ))}
        </div>

        {items.length > 1 && (
          <div className={styles.dots}>
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={styles.dot}
                aria-label={`Show testimonial ${index + 1} of ${items.length}`}
                aria-current={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
