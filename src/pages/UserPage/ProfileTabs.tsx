import styles from "./ProfileTabs.module.css";
import {
  type ProfileKind,
  type ProfileTab,
  tabLabel,
  tabsFor,
} from "./profileTab.ts";

interface ProfileTabsProps {
  kind: ProfileKind;
  active: ProfileTab;
  onSelect: (tab: ProfileTab) => void;
}

export const ProfileTabs = ({ kind, active, onSelect }: ProfileTabsProps) => {
  return (
    <div className={styles.tabs}>
      <div className={styles.row} role="tablist" aria-label="Profile sections">
        {tabsFor(kind).map((tab) => {
          const selected = tab === active;
          return (
            <button
              key={tab}
              type="button"
              className={styles.tab}
              role="tab"
              id={`profile-tab-${tab}`}
              aria-selected={selected}
              aria-controls={`profile-panel-${tab}`}
              onClick={() => onSelect(tab)}
            >
              {tabLabel(kind, tab)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
