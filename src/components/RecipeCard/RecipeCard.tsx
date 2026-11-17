import clsx from "clsx";
import type { SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { useAuthGate } from "../../hooks/useAuthGate.ts";
import { useFavorite } from "../../hooks/useFavorite.ts";
import type { RecipeCardItem } from "../../types/api.ts";
import { Icon } from "../ui/Icon/Icon.tsx";
import styles from "./RecipeCard.module.css";

const AVATAR_PLACEHOLDER = "/images/placeholders/avatar.svg";
const RECIPE_PLACEHOLDER = "/images/placeholders/recipe.svg";

interface RecipeCardProps {
  recipe: RecipeCardItem;
}

const withFallback =
  (fallback: string) => (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = fallback;
  };

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const { id, title, description, thumb, owner } = recipe;
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

  const ownerContent = (
    <>
      <img
        className={styles.avatar}
        src={owner.avatar || AVATAR_PLACEHOLDER}
        alt=""
        loading="lazy"
        onError={withFallback(AVATAR_PLACEHOLDER)}
      />
      <span className={styles.ownerName}>{owner.name}</span>
    </>
  );

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          className={styles.image}
          src={thumb || RECIPE_PLACEHOLDER}
          alt={title}
          loading="lazy"
          onError={withFallback(RECIPE_PLACEHOLDER)}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title} title={title}>
          {title}
        </h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.footer}>
        {isAuthenticated ? (
          <Link
            to={`/user/${owner.id}`}
            className={styles.owner}
            aria-label={`Open ${owner.name}'s profile`}
          >
            {ownerContent}
          </Link>
        ) : (
          <button
            type="button"
            className={styles.owner}
            aria-label={`Open ${owner.name}'s profile`}
            onClick={openSignIn}
          >
            {ownerContent}
          </button>
        )}
        <div className={styles.actions}>
          <button
            type="button"
            className={clsx(
              styles.iconButton,
              isFavorite && styles.iconButtonActive,
            )}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            aria-pressed={isFavorite}
            disabled={isPending}
            onClick={handleFavoriteClick}
          >
            <Icon name="heart" className={styles.icon} />
          </button>
          <Link
            to={`/recipe/${id}`}
            className={styles.iconButton}
            aria-label={`Open recipe ${title}`}
          >
            <Icon name="arrow-up-right" className={styles.icon} />
          </Link>
        </div>
      </div>
    </article>
  );
};
