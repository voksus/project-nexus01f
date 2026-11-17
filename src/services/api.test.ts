import { AxiosError, type AxiosResponse } from "axios";
import toast from "react-hot-toast";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api, authApi, RATE_LIMIT_MESSAGE } from "./api.ts";

vi.mock("react-hot-toast", () => ({ default: { error: vi.fn() } }));

const respondWith =
  (status: number) => async (config: AxiosResponse["config"]) => {
    const response = { status, data: {}, headers: {}, config, statusText: "" };
    if (status < 400) return response;
    throw new AxiosError(
      "Request failed",
      undefined,
      config,
      undefined,
      response,
    );
  };

afterEach(() => {
  vi.clearAllMocks();
});

describe("rate limit (429)", () => {
  it.each([
    ["api", api],
    ["authApi", authApi],
  ])("%s shows one toast and still rejects", async (_name, instance) => {
    const request = instance.post(
      "/auth/login",
      {},
      { adapter: respondWith(429) },
    );

    await expect(request).rejects.toMatchObject({ response: { status: 429 } });
    expect(toast.error).toHaveBeenCalledOnce();
    expect(toast.error).toHaveBeenCalledWith(
      RATE_LIMIT_MESSAGE,
      expect.objectContaining({ id: "rate-limit" }),
    );
  });

  it("stays silent for other errors and successful responses", async () => {
    await expect(
      api.get("/recipes", { adapter: respondWith(500) }),
    ).rejects.toBeInstanceOf(AxiosError);
    await api.get("/recipes", { adapter: respondWith(200) });

    expect(toast.error).not.toHaveBeenCalled();
  });
});
