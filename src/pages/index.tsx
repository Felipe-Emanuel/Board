import Head from "next/head";
import styles from "@styles/styles.module.scss";
import { GetStaticProps } from "next";
import firebase from "@/services/direbaseConnection";
import { useState } from "react";
import boardUder from '../../public/images/board-user.svg';
import Image from "next/image";


type Data = {
  id: string;
  donate: boolean;
  lastDonate: Date;
  image: string;
};
interface HomeProps {
  data: string;
}

export default function Home({ data }: HomeProps) {
  const [donators, setDonators] = useState<Data[]>(JSON.parse(data));

  return (
    <>
      <Head>
        <title>Board - Organizando suas tarefas.</title>
      </Head>
      <main className={styles.contentContainer}>
        <Image src={boardUder} alt="Ferramenta board" />

        <section className={styles.callToAction}>
          <h1>
            Uma ferramenta para seu dia a dia. Escreva, planeje e organize-se...
          </h1>
          <p>
            <span>100% gratuíta</span> e online
          </p>
        </section>

        {donators.length !== 0 && (
          <h2 className={styles.donatorsTitle}>Apoiadores:</h2>
        )}

        <div className={styles.donators}>
          {donators.map((item) => (
            <Image width={65} height={65} key={item.image} src={item.image} alt="Imagem do doador" />
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const donators = await firebase.firestore().collection("users").get();

  const data = JSON.stringify(
    donators.docs.map((item) => {
      return {
        id: item.id,
        ...item.data(),
      };
    })
  );

  return {
    props: { data },
    // revalidate: 60 * 60, //atualiza a cada 60 minutos
  };
};
