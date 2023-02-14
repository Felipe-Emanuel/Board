import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import styles from "./styles.module.scss";
import firebase from "@/services/direbaseConnection";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";
import rocket from '../../../public/images/rocket.svg';
import Image from "next/image";


interface DonateProps {
  user: {
    name: string;
    id: string;
    image: string;
  };
}

export default function Donate({ user }: DonateProps) {
  const [vip, setVip] = useState(false);

  async function handleSaveDonate() {
    await firebase
      .firestore()
      .collection("users")
      .doc(user.id)
      .set({
        donate: true,
        lastDonate: new Date(),
        image: user.image,
      })
      .then(() => {
        setVip(true);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <>
      <Head>
        <title>Ajude a plataforma Board ficar online!</title>
      </Head>
      <main className={styles.container}>
        <Image src={rocket} alt="Seja apoiador" />

        {vip && (
          <div className={styles.vip}>
            <Image
              width={50}
              height={50}
              src={user.image}
              alt={`Avatar do novo apoiador ${user.name}`}
            />
            <span>
              Obrigado por apoiar, {user.name.split(" ")[0]}! Em até 60 minutos você estará na
              nossa Home...
            </span>
          </div>
        )}

        <h1>Seja um apoiador deste projeto! 🏆</h1>
        <h3>
          Contribua com apenas <span>R$ 1,00</span>
        </h3>
        <strong>
          Apareça na nossa home, tenha funcionalidades exclusivas.
        </strong>

        <PayPalButtons
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: "1",
                  },
                },
              ],
            });
          }}
          onApprove={(data, actions) => {
            return actions.order!.capture().then((details) => {
              //details.payer.name?.given_name
              handleSaveDonate();
            });
          }}
        />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session: any = await getSession({ req });

  if (!session?.id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const user = {
    name: session?.user.name,
    id: session?.id,
    image: session?.user.image,
  };

  return {
    props: { user },
  };
};
