export type ProfileKind = "own" | "other";

export type ProfileTab = "recipes" | "favorites" | "followers" | "following";

export const RECIPE_PAGE_LIMIT = 9;
export const USER_PAGE_LIMIT = 5;

const OWN_TABS: ProfileTab[] = [
  "recipes",
  "favorites",
  "followers",
  "following",
];

const OTHER_TABS: ProfileTab[] = ["recipes", "followers"];

export interface ResolvedProfileQuery {
  tab: ProfileTab;
  page: number;
  shouldReplace: boolean;
}

export const tabsFor = (kind: ProfileKind): ProfileTab[] =>
  kind === "own" ? OWN_TABS : OTHER_TABS;

export const tabLabel = (kind: ProfileKind, tab: ProfileTab): string => {
  if (tab === "recipes") return kind === "own" ? "My recipes" : "Recipes";
  if (tab === "favorites") return "My favorites";
  if (tab === "followers") return "Followers";
  return "Following";
};

export const emptyListText = (tab: ProfileTab): string => {
  if (tab === "recipes") {
    return "Nothing has been added to your recipes list yet. Please browse our recipes and add your favorites for easy access in the future.";
  }
  if (tab === "favorites") {
    return "Nothing has been added to your favorite recipes list yet. Please browse our recipes and add your favorites for easy access in the future.";
  }
  if (tab === "followers") {
    return "There are currently no followers on your account. Please engage our visitors with interesting content and draw their attention to your profile.";
  }
  return "Your account currently has no subscriptions to other users. Learn more about our users and select those whose content interests you.";
};

export const pageLimit = (tab: ProfileTab): number =>
  tab === "recipes" || tab === "favorites"
    ? RECIPE_PAGE_LIMIT
    : USER_PAGE_LIMIT;

const isProfileTab = (value: string): value is ProfileTab =>
  OWN_TABS.includes(value as ProfileTab);

const parsePage = (
  rawPage: string | null,
): { page: number; canonical: boolean } => {
  if (rawPage === null) return { page: 1, canonical: true };
  if (!/^[1-9]\d*$/.test(rawPage)) return { page: 1, canonical: false };
  const page = Number(rawPage);
  if (page === 1) return { page: 1, canonical: false };
  return { page, canonical: true };
};

export const resolveProfileQuery = (
  kind: ProfileKind,
  rawTab: string | null,
  rawPage: string | null,
): ResolvedProfileQuery => {
  const parsed = parsePage(rawPage);
  if (rawTab === null) {
    return {
      tab: "recipes",
      page: parsed.page,
      shouldReplace: !parsed.canonical,
    };
  }
  if (!isProfileTab(rawTab) || !tabsFor(kind).includes(rawTab)) {
    return { tab: "recipes", page: 1, shouldReplace: true };
  }
  return {
    tab: rawTab,
    page: parsed.page,
    shouldReplace: rawTab === "recipes" || !parsed.canonical,
  };
};

export const withProfileQuery = (
  current: URLSearchParams,
  tab: ProfileTab,
  page: number,
): URLSearchParams => {
  const next = new URLSearchParams(current);
  if (tab === "recipes") next.delete("tab");
  else next.set("tab", tab);
  if (page <= 1) next.delete("page");
  else next.set("page", String(page));
  return next;
};

export const pageAfterRemoval = (
  total: number,
  limit: number,
  page: number,
): { total: number; totalPages: number; page: number } => {
  const nextTotal = Math.max(0, total - 1);
  const totalPages = Math.max(1, Math.ceil(nextTotal / limit));
  return {
    total: nextTotal,
    totalPages,
    page: Math.min(Math.max(page, 1), totalPages),
  };
};

export type PageMarker = number | "gap";

export const visiblePages = (current: number, total: number): PageMarker[] => {
  if (total <= 1) return [];
  if (total <= 3) {
    const pages: number[] = [];
    for (let page = 1; page <= total; page += 1) pages.push(page);
    return pages;
  }

  const included = new Set<number>([1, total]);
  const windowStart = Math.min(Math.max(current - 1, 1), total - 2);
  for (let page = windowStart; page <= windowStart + 2; page += 1) {
    included.add(page);
  }

  const sorted = [...included].sort((left, right) => left - right);
  const markers: PageMarker[] = [];
  for (let index = 0; index < sorted.length; index += 1) {
    const page = sorted[index];
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous === 2) {
      markers.push(previous + 1);
    } else if (previous !== undefined && page - previous > 2) {
      markers.push("gap");
    }
    markers.push(page);
  }
  return markers;
};
