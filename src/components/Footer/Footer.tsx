import clsx from "clsx";
import { Icon, type IconName } from "../ui/Icon/Icon.tsx";
import { Logo } from "../ui/Logo/Logo.tsx";
import styles from "./Footer.module.css";

const SOCIALS: { name: string; icon: IconName; href: string }[] = [
  {
    name: "Facebook",
    icon: "facebook",
    href: "https://www.facebook.com/goITclub/",
  },
  {
    name: "Instagram",
    icon: "instagram",
    href: "https://www.instagram.com/goitclub/",
  },
  { name: "YouTube", icon: "youtube", href: "https://www.youtube.com/c/GoIT" },
];

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={clsx("container", styles.top)}>
        <Logo />
        <ul className={styles.socials}>
          {SOCIALS.map(({ name, icon, href }) => (
            <li key={name}>
              <a
                className={styles.social}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`GoIT on ${name}`}
              >
                <Icon name={icon} className={styles.socialIcon} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <p className={styles.copyright}>
        © {new Date().getFullYear()}, Foodies. All rights reserved
      </p>
    </footer>
  );
};
