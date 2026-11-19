import type { Area, Category, Ingredient } from "../types/api.ts";
import { publicApi } from "./api.ts";

type Named = { id: string; name: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNamed = (value: unknown): value is Named & Record<string, unknown> =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string";

const fetchList = async <T>(
  path: string,
  toItem: (value: Named & Record<string, unknown>) => T,
  signal?: AbortSignal,
): Promise<T[]> => {
  const { data } = await publicApi.get<unknown>(path, { signal });

  if (!Array.isArray(data)) {
    throw new Error(`Unexpected ${path} response shape`);
  }

  // Skip malformed items instead of failing the whole list
  return data.filter(isNamed).map(toItem);
};

const toNamed = ({ id, name }: Named): Named => ({ id, name });

const optionalString = (value: unknown) =>
  typeof value === "string" ? value : null;

export const fetchCategories = (signal?: AbortSignal): Promise<Category[]> =>
  fetchList("/categories", toNamed, signal);

export const fetchAreas = (signal?: AbortSignal): Promise<Area[]> =>
  fetchList("/areas", toNamed, signal);

export const fetchIngredients = (signal?: AbortSignal): Promise<Ingredient[]> =>
  fetchList(
    "/ingredients",
    (item) => ({
      id: item.id,
      name: item.name,
      desc: optionalString(item.desc),
      img: optionalString(item.img),
    }),
    signal,
  );
