import { useRef } from "react";
import { Icon } from "../../components/ui/Icon/Icon.tsx";
import styles from "./UserInfo.module.css";

const AVATAR_PLACEHOLDER = "/images/placeholders/avatar.svg";
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

interface Stat {
  label: string;
  value: string | number;
}

interface UserInfoProps {
  name: string;
  email: string;
  avatar: string | null;
  isOwn: boolean;
  recipesCount: number;
  followersCount: number;
  favoritesCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  pending: boolean;
  actionError: string | null;
  onAvatarSelected: (file: File) => void;
  onAvatarRejected: (message: string) => void;
  onFollowToggle: () => void;
  onLogout: () => void;
  onEditName?: () => void;
}

export const UserInfo = ({
  name,
  email,
  avatar,
  isOwn,
  recipesCount,
  followersCount,
  favoritesCount = 0,
  followingCount = 0,
  isFollowing = false,
  pending,
  actionError,
  onAvatarSelected,
  onAvatarRejected,
  onFollowToggle,
  onLogout,
  onEditName,
}: UserInfoProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const stats: Stat[] = isOwn
    ? [
        { label: "Email:", value: email },
        { label: "Added recipes:", value: recipesCount },
        { label: "Favorites:", value: favoritesCount },
        { label: "Followers:", value: followersCount },
        { label: "Following:", value: followingCount },
      ]
    : [
        { label: "Email:", value: email },
        { label: "Added recipes:", value: recipesCount },
        { label: "Followers:", value: followersCount },
      ];

  const actionLabel = isOwn ? "Log out" : isFollowing ? "Unfollow" : "Follow";

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      onAvatarRejected("Only JPEG, PNG and WebP images are allowed.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      onAvatarRejected("The image must be 5 MB or smaller.");
      return;
    }
    onAvatarSelected(file);
  };

  return (
    <section className={styles.panel}>
      <div className={styles.card}>
        <div className={styles.avatarWrap}>
          <img
            className={styles.avatar}
            src={avatar ?? AVATAR_PLACEHOLDER}
            alt=""
          />
          {isOwn ? (
            <>
              <button
                type="button"
                className={styles.upload}
                aria-label="Upload avatar"
                disabled={pending}
                onClick={() => fileRef.current?.click()}
              >
                <Icon name="plus" className={styles.uploadIcon} />
              </button>
              <input
                ref={fileRef}
                className={styles.file}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={(event) => {
                  handleFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </>
          ) : null}
        </div>
        <div className={styles.nameRow}>
          <h2 className={styles.name}>{name}</h2>
          {isOwn && onEditName ? (
            <button
              type="button"
              className={styles.editName}
              aria-label="Edit name"
              onClick={onEditName}
            >
              <Icon name="edit" className={styles.editIcon} />
            </button>
          ) : null}
        </div>
        <dl className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <button
        type="button"
        className={styles.action}
        disabled={pending}
        onClick={isOwn ? onLogout : onFollowToggle}
      >
        {actionLabel}
      </button>
      {actionError ? <p className={styles.error}>{actionError}</p> : null}
    </section>
  );
};
