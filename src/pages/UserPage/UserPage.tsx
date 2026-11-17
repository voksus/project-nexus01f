import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader } from "../../components/ui/Loader/Loader.tsx";
import { MainTitle } from "../../components/ui/MainTitle/MainTitle.tsx";
import { PathInfo } from "../../components/ui/PathInfo/PathInfo.tsx";
import { Subtitle } from "../../components/ui/Subtitle/Subtitle.tsx";
import { avatarUpdated } from "../../redux/auth/authSlice.ts";
import { logout } from "../../redux/auth/operations.ts";
import { selectUser } from "../../redux/auth/selectors.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import {
  followUser,
  getCurrentProfile,
  getUserProfile,
  unfollowUser,
  updateAvatar,
} from "../../services/profileApi.ts";
import type { CurrentUserProfile, PublicUserProfile } from "../../types/api.ts";
import { ProfileList } from "./ProfileList.tsx";
import { TemporaryLogOutDialog } from "./TemporaryLogOutDialog.tsx";
import { UserInfo } from "./UserInfo.tsx";
import styles from "./UserPage.module.css";

type LoadedProfile =
  | { kind: "own"; profile: CurrentUserProfile }
  | { kind: "other"; profile: PublicUserProfile };

type PageStatus =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error" }
  | ({ status: "ready" } & LoadedProfile);

const isNotFound = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 404;

const UserPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);
  const [page, setPage] = useState<PageStatus>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const currentUserId = currentUser?.id;

  useEffect(() => {
    if (!id || !currentUserId) return;
    const attempt = reloadKey;
    const controller = new AbortController();
    const isOwn = id === currentUserId;
    setPage({ status: "loading" });
    setActionError(null);

    const load = async () => {
      try {
        if (isOwn) {
          const profile = await getCurrentProfile(controller.signal);
          if (!controller.signal.aborted && attempt === reloadKey) {
            setPage({ status: "ready", kind: "own", profile });
          }
          return;
        }
        const profile = await getUserProfile(id, controller.signal);
        if (!controller.signal.aborted && attempt === reloadKey) {
          setPage({ status: "ready", kind: "other", profile });
        }
      } catch (error: unknown) {
        if (controller.signal.aborted || attempt !== reloadKey) return;
        setPage(
          isNotFound(error) ? { status: "missing" } : { status: "error" },
        );
      }
    };

    void load();
    return () => controller.abort();
  }, [id, currentUserId, reloadKey]);

  const handleAvatarSelected = async (file: File) => {
    setPending(true);
    setActionError(null);
    try {
      const { avatar } = await updateAvatar(file);
      dispatch(avatarUpdated(avatar));
      setPage((current) =>
        current.status === "ready" && current.kind === "own"
          ? { ...current, profile: { ...current.profile, avatar } }
          : current,
      );
    } catch {
      setActionError("Could not update the avatar. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!id || page.status !== "ready" || page.kind !== "other") return;
    const following = page.profile.isFollowing === true;
    setPending(true);
    setActionError(null);
    try {
      if (following) await unfollowUser(id);
      else await followUser(id);
      setPage({
        status: "ready",
        kind: "other",
        profile: {
          ...page.profile,
          isFollowing: !following,
          followersCount: Math.max(
            0,
            page.profile.followersCount + (following ? -1 : 1),
          ),
        },
      });
    } catch {
      setActionError(
        following
          ? "Could not unfollow this user. Please try again."
          : "Could not follow this user. Please try again.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <main className={`container ${styles.page}`}>
      <PathInfo current="profile" />
      <div className={styles.intro}>
        <MainTitle as="h1">Profile</MainTitle>
        <Subtitle>
          Reveal your culinary art, share your favorite recipe and create
          gastronomic masterpieces with us.
        </Subtitle>
      </div>

      {page.status === "loading" ? <Loader /> : null}

      {page.status === "error" ? (
        <div className={styles.message}>
          <Subtitle>Could not load this profile.</Subtitle>
          <button
            type="button"
            className={styles.retry}
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      ) : null}

      {page.status === "missing" ? (
        <div className={styles.message}>
          <MainTitle as="h2">User not found</MainTitle>
          <Subtitle>This profile does not exist or has been removed.</Subtitle>
          <Link to="/" className={styles.home}>
            Back to home
          </Link>
        </div>
      ) : null}

      {page.status === "ready" && currentUserId ? (
        <div className={styles.body}>
          <UserInfo
            name={page.profile.name}
            email={page.profile.email}
            avatar={page.profile.avatar ?? null}
            isOwn={page.kind === "own"}
            recipesCount={page.profile.recipesCount}
            followersCount={page.profile.followersCount}
            favoritesCount={
              page.kind === "own" ? page.profile.favoritesCount : undefined
            }
            followingCount={
              page.kind === "own" ? page.profile.followingCount : undefined
            }
            isFollowing={
              page.kind === "other" ? page.profile.isFollowing : undefined
            }
            pending={pending}
            actionError={actionError}
            onAvatarSelected={(file) => {
              void handleAvatarSelected(file);
            }}
            onAvatarRejected={setActionError}
            onFollowToggle={() => {
              void handleFollowToggle();
            }}
            onLogout={() => setLogoutOpen(true)}
          />
          <div className={styles.content}>
            <ProfileList
              kind={page.kind}
              userId={page.profile.id}
              currentUserId={currentUserId}
              ownerFollowing={
                page.kind === "other"
                  ? page.profile.isFollowing === true
                  : undefined
              }
              ownerPending={pending}
              onOwnerFollowToggle={() => {
                void handleFollowToggle();
              }}
              onRecipeRemoved={(removedTab) => {
                setPage((current) => {
                  if (current.status !== "ready" || current.kind !== "own") {
                    return current;
                  }
                  const profile = current.profile;
                  if (removedTab === "recipes") {
                    return {
                      ...current,
                      profile: {
                        ...profile,
                        recipesCount: Math.max(0, profile.recipesCount - 1),
                      },
                    };
                  }
                  return {
                    ...current,
                    profile: {
                      ...profile,
                      favoritesCount: Math.max(0, profile.favoritesCount - 1),
                    },
                  };
                });
              }}
              onFollowingRemoved={() => {
                setPage((current) => {
                  if (current.status !== "ready" || current.kind !== "own") {
                    return current;
                  }
                  return {
                    ...current,
                    profile: {
                      ...current.profile,
                      followingCount: Math.max(
                        0,
                        current.profile.followingCount - 1,
                      ),
                    },
                  };
                });
              }}
              onSubscriptionChanged={(delta) => {
                setPage((current) => {
                  if (current.status !== "ready" || current.kind !== "own") {
                    return current;
                  }
                  return {
                    ...current,
                    profile: {
                      ...current.profile,
                      followingCount: Math.max(
                        0,
                        current.profile.followingCount + delta,
                      ),
                    },
                  };
                });
              }}
            />
          </div>
        </div>
      ) : null}

      <TemporaryLogOutDialog
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => {
          void dispatch(logout());
        }}
      />
    </main>
  );
};

export default UserPage;
