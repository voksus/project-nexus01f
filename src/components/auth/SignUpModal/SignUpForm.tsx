import axios from "axios";
import clsx from "clsx";
import { Formik, type FormikHelpers } from "formik";
import { useState } from "react";
import toast from "react-hot-toast";
import { register } from "../../../redux/auth/operations.ts";
import { selectIsLoading } from "../../../redux/auth/selectors.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import type { RegisterCredentials } from "../../../types/auth.ts";
import { Icon } from "../../ui/Icon/Icon.tsx";
import styles from "../AuthForm.module.css";
import {
  extractAuthErrorMessage,
  signUpValidationSchema,
} from "../validationSchemas.ts";

interface SignUpFormProps {
  onSuccess: () => void;
}

const initialValues: RegisterCredentials = {
  name: "",
  email: "",
  password: "",
};

export const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (
    values: RegisterCredentials,
    { setSubmitting }: FormikHelpers<RegisterCredentials>,
  ) => {
    try {
      await dispatch(
        register({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
        }),
      );
      onSuccess();
    } catch (error) {
      const isRateLimited =
        axios.isAxiosError(error) && error.response?.status === 429;
      if (!axios.isCancel(error) && !isRateLimited) {
        toast.error(
          extractAuthErrorMessage(
            error,
            "Registration failed. Please try again.",
          ),
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={signUpValidationSchema}
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        handleChange,
        handleSubmit: onFormSubmit,
        isSubmitting,
      }) => {
        const isFilled =
          values.name.trim().length > 0 &&
          values.email.trim().length > 0 &&
          values.password.length > 0;

        return (
          <form className={styles.form} onSubmit={onFormSubmit} noValidate>
            <div className={styles.fields}>
              <div className={styles.fieldWrapper}>
                <div className={styles.inputContainer}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name*"
                    autoComplete="name"
                    value={values.name}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.name)}
                    className={clsx(
                      styles.input,
                      values.name.trim().length > 0 && styles.inputFilled,
                      errors.name && styles.inputError,
                    )}
                  />
                </div>
                {errors.name && (
                  <span className={styles.errorText} role="alert">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className={styles.fieldWrapper}>
                <div className={styles.inputContainer}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email*"
                    autoComplete="email"
                    value={values.email}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.email)}
                    className={clsx(
                      styles.input,
                      values.email.trim().length > 0 && styles.inputFilled,
                      errors.email && styles.inputError,
                    )}
                  />
                </div>
                {errors.email && (
                  <span className={styles.errorText} role="alert">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className={styles.fieldWrapper}>
                <div className={styles.inputContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    autoComplete="new-password"
                    value={values.password}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.password)}
                    className={clsx(
                      styles.input,
                      styles.passwordInput,
                      values.password.length > 0 && styles.inputFilled,
                      errors.password && styles.inputError,
                    )}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <Icon
                      name={showPassword ? "eye" : "eye-off"}
                      className={styles.eyeIcon}
                    />
                  </button>
                </div>
                {errors.password && (
                  <span className={styles.errorText} role="alert">
                    {errors.password}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className={clsx(
                styles.submitButton,
                isFilled && styles.submitButtonReady,
              )}
            >
              Create
            </button>
          </form>
        );
      }}
    </Formik>
  );
};
