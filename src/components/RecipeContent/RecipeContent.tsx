import type { SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { PathInfo } from "../../components/ui/PathInfo/PathInfo.tsx";
import { useAuthGate } from "../../hooks/useAuthGate.ts";
import { useFavorite } from "../../hooks/useFavorite.ts";
import type { RecipeDetail } from "../../types/api.ts";
import styles from "./RecipeContent.module.css";

const AVATAR_PLACEHOLDER = "/images/placeholders/avatar.svg";
const RECIPE_PLACEHOLDER = "/images/placeholders/recipe.svg";
const INGREDIENT_PLACEHOLDER = "/images/placeholders/ingredient.svg";

const withFallback =
  (fallback: string) => (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = fallback;
  };

interface RecipeContentProps {
  recipe: RecipeDetail;
}

export const RecipeContent = ({ recipe }: RecipeContentProps) => {
  const {
    id,
    title,
    description,
    instructions,
    thumb,
    time,
    category,
    owner,
    ingredients,
  } = recipe;

  const { isAuthenticated, openSignIn } = useAuthGate();
  const { isFavorite, isPending, toggleFavorite } = useFavorite(
    id,
    recipe.isFavorite ?? false,
  );

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      openSignIn();
      return;
    }
    toggleFavorite();
  };

  const seenCounts = new Map<string, number>();

  const paragraphs = instructions
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text) => {
      const occurrence = (seenCounts.get(text) ?? 0) + 1;
      seenCounts.set(text, occurrence);

      return {
        id: `${text.slice(0, 32)}-${occurrence}`,
        text,
      };
    });

  return (
    <div>
      {/* PathInfo */}
      <PathInfo current={title} />

      {/* RecipeInfo */}
      <article className={styles.recipeDetails}>
        {/* RecipeMainInfo */}
        <div className={styles.recipeDetailsMedia}>
          <img
            src={thumb || RECIPE_PLACEHOLDER}
            alt={title}
            onError={withFallback(RECIPE_PLACEHOLDER)}
            className={styles.recipeDetailsImage}
            width="551"
            height="400"
          />
        </div>

        <div className={styles.recipeDetailsContent}>
          <section className={styles.recipeDetailsHeader}>
            <h1 className={styles.recipeDetailsTitle}>{title}</h1>

            <div className={styles.recipeDetailsMeta}>
              <span className={styles.recipeDetailsTag}>{category.name}</span>
              {time != null && (
                <span className={styles.recipeDetailsTag}>{time} min</span>
              )}
            </div>

            {description && (
              <p className={styles.recipeDetailsDescription}>{description}</p>
            )}

            <div className={styles.recipeAuthor}>
              <img
                className={styles.recipeAuthorAvatar}
                src={owner.avatar || AVATAR_PLACEHOLDER}
                alt={owner.name}
                width="40"
                height="40"
                loading="lazy"
                onError={withFallback(AVATAR_PLACEHOLDER)}
              />
              <div className={styles.recipeAuthorInfo}>
                <span className={styles.recipeAuthorLabel}>Created by:</span>
                {isAuthenticated ? (
                  <Link
                    className={styles.recipeAuthorName}
                    to={`/user/${owner.id}`}
                    aria-label={`Open ${owner.name}'s profile`}
                  >
                    {owner.name}
                  </Link>
                ) : (
                  <button
                    className={styles.recipeAuthorName}
                    type="button"
                    aria-label={`Open ${owner.name}'s profile`}
                    onClick={() => openSignIn()}
                  >
                    {owner.name}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* RecipeIngredients */}
          <section className={styles.recipeDetailsBlock}>
            <h2 className={styles.recipeDetailsSubtitle}>Ingredients</h2>
            <ul className={styles.ingredientsList}>
              {ingredients.map((ingredient) => (
                <li className={styles.ingredientsListItem} key={ingredient.id}>
                  <div className={styles.ingredientsListThumb}>
                    <img
                      className={styles.ingredientsListImg}
                      src={ingredient.img || INGREDIENT_PLACEHOLDER}
                      alt={ingredient.name}
                      loading="lazy"
                      onError={withFallback(INGREDIENT_PLACEHOLDER)}
                    />
                  </div>
                  <div className={styles.ingredientsListInfo}>
                    <span className={styles.ingredientsListName}>
                      {ingredient.name}
                    </span>
                    <span className={styles.ingredientsListMeasure}>
                      {ingredient.measure}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* RecipePreparation */}
          <section className={styles.recipeDetailsBlock}>
            <h2 className={styles.recipeDetailsSubtitle}>Recipe Preparation</h2>
            <div className={styles.recipeDetailsInstructionsWrap}>
              {paragraphs.map(({ id, text }) => (
                <p className={styles.recipeDetailsInstructions} key={id}>
                  {text}
                </p>
              ))}
            </div>
          </section>
          <button
            className={styles.recipeDetailsFavBtn}
            type="button"
            aria-pressed={isFavorite}
            disabled={isPending}
            onClick={handleFavoriteClick}
          >
            {isFavorite ? "Remove from favorites" : "Add to favorites"}
          </button>
        </div>
      </article>
    </div>
  );
};
