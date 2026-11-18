import axios from "axios";
import * as Yup from "yup";

const emailField = Yup.string()
  .trim()
  .email("Invalid email address")
  .required("Email is required");

const passwordField = Yup.string()
  .min(6, "Password must be at least 6 characters")
  .max(64, "Password must be at most 64 characters")
  .required("Password is required");

export const signInValidationSchema = Yup.object({
  email: emailField,
  password: passwordField,
});

export const signUpValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .required("Name is required"),
  email: emailField,
  password: passwordField,
});

export const extractAuthErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  }
  return fallback;
};
