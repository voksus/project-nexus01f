import { describe, expect, it } from "vitest";
import * as Yup from "yup";

// Використовуємо схему реєстрації для перевірки
const signUpSchema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required(),
});

describe("Sign Up Validation Schema (Yup)", () => {
  it("should pass with valid data", async () => {
    const validData = {
      email: "test@example.com",
      password: "securepassword123",
    };

    const result = await signUpSchema.validate(validData);
    expect(result).toEqual(validData);
  });

  it("should fail if password is too short (< 8 chars)", async () => {
    const invalidData = {
      email: "test@example.com",
      password: "short",
    };

    await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
  });

  it("should fail if email is invalid", async () => {
    const invalidData = {
      email: "not-an-email",
      password: "securepassword123",
    };

    await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
  });
});
