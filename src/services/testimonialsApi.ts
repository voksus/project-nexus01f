import type { Testimonial } from "../types/api.ts";
import { api } from "./api.ts";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isTestimonial = (value: unknown): value is Testimonial =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.testimonial === "string" &&
  isRecord(value.owner) &&
  typeof value.owner.id === "string" &&
  typeof value.owner.name === "string";

export const fetchTestimonials = async (
  signal?: AbortSignal,
): Promise<Testimonial[]> => {
  const { data } = await api.get<unknown>("/testimonials", { signal });

  if (!Array.isArray(data)) {
    throw new Error("Unexpected /testimonials response shape");
  }

  // Биті записи пропускаємо, щоб один некоректний відгук не ламав увесь блок
  return data.filter(isTestimonial);
};
