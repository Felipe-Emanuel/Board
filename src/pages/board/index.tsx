import { FormEvent, useState } from "react";
import styles from "./styles.module.scss";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";

import firebase from "@/services/direbaseConnection";

import { Supportbutton } from "@/components/SupportButton";
import {
  FiPlus,
  FiCalendar,
  FiEdit2,
  FiTrash,
  FiClock,
  FiX,
} from "react-icons/Fi";
import Link from "next/link";

type TaskList = {
  id: string;
  created: string | Date;
  createdFormated?: string;
  task: string;
  userId: string;
  name: string;
};

interface BoardProps {
  user: {
    name: string;
    id: string;
    vip: boolean;
    lastDonate: string | Date;
  };
  data: string;
}

export default function Board({ user, data }: BoardProps) {
  const [inputValue, setInputValue] = useState("");
  const [taskList, setTaskList] = useState<TaskList[]>(JSON.parse(data));
  const [taskEdit, setTaskEdit] = useState<TaskList | null>(null);

  async function handleAddTask(e: FormEvent) {
    e.preventDefault();

    if (inputValue === "") {
      alert("Escreva alguma tarefa!");
      return;
    }

    if (taskEdit) {
      await firebase
        .firestore()
        .collection("tarefas")
        .doc(taskEdit.id)
        .update({
          task: inputValue,
        })
        .then(() => {
          const data = taskList;
          const taskIndex = taskList.findIndex(
            (item) => item.id === taskEdit.id
          );
          data[taskIndex].task = inputValue;

          setTaskList(data);
          setTaskEdit(null);
          setInputValue("");
        });

      return;
    }

    await firebase
      .firestore()
      .collection("tarefas")
      .add({
        created: new Date(),
        task: inputValue,
        userId: user.id,
        name: user.name,
      })
      .then((doc) => {
        const data = {
          id: doc.id,
          created: new Date(),
          createdFormated: format(new Date(), "dd MMMM yyyy"),
          task: inputValue,
          userId: user.id,
          name: user.name,
        };

        setTaskList([...taskList, data]);
        setInputValue("");
      })
      .catch((err) => {
        console.log("ERRO AO CADASTRAR", err);
      });
  }

  async function handleDelet(id: string) {
    await firebase
      .firestore()
      .collection("tarefas")
      .doc(id)
      .delete()
      .then(() => {
        const deletedTask = taskList.filter((item) => {
          return item.id !== id;
        });

        setTaskList(deletedTask);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function handleEdit(task: TaskList) {
    setTaskEdit(task);
    setInputValue(task.task);
  }

  function handleCancelEdit() {
    setTaskEdit(null);
    setInputValue("");
  }

  return (
    <>
      <Head>
        <title>Minhas tarefas - Board</title>
      </Head>
      <main className={styles.container}>
        {taskEdit && (
          <span className={styles.warnText}>
            <button onClick={handleCancelEdit}>
              <FiX size={30} color="#ff3636" />
            </button>
            Você está editando uma tarefa
          </span>
        )}
        <form onSubmit={handleAddTask}>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            type="text"
            placeholder="Digite sua tarefa"
          />
          <button type="submit">
            <FiPlus size={25} color="#17181f" />
          </button>
        </form>

        <h1>
          Você tem {taskList.length}{" "}
          {taskList.length === 1 ? "tarefa" : "tarefas"}!
        </h1>

        <section>
          {taskList.map((task) => (
            <article key={task.id} className={styles.taskList}>
              <Link href={`/board/${task.id}`}>
                <p>{task.task}</p>
              </Link>
              <div className={styles.actions}>
                <div>
                  <div>
                    <FiCalendar size={20} color="#ffb800" />
                    <time>{task.createdFormated}</time>
                  </div>
                  {user.vip && (
                    <button onClick={() => handleEdit(task)} type="button">
                      <FiEdit2 size={20} color="#fff" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>
                <button onClick={() => handleDelet(task.id)}>
                  <span>Excluir</span>
                  <FiTrash size={20} color="#ff3636" />
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      {user.vip && (
        <div className={styles.vipContainer}>
          <h3>Obrigado por apoiar este projeto</h3>
          <div>
            <FiClock size={28} color="#fff" />
            <time>
              Última doação foi{" "}
              {formatDistance(new Date(user.lastDonate), new Date(), {
                locale: ptBR,
              })}
              .
            </time>
          </div>
        </div>
      )}

      <Supportbutton />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
}: GetServerSidePropsContext) => {
  const session: any = await getSession({ req });

  if (!session?.id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const tasks = await firebase
    .firestore()
    .collection("tarefas")
    .where("userId", "==", session?.id)
    .orderBy("created", "asc")
    .get();

  const data = JSON.stringify(
    tasks.docs.map((u) => {
      return {
        id: u.id,
        createdFormated: format(u.data().created.toDate(), "dd MMMM yyyy"),
        ...u.data(),
      };
    })
  );

  const user = {
    nome: session?.user.name,
    id: session?.id,
    vip: session?.vip,
    lastDonate: session?.lastDonate,
  };

  return {
    props: {
      user,
      data,
    },
  };
};
