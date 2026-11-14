import { useEffect, useState } from "react";
import { fetchTestimonials } from "../../services/testimonialsApi.ts";
import type { Testimonial } from "../../types/api.ts";

const AUTOPLAY_DELAY_MS = 5000;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const useTestimonials = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchTestimonials(controller.signal)
      .then(setItems)
      .catch(() => {
        // Блок відгуків не критичний для сторінки: при помилці просто не показуємо його
        if (!controller.signal.aborted) setItems([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  // Таймер перезапускається після кожної зміни слайду, тож ручне перемикання не «з'їдає» паузу
  useEffect(() => {
    if (items.length < 2 || prefersReducedMotion()) return;

    const timerId = window.setTimeout(() => {
      setActiveIndex((activeIndex + 1) % items.length);
    }, AUTOPLAY_DELAY_MS);

    return () => window.clearTimeout(timerId);
  }, [activeIndex, items.length]);

  return {
    items,
    isLoading,
    activeIndex,
    setActiveIndex,
  };
};
