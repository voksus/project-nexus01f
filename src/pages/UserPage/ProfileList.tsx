import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader } from "../../components/ui/Loader/Loader.tsx";
import { Subtitle } from "../../components/ui/Subtitle/Subtitle.tsx";
import {
  deleteOwnRecipe,
  followUser,
  getFavoriteRecipes,
  getFollowers,
  getFollowing,
  getProfileRecipes,
  removeFavoriteRecipe,
  unfollowUser,
} from "../../services/profileApi.ts";
import type { RecipeCardItem, UserCardItem } from "../../types/api.ts";
import styles from "./ProfileList.module.css";
import { ProfilePagination } from "./ProfilePagination.tsx";
import { ProfileTabs } from "./ProfileTabs.tsx";
import {
  emptyListText,
  type ProfileKind,
  type ProfileTab,
  pageAfterRemoval,
  pageLimit,
  resolveProfileQuery,
  withProfileQuery,
} from "./profileTab.ts";
import { RecipePreview } from "./RecipePreview.tsx";
import { TemporaryDeleteDialog } from "./TemporaryDeleteDialog.tsx";
import { UserCard } from "./UserCard.tsx";

interface ProfileListProps {
  kind: ProfileKind;
  userId: string;
  currentUserId: string;
  onRecipeRemoved?: (tab: "recipes" | "favorites") => void;
  onFollowingRemoved?: () => void;
  onSubscriptionChanged?: (delta: 1 | -1) => void;
}

interface RecipeReady {
  mode: "recipes";
  items: RecipeCardItem[];
  page: number;
  total: number;
  totalPages: number;
}

interface PeopleReady {
  mode: "people";
  items: UserCardItem[];
  page: number;
  total: number;
  totalPages: number;
}

type ListStatus =
  | { status: "loading" }
  | { status: "error" }
  | ({ status: "ready" } & (RecipeReady | PeopleReady));

const isEmpty = (list: ListStatus) =>
  list.status === "ready" &&
  (list.mode === "recipes" ? list.items.length === 0 : list.items.length === 0);

