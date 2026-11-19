export type IconName =
  | "instagram"
  | "youtube"
  | "facebook"
  | "eye"
  | "eye-off"
  | "heart"
  | "trash"
  | "arrow-up-right"
  | "chevron-down"
  | "active"
  | "logo"
  | "quote"
  | "plus"
  | "minus"
  | "close"
  | "edit"
  | "burger-menu"
  | "upload-photo";

interface IconProps {
  name: IconName;
  className?: string;
}

// Декоративна іконка: доступну назву дає кнопка/посилання, в якому вона стоїть
export const Icon = ({ name, className }: IconProps) => (
  <svg className={className} aria-hidden="true" focusable="false">
    <use href={`/icons/icons.svg#${name}`} />
  </svg>
);
