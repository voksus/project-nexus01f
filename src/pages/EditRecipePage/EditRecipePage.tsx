import clsx from "clsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { AddRecipeForm } from "../../components/AddRecipeForm/AddRecipeForm.tsx";
import {
  type RecipeFormValues,
  TIME_DEFAULT,
} from "../../components/AddRecipeForm/recipeForm.ts";
import { Loader } from "../../components/ui/Loader/Loader.tsx";
import { MainTitle } from "../../components/ui/MainTitle/MainTitle.tsx";
import { PathInfo } from "../../components/ui/PathInfo/PathInfo.tsx";
import { Subtitle } from "../../components/ui/Subtitle/Subtitle.tsx";
import { selectUser } from "../../redux/auth/selectors.ts";
import { useAppSelector } from "../../redux/hooks.ts";
import { getRecipe } from "../../services/recipesApi.ts";
import type { RecipeDetail } from "../../types/api.ts";
import { getErrorMessage } from "../../utils/getErrorMessage.ts";
import styles from "../AddRecipePage/AddRecipePage.module.css";

const toFormValues = (recipe: RecipeDetail): RecipeFormValues => ({
  thumb: null,
  title: recipe.title,
  description: recipe.description?.trim() ?? "",
  categoryId: recipe.category.id,
  areaId: recipe.area.id,
  time: recipe.time ?? TIME_DEFAULT,
  ingredients: recipe.ingredients.map((item) => ({
    id: item.id,
    measure: item.measure?.trim() ?? "",
  })),
  instructions: recipe.instructions,
});

const EditRecipePage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setRecipe(null);

    getRecipe(id)
      .then((loaded) => {
        if (controller.signal.aborted) return;
        if (!user || loaded.owner.id !== user.id) {
          toast.error("You can only edit your own recipes.");
          navigate(`/recipe/${id}`, { replace: true });
          return;
        }
        setRecipe(loaded);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        toast.error(getErrorMessage(error, "Could not open this recipe."));
        navigate(`/recipe/${id}`, { replace: true });
      });

    return () => controller.abort();
  }, [id, navigate, user]);

  return (
    <main className={clsx("container", styles.page)}>
      <PathInfo current="Edit recipe" />
      {recipe ? (
        <>
          <div className={styles.heading}>
            <MainTitle as="h1">Edit recipe</MainTitle>
            <Subtitle className={styles.subtitle}>
              Update your recipe and keep the dish photo unless you choose a new
              one.
            </Subtitle>
          </div>
          <AddRecipeForm
            mode="edit"
            recipeId={recipe.id}
            initialValues={toFormValues(recipe)}
            existingThumb={recipe.thumb}
          />
        </>
      ) : (
        <Loader />
      )}
    </main>
  );
};

export default EditRecipePage;
