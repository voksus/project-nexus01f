import type { AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  CurrentUserProfile,
  PublicUserProfile,
  RecipeCardItem,
  UserCardItem,
} from "../types/api.ts";
import { api } from "./api.ts";
import {
  deleteOwnRecipe,
  followUser,
  getCurrentProfile,
  getFavoriteRecipes,
  getFollowers,
  getFollowing,
  getProfileRecipes,
  getUserProfile,
  removeFavoriteRecipe,
  unfollowUser,
  updateAvatar,
} from "./profileApi.ts";

const response = (data: unknown, status = 200): AxiosResponse =>
  ({
    data,
    status,
    statusText: "",
    headers: {},
    config: {},
  }) as AxiosResponse;

const currentProfile: CurrentUserProfile = {
  id: "user-1",
  name: "Olena",
  email: "olena@example.com",
  avatar: null,
  recipesCount: 2,
  favoritesCount: 1,
  followersCount: 3,
  followingCount: 4,
};

const publicProfile: PublicUserProfile = {
  id: "user-2",
  name: "Ihor",
  email: "ihor@example.com",
  avatar: "https://cdn.example/avatar.png",
  recipesCount: 5,
  followersCount: 6,
  isFollowing: true,
};

const recipe: RecipeCardItem = {
  id: "recipe-1",
  title: "Borscht",
  description: null,
  thumb: null,
  time: 30,
  owner: { id: "user-1", name: "Olena", avatar: null },
  isFavorite: false,
};

const userCard: UserCardItem = {
  id: "user-2",
  name: "Ihor",
  avatar: null,
  recipesCount: 1,
  isFollowing: false,
  recipes: [{ id: "recipe-1", title: "Borscht", thumb: null }],
};

