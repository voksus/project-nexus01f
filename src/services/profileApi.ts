import type {
  CurrentUserProfile,
  MessageResponse,
  PaginatedResponse,
  PaginationQuery,
  PublicUserProfile,
  RecipeCardItem,
  UserCardItem,
  UserRecipePreview,
  UserShort,
} from "../types/api.ts";
import { api } from "./api.ts";

export interface ProfileRecipesQuery extends PaginationQuery {
  userId?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

const isUserShort = (value: unknown): value is UserShort =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string" &&
  isNullableString(value.avatar);

const isCurrentProfile = (value: unknown): value is CurrentUserProfile =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string" &&
  typeof value.email === "string" &&
  isNullableString(value.avatar) &&
  isFiniteNumber(value.recipesCount) &&
  isFiniteNumber(value.favoritesCount) &&
  isFiniteNumber(value.followersCount) &&
  isFiniteNumber(value.followingCount);

const isPublicProfile = (value: unknown): value is PublicUserProfile =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string" &&
  typeof value.email === "string" &&
  isNullableString(value.avatar) &&
  isFiniteNumber(value.recipesCount) &&
  isFiniteNumber(value.followersCount) &&
  typeof value.isFollowing === "boolean";

const isRecipeCard = (value: unknown): value is RecipeCardItem =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.title === "string" &&
  isNullableString(value.description) &&
  isNullableString(value.thumb) &&
  (value.time === null || isFiniteNumber(value.time)) &&
  isUserShort(value.owner) &&
  typeof value.isFavorite === "boolean";

const isRecipePreview = (value: unknown): value is UserRecipePreview =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.title === "string" &&
  isNullableString(value.thumb);

const isUserCard = (value: unknown): value is UserCardItem =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string" &&
  isNullableString(value.avatar) &&
  isFiniteNumber(value.recipesCount) &&
  typeof value.isFollowing === "boolean" &&
  Array.isArray(value.recipes) &&
  value.recipes.every(isRecipePreview);

const isMessage = (value: unknown): value is MessageResponse =>
  isRecord(value) && typeof value.message === "string";

const isPaginated = (
  value: unknown,
): value is {
  items: unknown[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} =>
  isRecord(value) &&
  Array.isArray(value.items) &&
  isFiniteNumber(value.total) &&
  isFiniteNumber(value.page) &&
  isFiniteNumber(value.limit) &&
  isFiniteNumber(value.totalPages);

const isAvatarResponse = (value: unknown): value is { avatar: string | null } =>
  isRecord(value) && isNullableString(value.avatar);

const unexpected = (path: string) =>
  new Error(`Unexpected ${path} response shape`);

const read = <T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  path: string,
): T => {
  if (!guard(value)) throw unexpected(path);
  return value;
};

const readPage = <T>(
  value: unknown,
  isItem: (item: unknown) => item is T,
  path: string,
): PaginatedResponse<T> => {
  if (!isPaginated(value)) throw unexpected(path);

  const items: T[] = [];
  for (const item of value.items) {
    if (!isItem(item)) throw unexpected(path);
    items.push(item);
  }

  return {
    items,
    total: value.total,
    page: value.page,
    limit: value.limit,
    totalPages: value.totalPages,
  };
};

const listParams = (
  query: PaginationQuery & { userId?: string },
): Record<string, number | string> => {
  const params: Record<string, number | string> = {};
  if (query.page !== undefined) params.page = query.page;
  if (query.limit !== undefined) params.limit = query.limit;
  if (query.userId !== undefined) params.userId = query.userId;
  return params;
};

const userPath = (id: string, suffix = "") =>
  `/users/${encodeURIComponent(id)}${suffix}`;

export const getCurrentProfile = async (
  signal?: AbortSignal,
): Promise<CurrentUserProfile> => {
  const { data } = await api.get<unknown>("/users/current", { signal });
  return read(data, isCurrentProfile, "/users/current");
};

export const getUserProfile = async (
  id: string,
  signal?: AbortSignal,
): Promise<PublicUserProfile> => {
  const path = userPath(id);
  const { data } = await api.get<unknown>(path, { signal });
  return read(data, isPublicProfile, path);
};

export const updateAvatar = async (
  file: File,
): Promise<{ avatar: string | null }> => {
  const body = new FormData();
  body.append("avatar", file);
  const { data } = await api.patch<unknown>("/users/avatars", body);
  return read(data, isAvatarResponse, "/users/avatars");
};

export const getProfileRecipes = async (
  query: ProfileRecipesQuery = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<RecipeCardItem>> => {
  const { data } = await api.get<unknown>("/recipes/own", {
    params: listParams(query),
    signal,
  });
  return readPage(data, isRecipeCard, "/recipes/own");
};

export const getFavoriteRecipes = async (
  query: PaginationQuery = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<RecipeCardItem>> => {
  const { data } = await api.get<unknown>("/recipes/favorites", {
    params: listParams(query),
    signal,
  });
  return readPage(data, isRecipeCard, "/recipes/favorites");
};

export const getFollowers = async (
  id: string,
  query: PaginationQuery = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<UserCardItem>> => {
  const path = userPath(id, "/followers");
  const { data } = await api.get<unknown>(path, {
    params: listParams(query),
    signal,
  });
  return readPage(data, isUserCard, path);
};

export const getFollowing = async (
  query: PaginationQuery = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<UserCardItem>> => {
  const { data } = await api.get<unknown>("/users/following", {
    params: listParams(query),
    signal,
  });
  return readPage(data, isUserCard, "/users/following");
};

export const followUser = async (id: string): Promise<MessageResponse> => {
  const path = userPath(id, "/follow");
  const { data } = await api.post<unknown>(path);
  return read(data, isMessage, path);
};

export const unfollowUser = async (id: string): Promise<MessageResponse> => {
  const path = userPath(id, "/follow");
  const { data } = await api.delete<unknown>(path);
  return read(data, isMessage, path);
};

export const deleteOwnRecipe = async (id: string): Promise<void> => {
  await api.delete(`/recipes/${encodeURIComponent(id)}`);
};

export const removeFavoriteRecipe = async (
  id: string,
): Promise<MessageResponse> => {
  const path = `/recipes/${encodeURIComponent(id)}/favorite`;
  const { data } = await api.delete<unknown>(path);
  return read(data, isMessage, path);
};
