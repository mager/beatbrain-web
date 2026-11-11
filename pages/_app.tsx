import { AppProps } from "next/app";
import { AppProvider } from "../context/AppContext";
import Layout from "@components/Layout";
import "./global.css";
import "./song.css";
import "./theme.css";
import { ThemeProvider } from "../context/ThemeContext";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ThemeProvider><AppProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppProvider></ThemeProvider>
  );
};

export default MyApp;
