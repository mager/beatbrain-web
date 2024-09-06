import { getSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import { AppProvider } from "../context/AppContext";
import { AppContext } from "next/app";
import App from "next/app";
import "./global.css";

interface MyAppProps extends AppProps {
  data: any;
}

const MyApp = ({ Component, pageProps, data }: MyAppProps) => {
  return (
    <SessionProvider session={pageProps.session}>
      <AppProvider initialData={data}>
        <Component {...pageProps} />
      </AppProvider>
    </SessionProvider>
  );
};

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  const session = await getSession(appContext.ctx);
  let data = null;
  if (session) {
    // Fetch data only if session exists
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    data = await res.json();
  }

  return { ...appProps, pageProps: { ...appProps.pageProps, session, data } };
};

export default MyApp;
