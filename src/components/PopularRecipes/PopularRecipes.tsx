import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { fetchPopularRecipes } from "../../redux/recipes/operations.ts";
import {
  selectPopularRecipes,
  selectPopularRecipesError,
  selectPopularRecipesIsLoading,
} from "../../redux/recipes/selectors.ts";
import { RecipeCard } from "../RecipeCard/RecipeCard.tsx";
import styles from "./PopularRecipes.module.css";

export const PopularRecipes = () => {
  const dispatch = useAppDispatch();

  const recipes = useAppSelector(selectPopularRecipes);
  const isLoading = useAppSelector(selectPopularRecipesIsLoading);
  const error = useAppSelector(selectPopularRecipesError);

  useEffect(() => {
    const promise = dispatch(fetchPopularRecipes());

    return () => {
      promise.abort();
    };
  }, [dispatch]);

  if (!isLoading && !error && recipes.length === 0) {
    return null;
  }

  return (
    <section className={styles.popularRecipes}>
      <h2 className={styles.popularRecipesTitle}>Popular recipes</h2>

      {isLoading && <p>Loading popular recipes...</p>}

      {!isLoading && error && <p>{error}</p>}

      {!isLoading && !error && recipes.length > 0 && (
        <ul className={styles.popularRecipesList}>
          {recipes.map((recipe) => (
            <li className={styles.popularRecipesItem} key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
