import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  addRecipeToFavorites,
  removeRecipeFromFavorites,
} from "../services/recipesApi.ts";
import { getErrorMessage } from "../utils/getErrorMessage.ts";

export const useFavorite = (recipeId: string, initialValue: boolean) => {
  const [isFavorite, setIsFavorite] = useState(initialValue);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsFavorite(initialValue);
  }, [initialValue]);

  const toggleFavorite = useCallback(async () => {
    if (isPending) return;

    const next = !isFavorite;
    setIsFavorite(next);
    setIsPending(true);

    try {
      if (next) {
        await addRecipeToFavorites(recipeId);
      } else {
        await removeRecipeFromFavorites(recipeId);
      }
    } catch (error) {
      setIsFavorite(!next);
      // The rate limit toast is shown globally by the API client
      if (!(axios.isAxiosError(error) && error.response?.status === 429)) {
        toast.error(getErrorMessage(error, "Unable to update favorites."));
      }
    } finally {
      setIsPending(false);
    }
  }, [recipeId, isFavorite, isPending]);

  return { isFavorite, isPending, toggleFavorite };
};
