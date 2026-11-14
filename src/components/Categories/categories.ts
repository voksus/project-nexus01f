export interface CategoryItem {
  /** Назва як у БД — саме її бекенд приймає у `GET /api/recipes?category=` */
  name: string;
  /** Підпис на картці, якщо відрізняється від назви в БД */
  label?: string;
}

// Порядок — як у макеті. Список статичний, бо картинки категорій лежать на фронті,
// а BE-04 (`GET /api/categories`) ще не готовий
export const CATEGORIES: CategoryItem[] = [
  { name: "Beef" },
  { name: "Breakfast" },
  { name: "Dessert", label: "Desserts" },
  { name: "Lamb" },
  { name: "Goat" },
  { name: "Miscellaneous" },
  { name: "Pasta" },
  { name: "Pork" },
  { name: "Seafood" },
  { name: "Side" },
  { name: "Starter" },
  { name: "Vegetarian" },
  { name: "Vegan" },
  { name: "Chicken" },
  { name: "Soup" },
];

/** Скільки карток показувати до «All categories» на tablet/desktop; на mobile CSS ховає останні 3 */
export const COLLAPSED_COUNT = 11;
export const COLLAPSED_COUNT_MOBILE = 8;
