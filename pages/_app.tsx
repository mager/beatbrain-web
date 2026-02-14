import { AppProps } from "next/app";
import { AppProvider } from "../context/AppContext";
import Layout from "@components/Layout";
import "./global.css";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <AppProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppProvider>
  );
};

export default MyApp;
