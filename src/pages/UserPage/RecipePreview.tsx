import { Link } from "react-router-dom";
import { Icon } from "../../components/ui/Icon/Icon.tsx";
import type { RecipeCardItem } from "../../types/api.ts";
import styles from "./RecipePreview.module.css";

const RECIPE_PLACEHOLDER = "/images/placeholders/recipe.svg";

interface RecipePreviewProps {
  recipe: RecipeCardItem;
  canDelete: boolean;
  deleteLabel: string;
  pending: boolean;
  onDelete: (id: string) => void;
}

export const RecipePreview = ({
  recipe,
  canDelete,
  deleteLabel,
  pending,
  onDelete,
}: RecipePreviewProps) => {
  const description = recipe.description?.trim();

  return (
    <article className={styles.card}>
      <Link
        className={styles.thumbLink}
        to={`/recipe/${recipe.id}`}
        aria-label={`Open recipe ${recipe.title}`}
      >
        <img
          className={styles.thumb}
          src={recipe.thumb ?? RECIPE_PLACEHOLDER}
          alt=""
        />
      </Link>
      <div className={styles.main}>
        <div className={styles.copy}>
          <h3 className={styles.title}>
            <Link className={styles.titleLink} to={`/recipe/${recipe.id}`}>
              {recipe.title}
            </Link>
          </h3>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </div>
        <div className={styles.actions}>
          <Link
            className={styles.iconButton}
            to={`/recipe/${recipe.id}`}
            aria-label={`Open recipe ${recipe.title}`}
          >
            <Icon name="arrow-up-right" className={styles.icon} />
          </Link>
          {canDelete ? (
            <button
              type="button"
              className={styles.iconButton}
              aria-label={deleteLabel}
              disabled={pending}
              onClick={() => onDelete(recipe.id)}
            >
              <Icon name="trash" className={styles.icon} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
};
