import clsx from "clsx";
import { Formik, type FormikHelpers } from "formik";
import toast from "react-hot-toast";
import * as Yup from "yup";
import authStyles from "../../components/auth/AuthForm.module.css";
import { Modal } from "../../components/ui/Modal/Modal.tsx";
import { userProfileUpdated } from "../../redux/auth/authSlice.ts";
import { useAppDispatch } from "../../redux/hooks.ts";
import { updateProfileName } from "../../services/profileApi.ts";
import { getErrorMessage } from "../../utils/getErrorMessage.ts";
import styles from "./EditProfileModal.module.css";

interface EditProfileModalProps {
  name: string;
  onClose: () => void;
  onUpdated: (name: string) => void;
}

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(32, "Name must be at most 32 characters")
    .required("Name is required"),
});

export const EditProfileModal = ({
  name,
  onClose,
  onUpdated,
}: EditProfileModalProps) => {
  const dispatch = useAppDispatch();

  const handleSubmit = async (
    values: { name: string },
    { setSubmitting }: FormikHelpers<{ name: string }>,
  ) => {
    try {
      const updated = await updateProfileName(values.name.trim());
      dispatch(userProfileUpdated(updated.name));
      onUpdated(updated.name);
      onClose();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not update the name."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className={authStyles.title}>Edit profile</h2>
      <Formik
        initialValues={{ name }}
        validationSchema={schema}
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
        }) => (
          <form className={authStyles.form} onSubmit={onFormSubmit} noValidate>
            <div className={authStyles.fieldWrapper}>
              <input
                type="text"
                name="name"
                placeholder="Name*"
                autoComplete="name"
                value={values.name}
                onChange={handleChange}
                aria-invalid={Boolean(errors.name)}
                className={clsx(
                  authStyles.input,
                  values.name.trim().length > 0 && authStyles.inputFilled,
                  errors.name && authStyles.inputError,
                )}
              />
              {errors.name ? (
                <span className={authStyles.errorText} role="alert">
                  {errors.name}
                </span>
              ) : null}
            </div>
            <button
              type="submit"
              className={styles.save}
              disabled={isSubmitting}
            >
              Save
            </button>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
