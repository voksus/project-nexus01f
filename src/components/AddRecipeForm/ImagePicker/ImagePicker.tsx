import clsx from "clsx";
import { useEffect, useState } from "react";
import { Icon } from "../../ui/Icon/Icon.tsx";
import { THUMB_TYPES } from "../recipeForm.ts";
import styles from "./ImagePicker.module.css";

interface ImagePickerProps {
  id: string;
  value: File | null;
  existingUrl?: string | null;
  onChange: (file: File) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
}

export const ImagePicker = ({
  id,
  value,
  existingUrl = null,
  onChange,
  onBlur,
  invalid = false,
  describedBy,
}: ImagePickerProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // One object URL per file, revoked on change and unmount
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  return (
    <div className={styles.root}>
      <input
        id={id}
        type="file"
        accept={THUMB_TYPES.join(",")}
        className={styles.input}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset so picking the same file again still fires change
          event.target.value = "";
          if (file) onChange(file);
        }}
        onBlur={onBlur}
      />

      {previewUrl || existingUrl ? (
        <>
          <img
            src={previewUrl ?? existingUrl ?? undefined}
            alt="Selected dish"
            className={clsx(styles.frame, styles.preview)}
          />
          <label htmlFor={id} className={styles.link}>
            Upload another photo
          </label>
        </>
      ) : (
        <label
          htmlFor={id}
          className={clsx(
            styles.frame,
            styles.dropzone,
            invalid && styles.invalid,
          )}
        >
          <Icon name="upload-photo" className={styles.icon} />
          <span className={styles.link}>Upload a photo</span>
        </label>
      )}
    </div>
  );
};
