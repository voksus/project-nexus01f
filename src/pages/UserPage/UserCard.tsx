import { Link } from "react-router-dom";
import { Icon } from "../../components/ui/Icon/Icon.tsx";
import type { UserCardItem } from "../../types/api.ts";
import styles from "./UserCard.module.css";

const AVATAR_PLACEHOLDER = "/images/placeholders/avatar.svg";
const RECIPE_PLACEHOLDER = "/images/placeholders/recipe.svg";

interface UserCardProps {
  user: UserCardItem;
  showFollow: boolean;
  following?: boolean;
  pending: boolean;
  onToggleFollow: (id: string, following: boolean) => void;
}

export const UserCard = ({
  user,
  showFollow,
  following,
  pending,
  onToggleFollow,
}: UserCardProps) => {
  const isFollowing = following ?? user.isFollowing === true;
  const recipes = user.recipes.slice(0, 4);

  return (
    <article className={styles.card}>
      <div className={styles.identity}>
        <img
          className={styles.avatar}
          src={user.avatar ?? AVATAR_PLACEHOLDER}
          alt=""
        />
        <div className={styles.details}>
          <div className={styles.copy}>
            <h3 className={styles.name}>{user.name}</h3>
            <p className={styles.count}>Own recipes: {user.recipesCount}</p>
          </div>
          {showFollow ? (
            <button
              type="button"
              className={styles.follow}
              disabled={pending}
              onClick={() => onToggleFollow(user.id, isFollowing)}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          ) : null}
        </div>
      </div>
      {recipes.length > 0 ? (
        <ul className={styles.recipes}>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link
                className={styles.recipe}
                to={`/recipe/${recipe.id}`}
                title={recipe.title}
                aria-label={recipe.title}
              >
                <img src={recipe.thumb ?? RECIPE_PLACEHOLDER} alt="" />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <Link
        className={styles.arrow}
        to={`/user/${user.id}`}
        aria-label={`Open profile ${user.name}`}
      >
        <Icon name="arrow-up-right" className={styles.icon} />
      </Link>
    </article>
  );
};
