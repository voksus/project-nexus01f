import clsx from "clsx";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { PopularRecipes } from "../../components/PopularRecipes/PopularRecipes.tsx";
import { RecipeContent } from "../../components/RecipeContent/RecipeContent.tsx";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { fetchRecipeById } from "../../redux/recipes/operations.ts";
import { resetRecipeDetails } from "../../redux/recipes/recipeDetailsSlice.ts";
import {
  selectRecipeDetails,
  selectRecipeDetailsError,
  selectRecipeDetailsIsLoading,
} from "../../redux/recipes/selectors.ts";
import styles from "./RecipePage.module.css";

export const RecipePage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const recipe = useAppSelector(selectRecipeDetails);
  const isRecipeLoading = useAppSelector(selectRecipeDetailsIsLoading);
  const error = useAppSelector(selectRecipeDetailsError);

  useEffect(() => {
    if (!id) return;

    window.scrollTo({ top: 0, behavior: "smooth" });
    const promise = dispatch(fetchRecipeById(id));

    return () => {
      promise.abort();
      dispatch(resetRecipeDetails());
    };
  }, [dispatch, id]);

  return (
    <main className={clsx("container")}>
      <div className={styles.recipePage}>
        {isRecipeLoading && <p>Loading recipe...</p>}

        {!isRecipeLoading && error && (
          <div>
            <p>{error}</p>
            <Link to="/">Back to Home</Link>
          </div>
        )}

        {!isRecipeLoading && !error && recipe && (
          <RecipeContent recipe={recipe} />
        )}
        <PopularRecipes />
      </div>
    </main>
  );
};
