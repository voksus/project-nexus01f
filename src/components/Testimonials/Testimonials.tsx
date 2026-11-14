import clsx from "clsx";
import { Loader } from "../ui/Loader/Loader.tsx";
import { MainTitle } from "../ui/MainTitle/MainTitle.tsx";
import { Subtitle } from "../ui/Subtitle/Subtitle.tsx";
import styles from "./Testimonials.module.css";
import { useTestimonials } from "./useTestimonials.ts";

// TODO [FE-00]: замінити на іконку quote зі спрайту icons.svg, коли він з'явиться
const QuoteIcon = () => (
  <svg
    className={styles.quote}
    viewBox="0 0 59 48"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M0 48V36C0 20 5 8 14 0l9.2 7.2c-5.6 5.6-8.7 10.8-9.8 16.3h11.2V48z" />
    <path d="M34.1 48V36c0-16 5-28 14-36l9.2 7.2c-5.6 5.6-8.7 10.8-9.8 16.3h11.3V48z" />
  </svg>
);

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

        <QuoteIcon />

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
              <figcaption className={styles.author}>{item.owner.name}</figcaption>
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
