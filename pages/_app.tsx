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

  // Fetch your data here
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await res.json();
  console.log(data);
  return { ...appProps, data };
};

export default MyApp;
