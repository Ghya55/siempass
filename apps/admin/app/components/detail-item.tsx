import type { FC, ReactNode } from "react";
import styles from "./detail-item.module.css";

export type DetailItemProps = {
  label: string;
  value: ReactNode;
};

export const DetailItem: FC<DetailItemProps> = ({ label, value }) => {
  return (
    <div className={styles.item}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
};
