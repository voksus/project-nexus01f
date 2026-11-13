export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Area {
  id: string;
  name: string;
}

export interface Ingredient {
  id: string;
  name: string;
  desc?: string | null;
  img?: string | null;
}

export interface UserShort {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface CurrentUserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  recipesCount: number;
  favoritesCount: number;
  followersCount: number;
  followingCount: number;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  recipesCount: number;
  followersCount: number;
  isFollowing?: boolean;
}

export interface RecipeCardItem {
  id: string;
  title: string;
  description?: string | null;
  thumb?: string | null;
  time?: number | null;
  owner: UserShort;
  isFavorite?: boolean;
}

export interface RecipeIngredientDetail {
  id: string;
  name: string;
  img?: string | null;
  measure: string | null;
}

export interface RecipeDetail extends RecipeCardItem {
  instructions: string;
  category: Category;
  area: Area;
  ingredients: RecipeIngredientDetail[];
}

export interface UserRecipePreview {
  id: string;
  title: string;
  thumb?: string | null;
}

export interface UserCardItem {
  id: string;
  name: string;
  avatar?: string | null;
  recipesCount: number;
  isFollowing?: boolean;
  recipes: UserRecipePreview[];
}

export interface Testimonial {
  id: string;
  testimonial: string;
  owner: UserShort;
}