const page = <T>(items: T[]) => ({
  items,
  total: items.length,
  page: 1,
  limit: 9,
  totalPages: 1,
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("profileApi", () => {
  it("reads the current profile, including a null avatar", async () => {
    const signal = new AbortController().signal;
    vi.spyOn(api, "get").mockResolvedValue(response(currentProfile));

    await expect(getCurrentProfile(signal)).resolves.toEqual(currentProfile);
    expect(api.get).toHaveBeenCalledWith("/users/current", { signal });
  });

  it("rejects a current profile that is missing a count", async () => {
    const { recipesCount: _recipesCount, ...broken } = currentProfile;
    vi.spyOn(api, "get").mockResolvedValue(response(broken));

    await expect(getCurrentProfile()).rejects.toThrow(
      "Unexpected /users/current response shape",
    );
  });

  it("reads another user's profile", async () => {
    vi.spyOn(api, "get").mockResolvedValue(response(publicProfile));

    await expect(getUserProfile("user-2")).resolves.toEqual(publicProfile);
    expect(api.get).toHaveBeenCalledWith("/users/user-2", {
      signal: undefined,
    });
  });

  it("uploads an avatar as form data without setting Content-Type", async () => {
    const file = new File(["img"], "avatar.png", { type: "image/png" });
    vi.spyOn(api, "patch").mockResolvedValue(
      response({ avatar: "https://cdn.example/next.png" }),
    );

    await expect(updateAvatar(file)).resolves.toEqual({
      avatar: "https://cdn.example/next.png",
    });
    expect(api.patch).toHaveBeenCalledTimes(1);
    const [url, body, config] = vi.mocked(api.patch).mock.calls[0];
    expect(url).toBe("/users/avatars");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("avatar")).toBe(file);
    expect(config).toBeUndefined();
  });

  it("accepts a null avatar after upload", async () => {
    vi.spyOn(api, "patch").mockResolvedValue(response({ avatar: null }));

    await expect(
      updateAvatar(new File(["img"], "avatar.png", { type: "image/png" })),
    ).resolves.toEqual({ avatar: null });
  });

  it("loads own recipes without userId and passes only the given page", async () => {
    vi.spyOn(api, "get").mockResolvedValue(response(page([recipe])));

    await expect(getProfileRecipes({ page: 2 })).resolves.toEqual(
      page([recipe]),
    );
    expect(api.get).toHaveBeenCalledWith("/recipes/own", {
      params: { page: 2 },
      signal: undefined,
    });
  });

  it("loads another user's recipes with userId", async () => {
    vi.spyOn(api, "get").mockResolvedValue(response(page([])));

    await expect(
      getProfileRecipes({ userId: "user-2", limit: 9 }),
    ).resolves.toEqual(page([]));
    expect(api.get).toHaveBeenCalledWith("/recipes/own", {
      params: { limit: 9, userId: "user-2" },
      signal: undefined,
    });
  });

  it("rejects a recipe list when one card is missing a field", async () => {
    const { title: _title, ...broken } = recipe;
    vi.spyOn(api, "get").mockResolvedValue(response(page([broken])));

    await expect(getFavoriteRecipes()).rejects.toThrow(
      "Unexpected /recipes/favorites response shape",
    );
    expect(api.get).toHaveBeenCalledWith("/recipes/favorites", {
      params: {},
      signal: undefined,
    });
  });

  it("loads followers by id and following without an id", async () => {
    vi.spyOn(api, "get").mockResolvedValue(response(page([userCard])));

    await expect(
      getFollowers("user-2", { page: 1, limit: 5 }),
    ).resolves.toEqual(page([userCard]));
    await expect(getFollowing()).resolves.toEqual(page([userCard]));

    expect(api.get).toHaveBeenNthCalledWith(1, "/users/user-2/followers", {
      params: { page: 1, limit: 5 },
      signal: undefined,
    });
    expect(api.get).toHaveBeenNthCalledWith(2, "/users/following", {
      params: {},
      signal: undefined,
    });
  });

  it("rejects a follower card whose recipe preview is broken", async () => {
    vi.spyOn(api, "get").mockResolvedValue(
      response(
        page([
          {
            ...userCard,
            recipes: [{ id: "recipe-1", thumb: null }],
          },
        ]),
      ),
    );

    await expect(getFollowers("user-2")).rejects.toThrow(
      "Unexpected /users/user-2/followers response shape",
    );
  });

  it("reads follow and unfollow messages", async () => {
    vi.spyOn(api, "post").mockResolvedValue(
      response({ message: "Successfully followed" }),
    );
    vi.spyOn(api, "delete").mockResolvedValue(
      response({ message: "Successfully unfollowed" }),
    );

    await expect(followUser("user-2")).resolves.toEqual({
      message: "Successfully followed",
    });
    await expect(unfollowUser("user-2")).resolves.toEqual({
      message: "Successfully unfollowed",
    });
    expect(api.post).toHaveBeenCalledWith("/users/user-2/follow");
    expect(api.delete).toHaveBeenCalledWith("/users/user-2/follow");
  });

  it("deletes an own recipe without reading the empty body", async () => {
    vi.spyOn(api, "delete").mockResolvedValue(response(undefined, 204));

    await expect(deleteOwnRecipe("recipe-1")).resolves.toBeUndefined();
    expect(api.delete).toHaveBeenCalledWith("/recipes/recipe-1");
  });

  it("reads the message when a favorite is removed", async () => {
    vi.spyOn(api, "delete").mockResolvedValue(
      response({ message: "Recipe removed from favorites" }),
    );

    await expect(removeFavoriteRecipe("recipe-1")).resolves.toEqual({
      message: "Recipe removed from favorites",
    });
    expect(api.delete).toHaveBeenCalledWith("/recipes/recipe-1/favorite");
  });

  it("rejects a follow response without a message string", async () => {
    vi.spyOn(api, "post").mockResolvedValue(response({ message: 1 }));

    await expect(followUser("user-2")).rejects.toThrow(
      "Unexpected /users/user-2/follow response shape",
    );
  });
});
