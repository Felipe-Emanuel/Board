import "@/styles/global.scss";
import { Header } from "@/components/Header";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function App({ Component, pageProps }: AppProps) {
  const initialOptions = {
    "client-id": "AZfyxfovJK13Zv2Iy5os9XUHlwtNwnYXgPVUxvFalxAKg8hX1lrSR3VvjlqoSLc12skmDPeJAqnCwGwl",
    currency: "BRL",
    intent: "capture"
  }

  return (
    <SessionProvider session={pageProps.session}>
      <PayPalScriptProvider options={initialOptions}>
        <Header />
        <Component {...pageProps} />
      </PayPalScriptProvider>
    </SessionProvider>
  );
}
