import Link from "next/link";
import styles from "./styles.module.scss";

export function Supportbutton() {
  return (
    <div className={styles.donateContainer}>
      <Link href="/donate">
        <button>apoiar</button>
      </Link>
    </div>
  );
}
