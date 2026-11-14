import type { ReactNode } from "react";

// TODO [FE-00]: коли спрайт icons.svg (#2) потрапить у main — замінити тіло компонента на
// <svg><use href={`${sprite}#${name}`} /></svg>; виклики <Icon name="..." /> лишаться без змін.
// Контури скопійовані зі спрайту (з виправленими viewBox, #5).
const ICONS = {
  "arrow-up-right": {
    viewBox: "0 0 18 18",
    stroke: true,
    body: <path d="m5.25 12.75 7.5-7.5m-7.5 0h7.5v7.5" strokeWidth="1.5" />,
  },
  "chevron-down": {
    viewBox: "0 0 18 18",
    stroke: true,
    body: <path d="m4.5 6.75 4.5 4.5 4.5-4.5" strokeWidth="1.8" />,
  },
  close: {
    viewBox: "0 0 24 24",
    stroke: true,
    body: <path d="M18 6 6 18M6 6l12 12" strokeWidth="2" />,
  },
  "burger-menu": {
    viewBox: "0 0 28 28",
    stroke: true,
    body: (
      <path
        d="M24.5 11.667h-21M24.5 7h-21m21 9.334h-21M24.5 21h-21"
        strokeWidth="2"
      />
    ),
  },
  facebook: {
    viewBox: "0 0 20 20",
    stroke: false,
    body: (
      <path d="M12.2 2.9h.6v2.25h-.75c-.3 0-.6 0-.75.15s-.15.3-.15.65v.8h1.65v1.9h-1.65v8.25H8.6V8.6H7.25V6.7H8.6v-.65c0-1.1.15-1.9.45-2.25.45-.65 1.35-.95 2.7-.95.15.05.3.05.45.05" />
    ),
  },
  instagram: {
    viewBox: "0 0 20 20",
    stroke: false,
    body: (
      <>
        <path d="M17.949 6.722a5.8 5.8 0 0 0-.373-1.965 4.1 4.1 0 0 0-2.34-2.336 5.9 5.9 0 0 0-1.942-.372C12.44 2.01 12.17 2 10 2s-2.448 0-3.296.049c-.664.014-1.32.14-1.942.372a4.1 4.1 0 0 0-2.339 2.336 5.8 5.8 0 0 0-.372 1.938C2.012 7.549 2 7.82 2 9.985c0 2.167 0 2.444.05 3.292.013.663.138 1.318.372 1.94a4.1 4.1 0 0 0 2.34 2.334 5.9 5.9 0 0 0 1.942.4C7.559 17.987 7.83 18 10 18s2.448 0 3.296-.05a5.9 5.9 0 0 0 1.943-.371 4.1 4.1 0 0 0 2.339-2.336 5.8 5.8 0 0 0 .372-1.94c.038-.853.05-1.124.05-3.29-.002-2.167-.002-2.442-.052-3.29m-7.955 7.36a4.103 4.103 0 0 1-4.108-4.1 4.104 4.104 0 0 1 4.108-4.101 4.104 4.104 0 0 1 4.107 4.1 4.104 4.104 0 0 1-4.107 4.101m4.27-7.397a.956.956 0 1 1 0-1.912.956.956 0 1 1 0 1.912" />
        <path d="M9.995 12.485a2.502 2.502 0 1 0 0-5.005 2.502 2.502 0 0 0 0 5.005" />
      </>
    ),
  },
  youtube: {
    viewBox: "0 0 20 20",
    stroke: false,
    body: (
      <path d="M18.82 5.848s-.18-1.3-.72-1.858c-.66-.742-1.44-.742-1.8-.804C13.78 3 10 3 10 3s-3.78 0-6.3.186c-.36.062-1.14.062-1.8.804-.54.558-.72 1.858-.72 1.858S1 7.333 1 8.819v1.362c0 1.486.18 3.033.18 3.033s.18 1.3.72 1.857c.66.743 1.56.743 1.98.805C5.32 15.938 10 16 10 16s3.78 0 6.3-.186c.36-.062 1.14-.062 1.8-.805.54-.557.72-1.857.72-1.857s.18-1.485.18-2.971V8.819c0-1.486-.18-2.971-.18-2.971M8.14 11.914v-5.2l4.86 2.6z" />
    ),
  },
} satisfies Record<
  string,
  { viewBox: string; stroke: boolean; body: ReactNode }
>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  className?: string;
}

/** Декоративна іконка: підпис для скрінрідерів дає батьківська кнопка чи посилання */
export const Icon = ({ name, className }: IconProps) => {
  const { viewBox, stroke, body } = ICONS[name];

  return (
    <svg
      className={className}
      viewBox={viewBox}
      fill={stroke ? "none" : "currentColor"}
      stroke={stroke ? "currentColor" : "none"}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {body}
    </svg>
  );
};
