import styles from "./task.module.scss";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";
import firebase from "@/services/direbaseConnection";
import { format } from "date-fns";
import { FiCalendar } from "react-icons/Fi"

type Task = {
  id: string;
  created: string | Date;
  createdFormated?: string;
  task: string;
  userId: string;
  name: string;
};

interface TaskListProps {
  data: string;
}

export default function Task({ data }: TaskListProps) {
  const task = JSON.parse(data) as Task;

  return (
    <>
      <Head>
        <title>Detalhes da sua tarefa</title>
      </Head>
      <article className={styles.container}>
        <div className={styles.actions}>
            <div>
                <FiCalendar size={30} color="#fff"/>
                <span>tarefa criada</span>
                <time>{task.createdFormated}</time>
            </div>
        </div>
        <p>{task.task}</p>
      </article>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext) => {
  const { id } = params!;
  const session: any = await getSession({ req });

  if (!session?.vip) {
    return {
      redirect: {
        destination: "/board",
        permanent: false,
      },
    };
  }

  const data = await firebase
    .firestore()
    .collection("tarefas")
    .doc(String(id))
    .get()
    .then((snapshot) => {
      const data = {
        id: snapshot.id,
        created: snapshot.data()?.created,
        createdFormated: format(
          snapshot.data()?.created.toDate(),
          "dd MMMM yyyy"
        ),
        task: snapshot.data()?.task,
        userId: snapshot.data()?.userId,
        name: snapshot.data()?.name,
      };

      return JSON.stringify(data);
    })
    .catch(() => {
      return {}
    })

    if(Object.keys(data).length === 0){
      return {
        redirect: {
          destination: "/board",
          permanent: false,
        },
      };
    }

  return {
    props: { data },
  };
};
