import Link from "next/link";
import { SignInButton } from "@components/SignInButton";
import styles from "./styles.module.scss";
import Image from "next/image";
import logo from '../../../public/images/logo.svg';

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/">
          <Image src={logo} alt="board logo" />
        </Link>
        <nav>
          <Link href="/">Início</Link>
          <Link href="/board">Meu Board</Link>
        </nav>
          <SignInButton />
      </div>
    </header>
  );
}
