import { describe, expect, it } from "vitest";
import {
  emptyListText,
  pageAfterRemoval,
  pageLimit,
  resolveProfileQuery,
  tabsFor,
  visiblePages,
  withProfileQuery,
} from "./profileTab.ts";

describe("resolveProfileQuery", () => {
  it("defaults an own profile to recipes on page 1", () => {
    expect(resolveProfileQuery("own", null, null)).toEqual({
      tab: "recipes",
      page: 1,
      shouldReplace: false,
    });
  });

  it("keeps an own favorites page in the address", () => {
    expect(resolveProfileQuery("own", "favorites", "2")).toEqual({
      tab: "favorites",
      page: 2,
      shouldReplace: false,
    });
  });

  it("drops the default recipes tab and page 1 from the address", () => {
    expect(resolveProfileQuery("own", "recipes", "1")).toEqual({
      tab: "recipes",
      page: 1,
      shouldReplace: true,
    });
  });

  it("treats a bad page as page 1 and rewrites the address", () => {
    expect(resolveProfileQuery("own", "followers", "0")).toMatchObject({
      tab: "followers",
      page: 1,
      shouldReplace: true,
    });
    expect(resolveProfileQuery("own", "followers", "nope").page).toBe(1);
  });

  it("opens recipes when another profile asks for favorites or following", () => {
    expect(resolveProfileQuery("other", "favorites", "3")).toEqual({
      tab: "recipes",
      page: 1,
      shouldReplace: true,
    });
    expect(resolveProfileQuery("other", "following", null).tab).toBe("recipes");
  });

  it("replaces an unknown tab with recipes", () => {
    expect(resolveProfileQuery("own", "posts", "4")).toEqual({
      tab: "recipes",
      page: 1,
      shouldReplace: true,
    });
  });
});

describe("profile list helpers", () => {
  it("shows four tabs on an own profile and two on another", () => {
    expect(tabsFor("own")).toEqual([
      "recipes",
      "favorites",
      "followers",
      "following",
    ]);
    expect(tabsFor("other")).toEqual(["recipes", "followers"]);
  });

  it("asks for nine recipes and five users", () => {
    expect(pageLimit("recipes")).toBe(9);
    expect(pageLimit("favorites")).toBe(9);
    expect(pageLimit("followers")).toBe(5);
    expect(pageLimit("following")).toBe(5);
  });

  it("writes only a non-default tab and page", () => {
    const next = withProfileQuery(
      new URLSearchParams("keep=1&tab=followers&page=3"),
      "recipes",
      1,
    );
    expect(next.toString()).toBe("keep=1");
  });

  it("shows the current page inside a window of three", () => {
    expect(visiblePages(1, 1)).toEqual([]);
    expect(visiblePages(1, 2)).toEqual([1, 2]);
    expect(visiblePages(2, 3)).toEqual([1, 2, 3]);
  });

  it("keeps the first and last page visible when there are more than three", () => {
    expect(visiblePages(1, 10)).toEqual([1, 2, 3, "gap", 10]);
    expect(visiblePages(2, 10)).toEqual([1, 2, 3, "gap", 10]);
    expect(visiblePages(5, 10)).toEqual([1, "gap", 4, 5, 6, "gap", 10]);
    expect(visiblePages(9, 10)).toEqual([1, "gap", 8, 9, 10]);
    expect(visiblePages(10, 10)).toEqual([1, "gap", 8, 9, 10]);
    expect(visiblePages(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it("keeps the page when other recipes remain on it", () => {
    expect(pageAfterRemoval(18, 9, 2)).toEqual({
      total: 17,
      totalPages: 2,
      page: 2,
    });
  });

  it("steps back when the last recipe on a later page is removed", () => {
    expect(pageAfterRemoval(10, 9, 2)).toEqual({
      total: 9,
      totalPages: 1,
      page: 1,
    });
  });

  it("stays on page 1 when the list becomes empty", () => {
    expect(pageAfterRemoval(1, 9, 1)).toEqual({
      total: 0,
      totalPages: 1,
      page: 1,
    });
  });

  it("keeps a distinct empty sentence for every tab", () => {
    const texts = [
      emptyListText("recipes"),
      emptyListText("favorites"),
      emptyListText("followers"),
      emptyListText("following"),
    ];
    expect(new Set(texts).size).toBe(4);
  });
});
