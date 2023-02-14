import styles from "./styles.module.scss";
import { signIn, signOut, useSession } from "next-auth/react";
import { FaGithub } from "react-icons/Fa";
import { FiX } from "react-icons/Fi";
import Image from "next/image";

export function SignInButton() {
  const { data: session } = useSession();

  return session ? (
    <button
      type="button"
      className={styles.signInButton}
      onClick={() => signOut()}
    >
      <Image
        width={35}
        height={35}
        src={session.user?.image!}
        alt="Avatar icon"
      />
      Olá, {session.user?.name}
      <FiX color="#737380" className={styles.closeIcon} />
    </button>
  ) : (
    <button
      type="button"
      className={styles.signInButton}
      onClick={() => signIn("github")}
    >
      <FaGithub color="#ffb800" />
      Entrar com Github
    </button>
  );
}