export const ProfileList = ({
  kind,
  userId,
  currentUserId,
  onRecipeRemoved,
  onFollowingRemoved,
  onSubscriptionChanged,
}: ProfileListProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reloadKey, setReloadKey] = useState(0);
  const [list, setList] = useState<ListStatus>({ status: "loading" });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingFollow, setPendingFollow] = useState<string | null>(null);
  const [followError, setFollowError] = useState<string | null>(null);
  const tabRef = useRef<ProfileTab>("recipes");
  const deletingRef = useRef(false);
  const followRef = useRef(false);
  const rawTab = searchParams.get("tab");
  const rawPage = searchParams.get("page");
  const { tab, page, shouldReplace } = resolveProfileQuery(
    kind,
    rawTab,
    rawPage,
  );
  tabRef.current = tab;

  useEffect(() => {
    if (!shouldReplace) return;
    setSearchParams((current) => withProfileQuery(current, tab, page), {
      replace: true,
    });
  }, [page, setSearchParams, shouldReplace, tab]);

  useEffect(() => {
    if (shouldReplace) return;
    const attempt = reloadKey;
    const controller = new AbortController();
    setList({ status: "loading" });
    setDeleteError(null);
    setPendingDelete(null);
    setFollowError(null);
    setPendingFollow(null);

    const load = async () => {
      try {
        const limit = pageLimit(tab);
        const query = { page, limit };
        if (tab === "recipes") {
          const data = await getProfileRecipes(
            kind === "own" ? query : { ...query, userId },
            controller.signal,
          );
          if (controller.signal.aborted || attempt !== reloadKey) return;
          setList({
            status: "ready",
            mode: "recipes",
            items: data.items,
            page: data.page,
            total: data.total,
            totalPages: data.totalPages,
          });
          return;
        }
        if (tab === "favorites") {
          const data = await getFavoriteRecipes(query, controller.signal);
          if (controller.signal.aborted || attempt !== reloadKey) return;
          setList({
            status: "ready",
            mode: "recipes",
            items: data.items,
            page: data.page,
            total: data.total,
            totalPages: data.totalPages,
          });
          return;
        }
        if (tab === "followers") {
          const data = await getFollowers(userId, query, controller.signal);
          if (controller.signal.aborted || attempt !== reloadKey) return;
          setList({
            status: "ready",
            mode: "people",
            items: data.items,
            page: data.page,
            total: data.total,
            totalPages: data.totalPages,
          });
          return;
        }
        const data = await getFollowing(query, controller.signal);
        if (controller.signal.aborted || attempt !== reloadKey) return;
        setList({
          status: "ready",
          mode: "people",
          items: data.items,
          page: data.page,
          total: data.total,
          totalPages: data.totalPages,
        });
      } catch {
        if (controller.signal.aborted || attempt !== reloadKey) return;
        setList({ status: "error" });
      }
    };

    void load();
    return () => controller.abort();
  }, [kind, page, reloadKey, shouldReplace, tab, userId]);

  const selectTab = (nextTab: ProfileTab) => {
    setSearchParams((current) => withProfileQuery(current, nextTab, 1));
  };

  const selectPage = (nextPage: number) => {
    setSearchParams((current) => withProfileQuery(current, tab, nextPage));
  };

  const removeRecipe = async (id: string) => {
    if (
      deletingRef.current ||
      list.status !== "ready" ||
      list.mode !== "recipes"
    ) {
      return;
    }
    if (tab !== "recipes" && tab !== "favorites") return;
    deletingRef.current = true;
    const current = list;
    const startedTab = tab;
    setDeletingId(id);
    setDeleteError(null);
    const next = pageAfterRemoval(current.total, pageLimit(tab), page);
    try {
      if (tab === "favorites") await removeFavoriteRecipe(id);
      else await deleteOwnRecipe(id);
      onRecipeRemoved?.(tab);
      if (tabRef.current !== startedTab) return;
      if (next.page !== page) {
        setSearchParams((params) =>
          withProfileQuery(params, startedTab, next.page),
        );
        return;
      }
      try {
        const query = { page, limit: pageLimit(startedTab) };
        const data =
          startedTab === "favorites"
            ? await getFavoriteRecipes(query)
            : await getProfileRecipes(
                kind === "own" ? query : { ...query, userId },
              );
        if (tabRef.current !== startedTab) return;
        setList({
          status: "ready",
          mode: "recipes",
          items: data.items,
          page: data.page,
          total: data.total,
          totalPages: data.totalPages,
        });
      } catch {
        if (tabRef.current !== startedTab) return;
        setList({
          status: "ready",
          mode: "recipes",
          items: current.items.filter((item) => item.id !== id),
          page: next.page,
          total: next.total,
          totalPages: next.totalPages,
        });
      }
    } catch {
      if (tabRef.current === startedTab) {
        setDeleteError("Could not remove this recipe. Please try again.");
      }
    } finally {
      deletingRef.current = false;
      setDeletingId(null);
    }
  };

  const toggleFollow = async (id: string, following: boolean) => {
    if (
      followRef.current ||
      list.status !== "ready" ||
      list.mode !== "people"
    ) {
      return;
    }
    if (tab !== "followers" && tab !== "following") return;
    followRef.current = true;
    const current = list;
    const startedTab = tab;
    setPendingFollow(id);
    setFollowError(null);
    try {
      if (following) await unfollowUser(id);
      else await followUser(id);
      if (tabRef.current !== startedTab) return;
      if (startedTab === "followers") {
        onSubscriptionChanged?.(following ? -1 : 1);
      }
      if (startedTab === "following" && following) {
        onFollowingRemoved?.();
        const next = pageAfterRemoval(
          current.total,
          pageLimit(startedTab),
          page,
        );
        if (next.page !== page) {
          setSearchParams((params) =>
            withProfileQuery(params, startedTab, next.page),
          );
          return;
        }
        try {
          const data = await getFollowing({
            page,
            limit: pageLimit(startedTab),
          });
          if (tabRef.current !== startedTab) return;
          setList({
            status: "ready",
            mode: "people",
            items: data.items,
            page: data.page,
            total: data.total,
            totalPages: data.totalPages,
          });
        } catch {
          if (tabRef.current !== startedTab) return;
          setList({
            status: "ready",
            mode: "people",
            items: current.items.filter((item) => item.id !== id),
            page: next.page,
            total: next.total,
            totalPages: next.totalPages,
          });
        }
        return;
      }
      setList({
        ...current,
        items: current.items.map((item) =>
          item.id === id ? { ...item, isFollowing: !following } : item,
        ),
      });
    } catch {
      if (tabRef.current === startedTab) {
        setFollowError("Could not update this subscription. Please try again.");
      }
    } finally {
      followRef.current = false;
      setPendingFollow(null);
    }
  };

  const deleteLabel =
    tab === "favorites" ? "Remove from favorites" : "Delete recipe";

  return (
    <section className={styles.section} aria-labelledby={`profile-tab-${tab}`}>
      <ProfileTabs kind={kind} active={tab} onSelect={selectTab} />
      <div
        id={`profile-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`profile-tab-${tab}`}
      >
        {list.status === "loading" ? <Loader /> : null}
        {list.status === "error" ? (
          <div className={styles.message}>
            <Subtitle>Could not load this list.</Subtitle>
            <button
              type="button"
              className={styles.retry}
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try again
            </button>
          </div>
        ) : null}
        {deleteError ? <p className={styles.note}>{deleteError}</p> : null}
        {followError ? <p className={styles.note}>{followError}</p> : null}
        {isEmpty(list) ? (
          <p className={styles.empty}>{emptyListText(tab)}</p>
        ) : null}
        {list.status === "ready" &&
        list.mode === "recipes" &&
        list.items.length > 0 ? (
          <ul className={styles.recipes}>
            {list.items.map((recipe) => (
              <li key={recipe.id}>
                <RecipePreview
                  recipe={recipe}
                  canDelete={kind === "own"}
                  canEdit={kind === "own" && tab === "recipes"}
                  deleteLabel={deleteLabel}
                  pending={deletingId === recipe.id}
                  onDelete={setPendingDelete}
                />
              </li>
            ))}
          </ul>
        ) : null}
        {list.status === "ready" &&
        list.mode === "people" &&
        list.items.length > 0 ? (
          <ul className={styles.people}>
            {list.items.map((person) => (
              <li key={person.id} className={styles.person}>
                <UserCard
                  user={person}
                  showFollow={person.id !== currentUserId}
                  pending={pendingFollow === person.id}
                  onToggleFollow={(id, following) => {
                    void toggleFollow(id, following);
                  }}
                />
              </li>
            ))}
          </ul>
        ) : null}
        {list.status === "ready" ? (
          <ProfilePagination
            page={list.page}
            totalPages={list.totalPages}
            spacing={list.mode === "recipes" ? "recipes" : "people"}
            onSelect={selectPage}
          />
        ) : null}
      </div>
      <TemporaryDeleteDialog
        open={pendingDelete !== null}
        favorite={tab === "favorites"}
        pending={deletingId !== null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          void removeRecipe(pendingDelete).finally(() => {
            setPendingDelete(null);
          });
        }}
      />
    </section>
  );
};
