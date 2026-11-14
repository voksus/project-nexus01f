import { useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "../../../hooks/useMediaQuery.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { fetchRecipes } from "../../../redux/recipes/operations.ts";
import { resetRecipes } from "../../../redux/recipes/recipesSlice.ts";
import {
  selectRecipes,
  selectRecipesError,
  selectRecipesIsLoading,
  selectRecipesTotalPages,
} from "../../../redux/recipes/selectors.ts";
import type { Category } from "../../../types/api.ts";
import { RecipeCard } from "../../recipes/RecipeCard/RecipeCard.tsx";
import { Icon } from "../../ui/Icon/Icon.tsx";
import { Loader } from "../../ui/Loader/Loader.tsx";
import { MainTitle } from "../../ui/MainTitle/MainTitle.tsx";
import { Pagination } from "../../ui/Pagination/Pagination.tsx";
import { Subtitle } from "../../ui/Subtitle/Subtitle.tsx";
import { RecipeFilters } from "../RecipeFilters/RecipeFilters.tsx";
import styles from "./Recipes.module.css";

interface RecipesProps {
  category: Category | null;
  onBack: () => void;
}

const DESKTOP_LIMIT = 12;
const MOBILE_LIMIT = 8;

export const Recipes = ({ category, onBack }: RecipesProps) => {
  const dispatch = useAppDispatch();
  const recipes = useAppSelector(selectRecipes);
  const totalPages = useAppSelector(selectRecipesTotalPages);
  const isLoading = useAppSelector(selectRecipesIsLoading);
  const error = useAppSelector(selectRecipesError);

  const sectionRef = useRef<HTMLElement>(null);
  const limit = useMediaQuery("(max-width: 767px)")
    ? MOBILE_LIMIT
    : DESKTOP_LIMIT;
  const categoryId = category?.id;

  const [ingredient, setIngredient] = useState("");
  const [area, setArea] = useState("");
  const [page, setPage] = useState(1);
  const [prevLimit, setPrevLimit] = useState(limit);

  if (prevLimit !== limit) {
    setPrevLimit(limit);
    setPage(1);
  }

  const scrollToSection = useCallback(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const loadRecipes = useCallback(
    () =>
      dispatch(
        fetchRecipes({
          category: categoryId,
          ingredient: ingredient || undefined,
          area: area || undefined,
          page,
          limit,
        }),
      ),
    [dispatch, categoryId, ingredient, area, page, limit],
  );

  useEffect(() => {
    const request = loadRecipes();
    return () => request.abort();
  }, [loadRecipes]);

  useEffect(() => {
    scrollToSection();
    return () => {
      dispatch(resetRecipes());
    };
  }, [dispatch, scrollToSection]);

  const hasActiveFilters = Boolean(ingredient || area);
  const isEmpty = !isLoading && !error && recipes.length === 0;

  const handleIngredientChange = (value: string) => {
    setIngredient(value);
    setPage(1);
  };

  const handleAreaChange = (value: string) => {
    setArea(value);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    scrollToSection();
  };

  const handleResetFilters = () => {
    setIngredient("");
    setArea("");
    setPage(1);
  };

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.header}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          <Icon name="arrow-up-right" className={styles.backIcon} />
          Back
        </button>
        <MainTitle>{category?.name ?? "All categories"}</MainTitle>
        <Subtitle className={styles.subtitle}>
          Go on a taste journey, where every sip is a sophisticated creative
          chord, and every dish is an expression of the most refined gastronomic
          desires.
        </Subtitle>
      </div>

      <div className={styles.content}>
        <RecipeFilters
          ingredient={ingredient}
          area={area}
          onIngredientChange={handleIngredientChange}
          onAreaChange={handleAreaChange}
        />

        <div className={styles.results}>
          {isLoading && recipes.length === 0 && <Loader />}

          {error && !isLoading && (
            <div className={styles.message} role="alert">
              <p>{error}</p>
              <button
                type="button"
                className={styles.messageButton}
                onClick={loadRecipes}
              >
                Try again
              </button>
            </div>
          )}

          {isEmpty && (
            <div className={styles.message}>
              <p>
                {hasActiveFilters
                  ? "No recipes found for the selected filters. Try changing or resetting them."
                  : "No recipes have been added to this category yet."}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  className={styles.messageButton}
                  onClick={handleResetFilters}
                >
                  Reset filters
                </button>
              )}
            </div>
          )}

          {recipes.length > 0 && !error && (
            <ul
              className={styles.list}
              data-loading={isLoading}
              aria-busy={isLoading}
            >
              {recipes.map((recipe) => (
                <li key={recipe.id}>
                  <RecipeCard recipe={recipe} />
                </li>
              ))}
            </ul>
          )}

          {!error && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </section>
  );
};
