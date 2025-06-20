import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import { AppProvider } from "../context/AppContext";
import Layout from "@components/Layout"; 
import "./global.css";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <SessionProvider session={pageProps.session}>
      <AppProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AppProvider>
    </SessionProvider>
  );
};

export default MyApp;